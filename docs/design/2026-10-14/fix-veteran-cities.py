"""City cleanup for Karen's veteran rows loaded 2026-10-14 (same rule as the staging
loader's narrowed cleanCity): a phrase is not a city. Keep a real town when the
field starts with one ("Holden / Bangor area" -> Holden, "Salt Lake City area" ->
Salt Lake City); phrases, regions, counties and state names become statewide
(city NULL, geo_precision 'state'); towns that start with a direction stay
(North Little Rock, South Windsor, West Palm Beach). The original text is kept in
internal_notes as "location: ...". Writes fix-cities.sql (UPDATEs by id) and
unfix-cities.sql (restores the loaded values).
Usage: python3 fix-veteran-cities.py loaded-cities.json places.json OUTDIR STAMP
"""
import json, re, sys, pathlib
rows = json.load(open(sys.argv[1]))[0]["results"]
P = json.load(open(sys.argv[2])); out = pathlib.Path(sys.argv[3]); stamp = sys.argv[4]
STATE_NAMES = {"alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware","florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky","louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi","missouri","montana","nebraska","nevada","new hampshire","new jersey","new mexico","new york","north carolina","north dakota","ohio","oklahoma","oregon","pennsylvania","rhode island","south carolina","south dakota","tennessee","texas","utah","vermont","virginia","washington","west virginia","wisconsin","wyoming"}
PHRASE = re.compile(r"statewide|location varies|various|multiple|not published|contact organizer|communities|nationwide|online|virtual", re.I)
REGION_WORDS = {"puget sound", "triangle", "greater triangle", "coast", "gulf coast", "lowcountry", "upstate", "everglades", "dmv"}
DIRECTION = re.compile(r"^(north|south|east|west|central|northern|southern|eastern|western|upper|lower|greater|southeast|southwest|northeast|northwest)\s+(.*)$", re.I)
def norm(s): return re.sub(r"\s+", " ", s.lower().replace(".", "").replace("saint ", "st ").replace("fort ", "ft ")).strip()
def known(city, st): return f"{st}|{norm(city)}" in P
def is_region(c):
    l = c.lower().strip()
    if re.search(r"\bcounty$|\bcorridor$", l) or l in REGION_WORDS: return True
    if any(l == s or l.startswith(s + " ") for s in STATE_NAMES): return True      # "South Carolina Lowcountry"
    m = DIRECTION.match(l)                                                         # "North Texas", "Eastern Maine"
    return bool(m and (m.group(2) in STATE_NAMES or m.group(2) in REGION_WORDS))   # but not "North Hills", "South Windsor"
def clean(city, st):
    if not city: return None
    first = re.split(r"\s*/\s*", city.strip())[0].strip()
    if PHRASE.search(first): return None
    cand = re.sub(r"\s+(metro area|metro|area|region|regional)$", "", first, flags=re.I).strip()
    if not cand: return None
    if known(cand, st): return cand            # a real place in that state (Washington, DC included)
    if is_region(cand) or cand.lower() in STATE_NAMES: return None
    return cand                                # an unlisted town (East Haddam, South Windsor): keep it
def q(v): return "NULL" if v is None else "'" + str(v).replace("'", "''") + "'"
fix, unfix, changes = [], [], []
for r in rows:
    old = r["city"]
    if old is None: continue
    new = clean(old, r["state"])
    if new == old: continue
    changes.append((old, new))
    geo = "'state'" if new is None else "geo_precision"
    fix.append(f"UPDATE organizations SET city = {q(new)}, geo_precision = {geo}, internal_notes = COALESCE(internal_notes, '') || {q(' || location: ' + old)}, updated_at = {q(stamp)} WHERE id = {q(r['id'])} AND primary_data_source LIKE 'Karen 2026-09-02 veteran %';")
    unfix.append(f"UPDATE organizations SET city = {q(old)}, geo_precision = NULL WHERE id = {q(r['id'])};")
out.joinpath("fix-cities.sql").write_text("\n".join(fix) + "\n")
out.joinpath("unfix-cities.sql").write_text("\n".join(unfix) + "\n")
kept = sum(1 for o, n in changes if n); nulled = sum(1 for o, n in changes if n is None)
print(f"{len(changes)} rows change: {kept} to a town, {nulled} to statewide")
for o, n in changes[:200]: print(f"  {o!r:45s} -> {n!r}")
