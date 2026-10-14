#!/usr/bin/env python3
"""Sync the sport icons from Alec's Google Drive set into the site.

Source of truth: Google Drive, Website / ASNM Flat Vector Logo / SVGs. One SVG
per sport, named for the sport ("Equine Therapy.svg"), 47 in all: 45 sport keys
plus Grants and Events. When two sports use the same drawing, each still has its
own file, titled for its sport (Alec, 2026-10-14).

Download the folder (for example with
  gog drive download <id> --out "<name>"
for each file), then run:

  python3 scripts/sport-icons-sync.py <folder with the Drive SVGs>

It checks every file (512 x 512 viewBox, one colour through currentColor, a
title, no scripts, images or outside references), checks that the sports that
share a drawing still share it, copies each SVG unchanged to
public/emblems/sports/<key>.svg, renders <key>.png (512 px, transparent, for
email and social cards), writes SOURCES.tsv (key, Drive file, sha256) and
index.json (the keys), and removes any icon file that is not in the set.
Needs rsvg-convert (librsvg); pngquant makes the PNGs smaller when present.
"""
import hashlib, json, pathlib, re, shutil, subprocess, sys, tempfile

# Sport key (the D1 sports table, plus multi, grant, event) -> Drive file name.
DRIVE = {
    "amputeesports": "Amputee Sports", "archery": "Archery", "art-therapy": "Art Therapy",
    "baseball": "Baseball", "basketball": "Basketball", "beepbaseball": "Beep Baseball",
    "blindsports": "Blind Sports", "boccia": "Boccia", "climbing": "Climbing", "curling": "Curling",
    "cycling": "Cycling", "dance": "Wheelchair Dance", "equestrian": "Horseback Riding",
    "equestrianvaulting": "Equestrian Vaulting", "equine-therapy": "Equine Therapy",
    "event": "Events", "fencing": "Fencing", "football": "Wheelchair Football", "goalball": "Goalball",
    "golf": "Golfing", "grant": "Grants", "handball": "Handball", "handcycling": "Handcycling",
    "lacrosse": "Lacrosse", "martialarts": "Martial Arts", "multi": "Multi Sport",
    "nordicskiing": "Nordic Skiing", "pickleball": "Pickleball", "powerlifting": "Weightlifting",
    "rowing": "Rowing and paddle", "rugby": "Rugby", "running": "Racing", "sailing": "Sailing",
    "shooting": "Shooting Sports", "skiing": "Snow Skiing", "sledhockey": "Sled Hockey",
    "soccer": "Soccer", "softball": "Softball", "surfing": "Surfing", "swimming": "Swimming",
    "tennis": "Tennis", "trackfield": "Track and Field", "triathlon": "Triathlon",
    "veteran-meetup": "Veteran Meetup", "volleyball": "Sitting Volleyball",
    "waterskiing": "Water Skiing", "wheelchairracing": "Wheelchair Racing",
}
# Sports that use another sport's drawing (each still has its own file).
SHARED = {
    "equine-therapy": "equestrian", "equestrianvaulting": "equestrian", "blindsports": "goalball",
    "handcycling": "cycling", "surfing": "multi", "wheelchairracing": "trackfield",
}
INK = "#1A1A1A"


def drawing(svg):
    """The path data, which is what two files must share to be the same drawing."""
    return "".join(re.findall(r'\sd="([^"]+)"', svg))


def check(key, svg):
    problems = []
    if not re.match(r'^<svg xmlns="http://www\.w3\.org/2000/svg" viewBox="0 0 512 512"', svg):
        problems.append("viewBox is not 0 0 512 512")
    if not re.search(r"<title>[^<]+</title>", svg):
        problems.append("no title")
    if re.search(r"<script|<image|<foreignObject|<style|href=|url\(|@import", svg, re.I):
        problems.append("script, image, style or outside reference")
    fills = set(re.findall(r'fill="([^"]+)"', svg))
    if fills - {"currentColor"}:
        problems.append(f"colours other than currentColor: {sorted(fills - {'currentColor'})}")
    if "<path" not in svg:
        problems.append("no paths")
    if len(svg.encode()) > 32 * 1024:
        problems.append(f"{len(svg.encode())} bytes")
    return problems


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = pathlib.Path(sys.argv[1])
    root = pathlib.Path(__file__).resolve().parents[1]
    out = root / "public/emblems/sports"
    out.mkdir(parents=True, exist_ok=True)

    svgs, bad = {}, []
    for key, name in DRIVE.items():
        f = src / f"{name}.svg"
        if not f.exists():
            bad.append(f"{key}: missing {f.name}")
            continue
        svg = f.read_text()
        for p in check(key, svg):
            bad.append(f"{key} ({f.name}): {p}")
        svgs[key] = svg
    extra = sorted(p.name for p in src.glob("*.svg") if p.stem not in DRIVE.values())
    if extra:
        bad.append(f"files in the folder that no sport uses: {extra}")
    for key, base in SHARED.items():
        if key in svgs and base in svgs and drawing(svgs[key]) != drawing(svgs[base]):
            bad.append(f"{key} no longer shares {base}'s drawing (update SHARED if that is on purpose)")
    by_drawing = {}
    for key, svg in svgs.items():
        by_drawing.setdefault(drawing(svg), []).append(key)
    for keys in by_drawing.values():
        if len(keys) > 1 and not all(SHARED.get(k) in keys or k in SHARED.values() for k in keys):
            bad.append(f"{keys} share a drawing but SHARED does not say so")
    if bad:
        sys.exit("Not synced:\n  " + "\n  ".join(bad))

    have_pngquant = shutil.which("pngquant")
    rows = ["key\tdrive_file\tsha256"]
    with tempfile.TemporaryDirectory() as tmp:
        for key, svg in svgs.items():
            (out / f"{key}.svg").write_text(svg)
            painted = pathlib.Path(tmp) / f"{key}.svg"
            painted.write_text(svg.replace('fill="currentColor"', f'fill="{INK}"'))
            raw = pathlib.Path(tmp) / f"{key}.png"
            subprocess.run(["rsvg-convert", "-w", "512", "-h", "512", str(painted), "-o", str(raw)], check=True)
            if have_pngquant:
                subprocess.run(["pngquant", "--force", "--quality", "70-95", "--output", str(out / f"{key}.png"), str(raw)], check=True)
            else:
                shutil.copy(raw, out / f"{key}.png")
            rows.append(f"{key}\t{DRIVE[key]}.svg\t{hashlib.sha256(svg.encode()).hexdigest()}")
    keep = {f"{k}.svg" for k in svgs} | {f"{k}.png" for k in svgs}
    removed = [p.name for p in out.iterdir() if p.suffix in (".svg", ".png") and p.name not in keep]
    for name in removed:
        (out / name).unlink()
    (out / "SOURCES.tsv").write_text("\n".join(rows) + "\n")
    (out / "index.json").write_text(json.dumps(sorted(k for k in svgs if k not in ("grant", "event"))))
    print(f"synced {len(svgs)} icons ({len(by_drawing)} drawings) into {out.relative_to(root)}; removed {len(removed)} stale files")


if __name__ == "__main__":
    main()
