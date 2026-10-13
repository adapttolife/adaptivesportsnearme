"""Sort every listing into one sport from the sports table, then write the
sport-image checklist (public/design/sports.json) and tag each prototype
listing with its sport (sportKey in public/design/programs.json).

Inputs, exported from D1 into one folder (default /tmp/asnm-sports):
  taxonomy.json     SELECT sport_key, name, super_type FROM sports
  staging-rows.json SELECT sport_key AS sport, sport AS sportLabel, name FROM organizations
                    WHERE is_public=1 AND status='active' AND <actionable>   (staging copy)
Live counts come from public/design/programs.json (today's public directory).
"""
import collections, json, pathlib, re, sys

SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/asnm-sports")
ROOT = pathlib.Path(__file__).resolve().parents[3]
tax = {r["sport_key"]: r["name"] for r in json.load(open(SRC / "taxonomy.json"))[0]["results"]}
tax["multi"] = "Multi-sport"

# Most specific first. Matches the label, then the program name.
RULES = [
 ("sledhockey", r"sled\s*hockey|sledge|para\s*ice\s*hockey|ice\s*sled"),
 ("waterskiing", r"water\s*-?\s*ski|wakeboard"),
 ("wheelchairracing", r"wheelchair\s*racing|racing\s*chair"),
 ("handcycling", r"hand\s*cycl"),
 ("nordicskiing", r"nordic|cross[- ]country\s*ski|biathlon"),
 ("skiing", r"\bski(ing|ers?|s)?\b|snowboard|snow\s*sports?|alpine"),
 ("beepbaseball", r"beep\s*-?\s*baseball"),
 ("basketball", r"basketball"),
 ("pickleball", r"pickleball"),
 ("tennis", r"tennis"),
 ("rugby", r"rugby"),
 ("goalball", r"goalball"),
 ("softball", r"softball"),
 ("baseball", r"baseball|miracle\s*league|\bt-?ball\b|kickball"),
 ("soccer", r"soccer|futsal"),
 ("football", r"football"),
 ("volleyball", r"volleyball"),
 ("boccia", r"boccia|bocce"),
 ("handball", r"handball"),
 ("lacrosse", r"lacrosse"),
 ("curling", r"curling"),
 ("fencing", r"\bfenc"),
 ("archery", r"archery"),
 ("shooting", r"shooting|\brifle|\bpistol|trap\s*shoot|\bclay\b"),
 ("powerlifting", r"powerlift|weightlift|weight\s*lift"),
 ("triathlon", r"triathlon|paratri|duathlon|\btri\b"),
 ("trackfield", r"track|field\s*events|javelin|discus|shot\s*put"),
 ("running", r"running|marathon|\brun\b|\b5k\b|road\s*race|\bachilles\b"),
 ("cycling", r"cycl|\bbik(e|es|ing)\b|tandem"),
 ("rowing", r"\brow(ing|ers?)?\b|kayak|canoe|paddl|dragon\s*boat"),
 ("sailing", r"\bsail"),
 ("surfing", r"surf"),
 ("swimming", r"swim|aquatic"),
 ("golf", r"\bgolf"),
 ("climbing", r"climb"),
 ("equine-therapy", r"equine\s*therap|equine[- ]assisted"),
 ("equestrian", r"equestrian|therapeutic\s*riding|\briding\b|horse|hippotherapy"),
 ("art-therapy", r"art\s*therap|creative\s*arts?"),
 ("veteran-meetup", r"meet\s*-?\s*up|peer\s*support"),
 ("martialarts", r"martial|karate|judo|taekwondo|jiu[- ]?jitsu|self[- ]defen|boxing"),
 ("dance", r"\bdanc"),
 ("amputeesports", r"amputee"),
 ("blindsports", r"\bblind|visually\s*impaired"),
]
COMP = [(k, re.compile(p, re.I)) for k, p in RULES]
ALIAS = {"wheelchair_basketball": "basketball", "wheelchair_rugby": "rugby", "track_and_field": "trackfield"}

def classify(row):
    key = ALIAS.get((row.get("sport") or "").lower(), (row.get("sport") or "").lower())
    if key in tax and key != "multi":
        return key
    for text in (row.get("sportLabel") or "", row.get("name") or ""):
        for k, rx in COMP:
            if rx.search(text):
                return k
    return "multi"

# Plain names and what each image has to stand for, from how the listings describe themselves.
SHOW = {
 "multi": ("Multi-sport", "Programs that offer several sports. The biggest group on the site."),
 "tennis": ("Tennis", "Wheelchair and adaptive tennis."),
 "soccer": ("Soccer", "Mostly TOPSoccer youth programs, some power soccer."),
 "baseball": ("Baseball", "Many are Miracle League fields."),
 "equestrian": ("Horseback riding", "Adaptive and therapeutic riding."),
 "basketball": ("Basketball", "Wheelchair basketball."),
 "rowing": ("Rowing and paddling", "Rowing, kayaking and canoeing."),
 "sledhockey": ("Sled hockey", ""),
 "skiing": ("Skiing", "Sit-skiing, snowboarding and snow sports."),
 "swimming": ("Swimming", "Swim lessons and aquatics."),
 "equine-therapy": ("Equine therapy", "Working with horses, not riding."),
 "golf": ("Golf", ""),
 "cycling": ("Cycling", "Handcycles, adaptive bikes and mountain biking."),
 "archery": ("Archery", ""),
 "sailing": ("Sailing", ""),
 "blindsports": ("Blind sports", "Sports for blind and low-vision athletes."),
 "trackfield": ("Track and field", ""),
 "surfing": ("Surfing", ""),
 "fencing": ("Fencing", "Wheelchair fencing."),
 "climbing": ("Climbing", ""),
 "rugby": ("Rugby", "Wheelchair rugby."),
 "triathlon": ("Triathlon", "Para triathlon."),
 "martialarts": ("Martial arts", ""),
 "running": ("Running", ""),
 "pickleball": ("Pickleball", ""),
 "amputeesports": ("Amputee sports", ""),
 "waterskiing": ("Water skiing", "Water skiing and tubing."),
 "goalball": ("Goalball", "A team ball sport for blind players."),
 "volleyball": ("Volleyball", "Sitting volleyball."),
 "wheelchairracing": ("Wheelchair racing", ""),
 "football": ("Football", "Flag and wheelchair football."),
 "curling": ("Curling", "Wheelchair curling."),
 "beepbaseball": ("Beep baseball", "Baseball for blind players."),
 "boccia": ("Boccia", ""),
 "nordicskiing": ("Nordic skiing", "Cross-country sit-skiing."),
 "shooting": ("Shooting sports", "Includes adaptive hunting."),
 "veteran-meetup": ("Veteran meetups", ""),
 "art-therapy": ("Art therapy", ""),
 "softball": ("Softball", "Could share the baseball image."),
 "lacrosse": ("Lacrosse", ""),
 "handcycling": ("Handcycling", ""),
 "equestrianvaulting": ("Equestrian vaulting", ""),
 "powerlifting": ("Powerlifting", ""),
 "dance": ("Wheelchair dance", ""),
 "handball": ("Handball", ""),
}
assert set(SHOW) == set(tax), set(SHOW) ^ set(tax)

prog_path = ROOT / "public/design/programs.json"
prog = json.load(open(prog_path))
stag = json.load(open(SRC / "staging-rows.json"))[0]["results"]
for p in prog["items"]:
    p["sportKey"] = classify(p)
json.dump(prog, open(prog_path, "w"), separators=(",", ":"))

live = collections.Counter(p["sportKey"] for p in prog["items"])
stage = collections.Counter(classify(r) for r in stag)
old = {p.stem.removeprefix("athlete-") for p in (ROOT / "public/emblems").glob("athlete-*.svg")}
order = sorted(tax, key=lambda k: (-live[k], -stage[k], SHOW[k][0]))
covered = 0
rows = []
for k in order:
    group = "first" if covered < 0.85 * len(prog["items"]) and live[k] else "next" if live[k] else "staging" if stage[k] else "later"
    covered += live[k]
    # A listing to show the art on: verified and placed at its city when we have one.
    pool = sorted((p for p in prog["items"] if p["sportKey"] == k), key=lambda p: (p["verification"] != "verified", p.get("px") is None, p["name"]))
    rows.append({"key": k, "name": SHOW[k][0], "note": SHOW[k][1], "live": live[k], "staging": stage[k],
                 "old": k in old, "group": group, "example": pool[0]["id"] if pool else None})
out = {"generated": prog.get("generated"), "liveTotal": len(prog["items"]), "stagingTotal": len(stag), "sports": rows}
json.dump(out, open(ROOT / "public/design/sports.json", "w"), indent=1)
for i, r in enumerate(rows, 1):
    print(f"{i:>2} {r['group']:8} {r['key']:18} {r['live']:>4} {r['staging']:>4} {r['name']}")
