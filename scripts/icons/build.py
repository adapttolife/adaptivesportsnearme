"""Write the site's icons: public/emblems/sports/<key>.svg (animated) and <key>.png.

  /tmp/pv/bin/python scripts/icons/build.py [keys...]

The SVG is what the site shows (an <img>, so motion plays on load). The PNG is a
512 px transparent render of the rest pose for email and social cards. Every
key in KEYS must have a set/<key>.py; the build stops if one is missing.
"""
import importlib, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import kit

ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "public", "emblems", "sports")

# The sport keys in public/listing-art.js (SPORTS) plus the grant and event art.
KEYS = [
    "amputeesports", "archery", "art-therapy", "baseball", "basketball", "beepbaseball",
    "blindsports", "boccia", "climbing", "curling", "cycling", "dance", "equestrian",
    "equestrianvaulting", "equine-therapy", "fencing", "football", "goalball", "golf",
    "handball", "handcycling", "lacrosse", "martialarts", "multi", "nordicskiing",
    "pickleball", "powerlifting", "rowing", "rugby", "running", "sailing", "shooting",
    "skiing", "sledhockey", "soccer", "softball", "surfing", "swimming", "tennis",
    "trackfield", "triathlon", "veteran-meetup", "volleyball", "waterskiing",
    "wheelchairracing", "grant", "event",
]


def build(key):
    mod = importlib.import_module("set." + key.replace("-", "_"))
    ic = mod.build()
    assert ic.key == key, f"set/{key}.py builds '{ic.key}'"
    svg = kit.render(ic)
    static = kit.render(ic, static=True)
    with open(os.path.join(OUT, key + ".svg"), "w") as f:
        f.write(svg)
    with tempfile.TemporaryDirectory() as tmp:
        s, p = os.path.join(tmp, "s.svg"), os.path.join(tmp, "p.png")
        open(s, "w").write(static)
        subprocess.run(["rsvg-convert", "-w", "512", "-h", "512", s, "-o", p], check=True)
        subprocess.run(["pngquant", "--force", "--quality", "70-95", "--output", os.path.join(OUT, key + ".png"), p], check=True)
    return len(svg)


def main(keys):
    keys = keys or KEYS
    missing = [k for k in keys if not os.path.exists(os.path.join(HERE, "set", k.replace("-", "_") + ".py"))]
    if missing:
        sys.exit("missing icons: " + ", ".join(missing))
    total = 0
    for k in keys:
        n = build(k)
        total += n
        print(f"{k:20s} {n / 1024:5.1f} KB")
    print(f"{len(keys)} icons, {total / 1024:.0f} KB of SVG")


if __name__ == "__main__":
    main(sys.argv[1:])
