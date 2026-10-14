"""Karen Atkinson's veteran research -> prototype listings for /design/c2
(public/design/c2/data/veterans.json). Mirrors what was loaded into production
on 2026-10-14 (build-veterans-sql.py + fix-veteran-cities.py): same files, same
grouping (one listing per organization and city), same ids, same skips
(already in production), same cross-file merge (one listing under both sports),
same city rule. Adds the structured details the prototype's listing page shows
(when, where as a venue name only, format, cost, who) and city coordinates.
Usage: python3 build-veterans.py DIR prod-orgs.json
"""
import csv, json, re, sys, uuid, pathlib, collections, importlib.util
ROOT = pathlib.Path(__file__).resolve().parents[3]
HERE = pathlib.Path(__file__).resolve().parent
src, prod_json = pathlib.Path(sys.argv[1]), sys.argv[2]
P = json.load(open(ROOT / "public/design/places.json"))
# Reuse the production city rule exactly.
spec = importlib.util.spec_from_file_location("fixc", HERE / "fix-veteran-cities.py")
src_fix = open(HERE / "fix-veteran-cities.py").read()
fixns = {}
exec(src_fix.split("rows = json.load")[0], fixns)               # imports + docstring
fixns["P"] = P
exec(src_fix[src_fix.index("STATE_NAMES = "):src_fix.index("def q(v):")], fixns)
city_clean = fixns["clean"]

FILES = [
    ("meetups.csv", "veteran-meetup", "karen-veteran-meetups", "audience", None, "Recurring meetup or group"),
    ("equine.csv", "equine-therapy", "karen-veteran-equine", "population_served", "equine_modality", None),
    ("art.csv", "art-therapy", "karen-veteran-art", "population_served", "art_modality", None),
]
NAMES = json.load(open(ROOT / "public/design/states.json")).get("names") or {}
PHONE = re.compile(r"\(?\b\d{3}\)?[-. ]\d{3}[-.]\d{4}\b"); EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
def clean(s): return re.sub(r"\s+", " ", EMAIL.sub("the program", PHONE.sub("the program", (s or ""))).replace("’", "'").replace("—", ", ").replace("–", "-")).strip(" ,")
def nurl(u): return re.sub(r"^https?://(www\.)?", "", (u or "").strip().lower()).rstrip("/")
def venue(s):
    v = clean(s)
    if not v or re.search(r"\d{2,}\s+\w|\b\d{5}\b|\b(st|street|ave|avenue|rd|road|dr|drive|blvd|hwy|suite|ste)\b\.?(\s|,|$)", v, re.I): return ""
    return v
def geocode(city, st):
    if not city: return None
    for v in [city.lower(), city.lower().replace(".", ""), city.lower().replace("saint ", "st ").replace("st. ", "st "), city.lower().replace("fort ", "ft ")]:
        hit = P.get(f"{st}|{re.sub(r'\s+', ' ', v).strip()}")
        if hit: return hit
    return None
prod = json.load(open(prod_json))[0]["results"]
have_url = {nurl(p["website_url"]) for p in prod if p.get("website_url")}
have_name = {(clean(p["name"]).lower(), p.get("state")) for p in prod}

items, prev_url, prev_place, report = collections.OrderedDict(), {}, {}, []
for fname, key, ns, aud, how_col, _ in FILES:
    rows = list(csv.DictReader(open(src / fname, encoding="utf-8-sig")))
    groups = collections.OrderedDict()
    for r in rows:
        groups.setdefault((clean(r["organization_name"]).lower(), clean(r["program_location_city"]).lower(), r["program_location_state"].strip()), []).append(r)
    cur_url, cur_place, n_new, n_merge = {}, {}, 0, 0
    for (name_l, city_l, st), rs in groups.items():
        r = rs[0]; name = clean(r["organization_name"])
        urls = [clean(x[c]) for c in ("website", "source_url") for x in rs if clean(x[c]).startswith("http")]
        web = next((u for u in urls if not re.search(r"donat|\.pdf($|\?)", u, re.I)), urls[0] if urls else None)
        if (web and nurl(web) in have_url) or (name.lower(), st) in have_name: continue
        def merged(col):
            seen, acc = set(), []
            for x in rs:
                for part in re.split(r"\s*\|\s*", clean(x.get(col) or "")):
                    if part and part.lower() not in seen: seen.add(part.lower()); acc.append(part)
            return " | ".join(acc)
        meet = {"program": merged("program_or_service"), "what": clean(r["what_participants_do"]), "how": merged(how_col) if how_col else "",
                "when": merged("schedule_or_frequency"), "where": venue(r["meetup_or_service_location"]), "format": clean(r["delivery_mode"]),
                "cost": clean(r["cost_or_access"]), "who": merged(aud), "kind": key}
        hit = (web and prev_url.get((nurl(web), st))) or prev_place.get((name_l, city_l, st))
        if hit:
            it = items[hit]
            it.setdefault("also", []).append(meet); it["sports"].append(key); n_merge += 1
            continue
        raw_city = clean(r["program_location_city"]) or clean(r["organization_base_city"])
        statewide = bool(re.fullmatch(r"statewide", raw_city, re.I))
        city = None if statewide else city_clean(raw_city, st)
        ll = geocode(city, st)
        oid = str(uuid.uuid5(uuid.NAMESPACE_URL, f"asnm:{ns}:{name_l}|{city_l}|{st}"))
        items[oid] = {"id": oid, "name": name, "sport": key, "sportKey": key, "sports": [key], "website": web, "city": city, "state": st,
                      "desc": meet["what"], "cost": meet["cost"] or None, "ages": None, "equipment": None,
                      "verification": "unverified", "lastChecked": f"{clean(r['last_verified']) or '2026-09-02'}T12:00:00.000Z",
                      "listedAt": "2026-10-14T00:00:00.000Z", "type": clean(r["organization_type"]),
                      "geoPrecision": "state" if city is None else None, "lat": ll[0] if ll else None, "lng": ll[1] if ll else None,
                      "geo": "city" if ll else None, "px": None, "py": None, "source": "Adaptive Sports Near Me research", "meet": meet}
        if web: cur_url[(nurl(web), st)] = oid
        cur_place[(name_l, city_l, st)] = oid
        n_new += 1
    prev_url.update(cur_url); prev_place.update(cur_place)
    report.append(f"{fname}: {n_new} listings, {n_merge} merged into an earlier file's listing")
out = {"generated": "2026-10-14", "source": "Karen Atkinson, Drive Programs folder (2026-09-02): veteran meetups, equine therapy, art therapy; matches production 2026-10-14", "items": list(items.values())}
json.dump(out, open(ROOT / "public/design/c2/data/veterans.json", "w"), separators=(",", ":"))
its = out["items"]
print("\n".join(report)); print(f"total {len(its)}; placed {sum(1 for i in its if i['lat'] is not None)}; statewide {sum(1 for i in its if i['city'] is None)}")
