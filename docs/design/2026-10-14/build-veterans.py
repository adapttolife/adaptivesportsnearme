"""Karen Atkinson's veteran meetups (Drive: Adaptive Sports Near Me > Programs >
"Veterans Meetup and activites.csv", Sept 2, 2026, 484 rows) -> prototype listings
for /design/c2 (public/design/c2/data/veterans.json).

Rules: one listing per organization and city (repeats merge their programs);
the contact column never leaves this script (the directory shows no emails or
phones); rows already in the public directory (same website and name) are
skipped; status stays "not yet verified" (staging holds them as pending);
the date is Karen's check of the source, Sept 2, 2026.
Usage: python3 build-veterans.py meetups.csv
"""
import csv, json, re, sys, uuid, pathlib, collections
ROOT = pathlib.Path(__file__).resolve().parents[3]
src = sys.argv[1]
rows = list(csv.DictReader(open(src, encoding="utf-8-sig")))
P = json.load(open(ROOT / "public/design/places.json"))
prog = json.load(open(ROOT / "public/design/programs.json"))["items"]
STATES = json.load(open(ROOT / "public/design/states.json"))
NAMES = {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","DC":"District of Columbia","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming"}

def clean(s): return re.sub(r"\s+", " ", (s or "").replace("’", "'")).strip()
def keyvars(city):
    c = clean(city).lower()
    out = []
    for part in [c, re.split(r"\s*[/,(]\s*", c)[0]]:
        for v in [part, part.replace(".", ""), part.replace("saint ", "st ").replace("st. ", "st "), part.replace("fort ", "ft "),
                  re.sub(r"\s+(area|county|metro)$", "", part)]:
            v = re.sub(r"\s+", " ", v).strip()
            if v and v not in out: out.append(v)
    return out
def geocode(city, st):
    if not city or re.search(r"statewide|various|multiple|online|virtual", city, re.I): return None
    for v in keyvars(city):
        hit = P.get(f"{st}|{v}")
        if hit: return hit
    return None
# The site shows city and state only (no street addresses), so "where" keeps a venue
# name ("Alabama Veterans Museum and Archives") and drops anything that looks like an address.
def venue(s):
    v = clean(s)
    if not v or re.search(r"\d{2,}\s+\w|\b\d{5}\b|\b(st|street|ave|avenue|rd|road|dr|drive|blvd|hwy|suite|ste)\b\.?(\s|,|$)", v, re.I): return ""
    return v
def host(u): return re.sub(r"^https?://(www\.)?", "", (u or "").lower()).split("/")[0]

have = {(host(p.get("website")), clean(p.get("name")).lower()) for p in prog}
groups = collections.OrderedDict()
for r in rows:
    k = (clean(r["organization_name"]).lower(), clean(r["program_location_city"]).lower(), r["program_location_state"].strip())
    groups.setdefault(k, []).append(r)

items, skipped = [], 0
for (name_l, city_l, st), rs in groups.items():
    r = rs[0]
    name = clean(r["organization_name"])
    # Prefer a program page over a donate page or a PDF when a merged listing has several links.
    urls = [clean(x[c]) for c in ("website", "source_url") for x in rs if clean(x[c]).startswith("http")]
    web = next((u for u in urls if not re.search(r"donat|\.pdf($|\?)", u, re.I)), urls[0] if urls else None)
    if (host(web), name.lower()) in have: skipped += 1; continue
    def merged(col):
        seen, out = set(), []
        for x in rs:
            for part in re.split(r"\s*\|\s*", clean(x[col])):
                if part and part.lower() not in seen: seen.add(part.lower()); out.append(part)
        return " | ".join(out)
    city = clean(r["program_location_city"]) or clean(r["organization_base_city"])
    statewide = bool(re.fullmatch(r"statewide", city, re.I))
    ll = None if statewide else geocode(city, st)
    items.append({
        "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"asnm:karen-veteran-meetups:{name_l}|{city_l}|{st}")),
        "name": name, "sport": "veteran-meetup", "sportKey": "veteran-meetup", "sportLabel": "Veteran meetup",
        "website": web, "city": None if statewide else city, "state": st, "stateName": NAMES.get(st, st),
        "desc": clean(r["what_participants_do"]), "cost": clean(r["cost_or_access"]) or None, "ages": None, "equipment": None,
        "verification": "unverified", "lastChecked": f"{clean(r['last_verified']) or '2026-09-02'}T12:00:00.000Z",
        "listedAt": "2026-09-02T12:00:00.000Z", "type": clean(r["organization_type"]),
        "geoPrecision": "state" if statewide else None,
        "lat": ll[0] if ll else None, "lng": ll[1] if ll else None, "geo": "city" if ll else None, "px": None, "py": None,
        "source": "Adaptive Sports Near Me research",
        "meet": {
            "program": merged("program_or_service"), "what": clean(r["what_participants_do"]),
            "when": merged("schedule_or_frequency"), "where": venue(r["meetup_or_service_location"]),
            "format": clean(r["delivery_mode"]), "cost": clean(r["cost_or_access"]), "who": merged("audience"),
            "kind": clean(r["listing_type"]),
        },
    })
out = {"generated": "2026-10-14", "source": "Karen Atkinson, Veterans Meetup and activites.csv (Drive, 2026-09-02)", "items": items}
json.dump(out, open(ROOT / "public/design/c2/data/veterans.json", "w"), separators=(",", ":"))
placed = sum(1 for i in items if i["lat"] is not None)
print(f"rows {len(rows)} -> groups {len(groups)} -> listings {len(items)} (skipped {skipped} already listed); placed at a city {placed}; statewide {sum(1 for i in items if i['geoPrecision']=='state')}; states {len({i['state'] for i in items})}")
