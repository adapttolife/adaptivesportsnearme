#!/usr/bin/env python3
"""Postgres -> D1 migration for the ASNM directory. Stdlib only.

Reads the local asnm Postgres DB (creds from /srv/asnm/.env), cleans and
transforms the 2,095 raw orgs, and emits SQL for `wrangler d1 execute --file`.

Cleaning (decided 2026-07-02 from live-data audit):
  - Drop scraped-navigation junk rows ("Leadership", "Governance", "Athlete
    Excellence", "Sport Advancement", "Community Growth" x51 states) and
    pagination artifacts ("T to Z").
  - The Postgres `city` column mostly holds STATE NAMES (source import quirk);
    fold those into state, keep real cities as cities.
  - Dedup on (lower(name), state): keep the first org, merge source links.
  - Derive primary sport (ported from asnm scripts/export-snapshot.sh CASE,
    extended with pickleball/football/waterski/goalball keywords).
  - Geocode at STATE-CENTROID precision (geo_precision='state') — the raw data
    has essentially no street/city geo; the enrich lane backfills later.

Usage: python3 scripts/pg-to-d1.py [--out out/d1-seed.sql]
"""
import csv, io, json, os, re, subprocess, sys, uuid
from datetime import datetime, timezone

ASNM_ENV = "/srv/asnm/.env"

JUNK_NAMES = {"leadership", "governance", "athlete excellence",
              "sport advancement", "community growth"}
JUNK_RE = re.compile(r"^[A-Z]\s+to\s+[A-Z]$")

STATES = {
 "AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California",
 "CO":"Colorado","CT":"Connecticut","DE":"Delaware","FL":"Florida","GA":"Georgia",
 "HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa",
 "KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland",
 "MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi",
 "MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire",
 "NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina",
 "ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania",
 "RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee",
 "TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington",
 "WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming","DC":"District of Columbia",
 "PR":"Puerto Rico","GU":"Guam","VI":"U.S. Virgin Islands","AS":"American Samoa",
 "MP":"Northern Mariana Islands",
}
NAME_TO_CODE = {v.lower(): k for k, v in STATES.items()}

# Approximate geographic centers, state level only (public-domain figures).
CENTROIDS = {
 "AL":(32.79,-86.83),"AK":(64.07,-152.28),"AZ":(34.27,-111.66),"AR":(34.89,-92.44),
 "CA":(37.18,-119.47),"CO":(38.998,-105.55),"CT":(41.62,-72.73),"DE":(38.99,-75.51),
 "FL":(28.63,-82.45),"GA":(32.64,-83.44),"HI":(20.29,-156.37),"ID":(44.35,-114.61),
 "IL":(40.04,-89.20),"IN":(39.89,-86.28),"IA":(42.08,-93.50),"KS":(38.49,-98.38),
 "KY":(37.53,-85.30),"LA":(31.07,-92.00),"ME":(45.37,-69.24),"MD":(39.06,-76.80),
 "MA":(42.26,-71.81),"MI":(44.35,-85.41),"MN":(46.28,-94.31),"MS":(32.74,-89.67),
 "MO":(38.35,-92.46),"MT":(47.05,-109.63),"NE":(41.54,-99.80),"NV":(39.33,-116.63),
 "NH":(43.68,-71.58),"NJ":(40.19,-74.67),"NM":(34.41,-106.11),"NY":(42.95,-75.53),
 "NC":(35.56,-79.39),"ND":(47.45,-100.47),"OH":(40.29,-82.79),"OK":(35.59,-97.49),
 "OR":(43.93,-120.56),"PA":(40.88,-77.80),"RI":(41.68,-71.56),"SC":(33.92,-80.90),
 "SD":(44.44,-100.23),"TN":(35.86,-86.35),"TX":(31.48,-99.33),"UT":(39.31,-111.67),
 "VT":(44.07,-72.67),"VA":(37.52,-78.85),"WA":(47.38,-120.45),"WV":(38.64,-80.62),
 "WI":(44.62,-89.99),"WY":(42.99,-107.55),"DC":(38.91,-77.02),"PR":(18.22,-66.42),
 "GU":(13.44,144.79),"VI":(18.34,-64.90),"AS":(-14.27,-170.13),"MP":(15.10,145.67),
}

# (source name match, sport) — most-reliable first; ported from export-snapshot.sh.
SOURCE_SPORT = [
 ("NWBA Teams Directory","Wheelchair Basketball"),("USA Hockey Sled Hockey","Sled Hockey"),
 ("Achilles International","Running"),("USRowing","Adaptive Rowing"),
 ("USA Cycling","Adaptive Cycling"),("USA Swimming","Adaptive Swimming"),
 ("USTA/ITF","Wheelchair Tennis"),("USA Archery","Archery"),
 ("USA Volleyball","Sitting Volleyball"),("USATF","Track & Field"),
 ("USA Martial Arts","Martial Arts"),("BISFed USA","Boccia"),
 ("USA Shooting","Shooting Sports"),("USPSA","Shooting Sports"),
 ("USA Fencing","Wheelchair Fencing"),("USABA","Blind Sports"),
]
# (name regex, sport) — order matters; extended beyond the shell CASE.
NAME_SPORT = [
 (r"sled","Sled Hockey"),(r"pickleball","Pickleball"),(r"basketball","Wheelchair Basketball"),
 (r"tennis","Wheelchair Tennis"),(r"rugby","Wheelchair Rugby"),(r"goalball","Goalball"),
 (r"water[- ]?ski","Adaptive Water Skiing"),(r"football","Wheelchair Football"),
 (r"cycl|bike|biking","Adaptive Cycling"),(r"\bski|skiing|snowboard","Adaptive Skiing"),
 (r"swim|aquatic","Adaptive Swimming"),(r"golf","Adaptive Golf"),
 (r"row(ing)?\b","Adaptive Rowing"),(r"climb","Adaptive Climbing"),
 (r"hockey","Sled Hockey"),(r"equestrian|horse|riding","Equestrian"),
 (r"sail","Adaptive Sailing"),(r"surf","Adaptive Surfing"),
 (r"dance|dancing","Adaptive Dance"),(r"archery","Archery"),
 (r"lacrosse","Wheelchair Lacrosse"),(r"softball|baseball","Adaptive Baseball"),
 (r"curling","Wheelchair Curling"),(r"fish","Adaptive Fishing"),
 (r"track|athletics","Track & Field"),
]
# Sport label -> the site's icon/photo key (11-sport launch set). Others: NULL.
SPORT_KEY = {
 "Wheelchair Basketball":"basketball","Wheelchair Tennis":"tennis","Pickleball":"pickleball",
 "Wheelchair Rugby":"rugby","Wheelchair Football":"football","Adaptive Baseball":"baseball",
 "Adaptive Cycling":"cycling","Sled Hockey":"sledhockey","Adaptive Skiing":"skiing",
 "Adaptive Water Skiing":"waterskiing","Goalball":"goalball",
}

def pg_csv(query):
    env = {}
    with open(ASNM_ENV) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k] = v.strip().strip('"').strip("'")
    url = env["DATABASE_URL"]
    out = subprocess.run(
        ["psql", url, "-c", f"\\copy ({query}) to stdout with csv header"],
        capture_output=True, text=True, check=True)
    return list(csv.DictReader(io.StringIO(out.stdout)))

def derive_sport(name, source):
    for s, sport in SOURCE_SPORT:
        if source == s:
            return sport
    low = name.lower()
    for rx, sport in NAME_SPORT:
        if re.search(rx, low):
            return sport
    return "Multi-Sport"

def norm_state(city, state):
    """Returns (city, state_code, state_name). Folds state-names-in-city."""
    code, sname, real_city = None, None, None
    for raw in (state, city):
        if not raw:
            continue
        r = raw.strip()
        if r.upper() in STATES and len(r) == 2:
            code = code or r.upper()
        elif r.lower() in NAME_TO_CODE:
            code = code or NAME_TO_CODE[r.lower()]
        elif raw is city and r:
            real_city = r
    if code:
        sname = STATES[code]
    return real_city, code, sname

def q(v):
    if v is None or v == "":
        return "NULL"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"

def main():
    out_path = sys.argv[sys.argv.index("--out")+1] if "--out" in sys.argv else "out/d1-seed.sql"
    orgs = pg_csv("""select o.organization_id, o.organization_name, o.organization_type,
        o.website_url, o.email, o.phone, o.city, o.state_province, o.zip,
        o.description, o.cost_note, o.equipment_provided, o.ages,
        o.data_quality_rating, o.primary_data_source, o.verification_status,
        o.verification_method, o.status, o.is_public, o.created_at, o.updated_at,
        (select max(checked_at) from link_checks lc
          where lc.organization_id=o.organization_id and lc.ok) as last_ok_at
        from organizations o order by o.organization_name""")
    sources = pg_csv("""select source_id, source_name, source_organization, source_url,
        source_type, coverage_scope, data_quality_rating, record_count, status
        from data_sources""")
    links = pg_csv("""select organization_id, source_id, data_quality_rating,
        date_added, verification_status from organization_data_sources""")
    checks = pg_csv("""select lc.organization_id, o.website_url as url, lc.ok,
        lc.http_status, lc.detail, lc.lane, lc.checked_at
        from link_checks lc join organizations o using (organization_id)
        order by lc.checked_at""")
    queue = pg_csv("""select organization_id, agent_lane as lane, proposed_change,
        evidence, confidence, status, created_at from review_queue""")

    kept, dropped_junk, seen = [], 0, {}
    remap = {}  # dropped-dup org id -> kept org id
    for o in orgs:
        name = o["organization_name"].strip()
        if name.lower() in JUNK_NAMES or JUNK_RE.match(name):
            dropped_junk += 1
            remap[o["organization_id"]] = None
            continue
        city, code, sname = norm_state(o["city"], o["state_province"])
        key = (name.lower(), code)
        if key in seen:
            remap[o["organization_id"]] = seen[key]
            continue
        seen[key] = o["organization_id"]
        sport = derive_sport(name, o["primary_data_source"] or "")
        lat, lng, prec = None, None, None
        if code and code in CENTROIDS:
            lat, lng = CENTROIDS[code]
            prec = "state"
        kept.append(dict(o, _city=city, _state=code, _state_name=sname,
                         _sport=sport, _key=SPORT_KEY.get(sport),
                         _lat=lat, _lng=lng, _prec=prec))

    kept_ids = {o["organization_id"] for o in kept}
    def target(org_id):
        t = remap.get(org_id, org_id)
        return t if t in kept_ids else None

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    def iso(ts):
        return (ts or now).replace(" ", "T")[:19] + "Z" if ts else now

    lines = ["PRAGMA defer_foreign_keys = on;"]
    for s in sources:
        lines.append("INSERT OR REPLACE INTO data_sources VALUES (%s);" % ",".join(q(s[c]) for c in
            ("source_id","source_name","source_organization","source_url","source_type",
             "coverage_scope","data_quality_rating","record_count","status")))
    for o in kept:
        vals = [q(o["organization_id"]), q(o["organization_name"].strip()),
            q(o["organization_type"]), q(o["_sport"]), q(o["_key"]),
            q(json.dumps([o["_sport"]])), q(o["website_url"]), q(o["email"]), q(o["phone"]),
            q(o["_city"]), q(o["_state"]), q(o["_state_name"]), q(o["zip"]),
            q("United States"), q(o["_lat"]), q(o["_lng"]), q(o["_prec"]),
            q(o["description"]), q(o["cost_note"]),
            q(1 if o["equipment_provided"] == "t" else (0 if o["equipment_provided"] == "f" else None)),
            q(o["ages"]), q(o["data_quality_rating"]), q(o["primary_data_source"]),
            q(o["verification_status"] or "unverified"), q(o["verification_method"]),
            q(o["status"] or "active"), q(1 if o["is_public"] != "f" else 0),
            q(iso(o["last_ok_at"]) if o["last_ok_at"] else None),
            q(iso(o["created_at"])), q(iso(o["updated_at"]))]
        lines.append("INSERT OR REPLACE INTO organizations VALUES (%s);" % ",".join(vals))
    linkset = set()
    for l in links:
        t = target(l["organization_id"])
        if not t or (t, l["source_id"]) in linkset:
            continue
        linkset.add((t, l["source_id"]))
        lines.append("INSERT OR REPLACE INTO organization_data_sources VALUES (%s);" % ",".join(
            [q(t), q(l["source_id"]), q(None), q(l["data_quality_rating"]),
             q(iso(l["date_added"]) if l["date_added"] else None),
             q(1 if l["verification_status"] == "verified" else 0)]))
    n_checks = 0
    for c in checks:
        t = target(c["organization_id"])
        if not t:
            continue
        n_checks += 1
        lines.append("INSERT INTO link_checks (organization_id,url,ok,http_status,detail,lane,checked_at) VALUES (%s);" % ",".join(
            [q(t), q(c["url"]), q(1 if c["ok"] == "t" else 0),
             q(int(c["http_status"]) if c["http_status"] else None), q(c["detail"]),
             q(c["lane"] or "validate"), q(iso(c["checked_at"]))]))
    n_queue = 0
    for r in queue:
        t = target(r["organization_id"])
        if not t:
            continue
        n_queue += 1
        lines.append("INSERT INTO review_queue (organization_id,lane,proposed_change,evidence,confidence,status,created_at) VALUES (%s);" % ",".join(
            [q(t), q(r["lane"] or "validate"), q(r["proposed_change"] or "{}"), q(r["evidence"]),
             q(float(r["confidence"]) if r["confidence"] else None),
             q(r["status"] or "pending"), q(iso(r["created_at"]))]))
    lines.append("INSERT INTO pipeline_runs (lane,started_at,finished_at,items_processed,items_flagged,detail) VALUES ('import',%s,%s,%d,0,'pg-to-d1 initial migration: %d raw -> %d kept (%d junk, %d dups merged)');"
        % (q(now), q(now), len(kept), len(orgs), len(kept), dropped_junk, len(orgs)-len(kept)-dropped_junk))

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        f.write("\n".join(lines) + "\n")
    by_state = sum(1 for o in kept if o["_state"])
    by_sport = sum(1 for o in kept if o["_sport"] != "Multi-Sport")
    print(f"raw={len(orgs)} junk={dropped_junk} dups={len(orgs)-len(kept)-dropped_junk} kept={len(kept)}")
    print(f"with_state={by_state} with_specific_sport={by_sport} link_checks={n_checks} review_queue={n_queue}")
    print(f"wrote {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    main()
