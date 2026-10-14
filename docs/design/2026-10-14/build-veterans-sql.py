"""Karen Atkinson's veteran research (Drive, Adaptive Sports Near Me > Programs,
Sept 2, 2026) -> production SQL for asnm-db organizations.

Alec, 2026-10-14: "Yes: load Karen's veteran meetups into the production database
as not verified" and "Yes, I want those loaded the same way" (veteran equine
therapy and art therapy). Files: Veterans Meetup and activites.csv,
us_veteran_equine_therapy_programs.csv, Veteran Art Therapy.csv.

Rules: one listing per organization and city within a file (repeats merge their
programs); skip anything production already lists (same website, or same name
in the same state); an organization an earlier file already added (same website
in the state, or same name and city) stays one listing that shows under both
sports (sports_json) and mentions both programs; public fields are name, type, sport, website, city and state, a
description (programs, what happens, approach, when, who it is for) and cost.
Contacts and street addresses never reach a public column (the venue goes to
internal_notes). Status: verification "pending" (shows "Not yet verified"),
public, active. Idempotent: INSERT OR IGNORE on deterministic ids (the meetup
ids match the /design/c2 prototype). rollback.sql deletes exactly these ids.
Usage: python3 build-veterans-sql.py DIR prod-orgs.json OUTDIR STAMP
  DIR holds meetups.csv, equine.csv, art.csv.
"""
import csv, json, re, sys, uuid, pathlib, collections
src, prod_json, outdir, stamp = pathlib.Path(sys.argv[1]), sys.argv[2], pathlib.Path(sys.argv[3]), sys.argv[4]
FILES = [  # file, sport_key, sport label, id namespace, source tag, audience column, approach column
    ("meetups.csv", "veteran-meetup", "Veteran meetup", "karen-veteran-meetups", "Karen 2026-09-02 veteran meetups", "audience", None),
    ("equine.csv", "equine-therapy", "Equine therapy", "karen-veteran-equine", "Karen 2026-09-02 veteran equine therapy", "population_served", "equine_modality"),
    ("art.csv", "art-therapy", "Art therapy", "karen-veteran-art", "Karen 2026-09-02 veteran art therapy", "population_served", "art_modality"),
]
NAMES = {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","DC":"District of Columbia","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming"}
def clean(s): return re.sub(r"\s+", " ", (s or "").replace("’", "'").replace("—", ", ").replace("–", "-")).strip(" ,")
def nurl(u): return re.sub(r"^https?://(www\.)?", "", (u or "").strip().lower()).rstrip("/")
# The directory shows no phone numbers or emails: in public text they become "the program".
PHONE = re.compile(r"\(?\b\d{3}\)?[-. ]\d{3}[-.]\d{4}\b")
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
def scrub(s): return EMAIL.sub("the program", PHONE.sub("the program", s or ""))
def sentence(s): s = clean(scrub(s)); return s if not s or s[-1] in ".!?" else s + "."
def q(v): return "NULL" if v is None or v == "" else "'" + str(v).replace("'", "''") + "'"
prod = json.load(open(prod_json))[0]["results"]
have_url = {nurl(p["website_url"]) for p in prod if p.get("website_url")}
have_name = {(clean(p["name"]).lower(), p.get("state")) for p in prod}

out = collections.OrderedDict()   # id -> row dict (public columns + _sports + _notes)
prev_url, prev_place = {}, {}     # from EARLIER files only: (url, state) / (name, city, state) -> id
report = []
for fname, key, label, ns, tag, aud_col, how_col in FILES:
    rows = list(csv.DictReader(open(src / fname, encoding="utf-8-sig")))
    groups = collections.OrderedDict()
    for r in rows:
        k = (clean(r["organization_name"]).lower(), clean(r["program_location_city"]).lower(), r["program_location_state"].strip())
        groups.setdefault(k, []).append(r)
    n_new = n_prod = n_merge = 0
    cur_url, cur_place = {}, {}
    for (name_l, city_l, st), rs in groups.items():
        r = rs[0]
        name = clean(r["organization_name"])
        urls = [clean(x[c]) for c in ("website", "source_url") for x in rs if clean(x[c]).startswith("http")]
        web = next((u for u in urls if not re.search(r"donat|\.pdf($|\?)", u, re.I)), urls[0] if urls else None)
        if (web and nurl(web) in have_url) or (name.lower(), st) in have_name: n_prod += 1; continue
        def merged(col):
            seen, acc = set(), []
            for x in rs:
                for part in re.split(r"\s*\|\s*", clean(x.get(col) or "")):
                    if part and part.lower() not in seen: seen.add(part.lower()); acc.append(part)
            return "; ".join(acc)
        progs, what, when, who = scrub(merged("program_or_service")), sentence(r["what_participants_do"]), scrub(merged("schedule_or_frequency")), scrub(merged(aud_col))
        how = scrub(merged(how_col)) if how_col else ""
        note = "; ".join(x for x in [
            f"{tag} (Alec 2026-10-14: list even though not verified)",
            "where: " + clean(r["meetup_or_service_location"]) if clean(r["meetup_or_service_location"]) else "",
            "format: " + clean(r["delivery_mode"]) if clean(r["delivery_mode"]) else "",
            "source: " + clean(r["source_url"]) if clean(r["source_url"]) else "",
            "her check: " + clean(r["verification_status"]) + " (" + clean(r["last_verified"]) + ")",
        ] if x)
        # The same organization in an earlier file (same website in the state, or same name and city):
        # one listing that shows under both sports.
        hit = (web and prev_url.get((nurl(web), st))) or prev_place.get((name_l, city_l, st))
        if hit:
            row = out[hit]
            if key not in row["_sports"]: row["_sports"].append(key)
            extra = [sentence(f"Also {label.lower()}: " + (progs + ". " if progs and progs.lower() != name.lower() else "") + what)]
            if when: extra.append(sentence("When: " + when))
            row["description"] = (row["description"] + " " + " ".join(extra)).strip()
            row["_notes"].append(note); n_merge += 1
            continue
        parts = []
        if progs and progs.lower() != name.lower(): parts.append(sentence("Programs: " + progs))
        parts.append(what)
        if how: parts.append(sentence("Approach: " + how))
        if when: parts.append(sentence("When: " + when))
        if who: parts.append(sentence("Who it's for: " + who))
        city = clean(r["program_location_city"]) or clean(r["organization_base_city"])
        statewide = bool(re.fullmatch(r"statewide", city, re.I))
        oid = str(uuid.uuid5(uuid.NAMESPACE_URL, f"asnm:{ns}:{name_l}|{city_l}|{st}"))
        out[oid] = dict(id=oid, name=name, org_type=clean(r["organization_type"]) or None, sport=label, sport_key=key,
                        website_url=web, city=None if statewide else city, state=st, state_name=NAMES.get(st, st), country="United States",
                        geo_precision="state" if statewide else None, description=" ".join(p for p in parts if p),
                        cost_note=clean(scrub(r["cost_or_access"])) or None, primary_data_source=tag, verification_status="pending",
                        status="active", is_public=1, created_at=stamp, updated_at=stamp, _sports=[key], _notes=[note])
        if web: cur_url[(nurl(web), st)] = oid
        cur_place[(name_l, city_l, st)] = oid
        n_new += 1
    prev_url.update(cur_url); prev_place.update(cur_place)
    report.append(f"{fname}: {len(rows)} rows -> {len(groups)} listings -> {n_new} new, {n_merge} merged into an earlier file's listing, {n_prod} skipped (already in production)")

ins, ids = [], []
for oid, row in out.items():
    cols = {k: v for k, v in row.items() if not k.startswith("_")}
    cols["sports_json"] = json.dumps(row["_sports"])
    cols["internal_notes"] = " || ".join(row["_notes"])
    ins.append("INSERT OR IGNORE INTO organizations (" + ", ".join(cols) + ") VALUES (" + ", ".join(str(v) if k == "is_public" else q(v) for k, v in cols.items()) + ");")
    ids.append(oid)
outdir.mkdir(parents=True, exist_ok=True)
(outdir / "insert-veterans.sql").write_text("\n".join(ins) + "\n")
(outdir / "rollback-veterans.sql").write_text("DELETE FROM organizations WHERE primary_data_source LIKE 'Karen 2026-09-02 veteran %' AND id IN (" + ", ".join(q(i) for i in ids) + ");\n")
(outdir / "ids.json").write_text(json.dumps(ids))
print("\n".join(report)); print(f"total insert {len(ins)}")
