"""High-quality SVGs of Alec's sport drawings.

  python3 scripts/icons/trace.py SRC_DIR [key ...]

SRC_DIR holds Alec's PNGs from Google Drive (Website / ASNM Flat Vector Logo), named as in
the table in public/emblems/sports/README.md (that table is the key -> file map). For each
key this writes public/emblems/sports/<key>.svg and a 512 px transparent <key>.png.

Why these settings: the drawings have soft, slightly wobbly edges and thin white details
(ball seams, the gaps between limbs). The PNG is upscaled 4x, blurred lightly at that scale
(sigma 5 px, about 1.25 px of the original) so the edges come out clean without closing a
thin gap, thresholded at exactly 50% so every stroke keeps its true width, and traced with
potrace. The SVG is one path on a 512 grid, the drawing centred with a 6% margin, filled
with currentColor (black in an <img>; inherits the text colour when inlined).

Every trace is checked against its PNG: the outline must cover the same pixels (IoU of at
least 0.985 at the PNG's own size) or the run stops.

Needs: python3 with pillow and fonttools, potrace, rsvg-convert, pngquant.
"""
import os, re, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageFilter
from fontTools.svgLib.path import parse_path
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.transformPen import TransformPen

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "emblems", "sports")
UP, BLUR, TURD, ALPHA, OPT = 4, 5.0, 120, 1.0, 0.4
SIZE, MARGIN = 512, 0.06
MIN_IOU = 0.985

TITLES = {
    "amputeesports": "Amputee sports", "archery": "Archery", "art-therapy": "Art therapy",
    "baseball": "Baseball", "basketball": "Basketball", "beepbaseball": "Beep baseball",
    "blindsports": "Blind sports", "boccia": "Boccia", "climbing": "Climbing", "curling": "Curling",
    "cycling": "Cycling", "dance": "Wheelchair dance", "equestrian": "Horseback riding",
    "equestrianvaulting": "Equestrian vaulting", "equine-therapy": "Equine therapy", "event": "Events",
    "fencing": "Fencing", "football": "Wheelchair football", "goalball": "Goalball", "golf": "Golf",
    "grant": "Grants", "handball": "Handball", "handcycling": "Handcycling", "lacrosse": "Lacrosse",
    "martialarts": "Martial arts", "multi": "Multi-sport", "nordicskiing": "Nordic skiing",
    "pickleball": "Pickleball", "powerlifting": "Powerlifting", "rowing": "Rowing and paddling",
    "rugby": "Wheelchair rugby", "running": "Running", "sailing": "Sailing", "shooting": "Shooting sports",
    "skiing": "Skiing", "sledhockey": "Sled hockey", "soccer": "Power soccer", "softball": "Softball",
    "surfing": "Surfing", "swimming": "Swimming", "tennis": "Tennis", "trackfield": "Track and field",
    "triathlon": "Triathlon", "veteran-meetup": "Veteran meetups", "volleyball": "Sitting volleyball",
    "waterskiing": "Water skiing", "wheelchairracing": "Wheelchair racing",
}


def drive_names():
    """key -> Drive file name, from the table in public/emblems/sports/README.md."""
    table = open(os.path.join(OUT, "README.md")).read()
    return {k: f for k, f in re.findall(r"^\| `([^`]+)` \| ([^|]+?\.png) \|", table, re.M)}


def bitmap(src):
    im = Image.open(src).convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    bg.alpha_composite(im)
    g = bg.convert("L")
    w, h = g.size
    g = g.resize((w * UP, h * UP), Image.LANCZOS).filter(ImageFilter.GaussianBlur(BLUR))
    return g.point(lambda v: 0 if v < 128 else 255).convert("1"), np.asarray(bg.convert("L")) < 128


def trace(bw):
    """potrace's outline in bitmap pixels (its output is a flipped, scaled group)."""
    with tempfile.TemporaryDirectory() as t:
        pbm, svg = os.path.join(t, "in.pbm"), os.path.join(t, "out.svg")
        bw.save(pbm)
        subprocess.run(["potrace", pbm, "-b", "svg", "--flat", "-t", str(TURD), "-a", str(ALPHA),
                        "-O", str(OPT), "-u", "100", "-o", svg], check=True)
        text = open(svg).read()
    tx, ty, sx, sy = (float(v) for v in re.search(
        r'<g transform="translate\(([-\d.]+),([-\d.]+)\) scale\(([-\d.]+),([-\d.]+)\)"', text).groups())
    rec = RecordingPen()
    for d in re.findall(r'<path d="([^"]+)"', text):
        parse_path(d, TransformPen(rec, (sx, 0, 0, sy, tx, ty)))
    return rec


def num(v, nd):
    s = ("%." + str(nd) + "f") % v
    s = s.rstrip("0").rstrip(".") if "." in s else s
    return "0" if s in ("-0", "") else s


def path_data(rec, m, nd=1):
    """Relative path data. Deltas are taken between already-rounded points, so rounding never drifts."""
    q = 10 ** nd
    a, b, c, d, e, f = m

    def pt(p):
        return (round((a * p[0] + c * p[1] + e) * q) / q, round((b * p[0] + d * p[1] + f) * q) / q)

    def nums(vals):
        s = ""
        for v in vals:
            t = num(v, nd)
            s += t if (not s or t.startswith("-")) else " " + t
        return s
    out, cur, start, last = [], (0.0, 0.0), (0.0, 0.0), None
    for op, args in rec.value:
        if op == "moveTo":
            p = pt(args[0])
            out.append(("m" + nums([p[0] - cur[0], p[1] - cur[1]])) if out else ("M" + nums(p)))
            cur = start = p
            last = "m"
        elif op in ("lineTo", "curveTo"):
            pts = [pt(x) for x in args]
            vals = []
            for p in pts:
                vals += [p[0] - cur[0], p[1] - cur[1]]
            cmd = "l" if op == "lineTo" else "c"
            body = nums(vals)
            if last == cmd:      # implicit repeat of the same command
                out.append(body if body.startswith("-") else " " + body)
            else:
                out.append(cmd + body)
            cur = pts[-1]
            last = cmd
        elif op in ("closePath", "endPath"):
            out.append("z")
            cur = start
            last = "z"
    return "".join(out)


def build(key, src):
    bw, ink = bitmap(src)
    rec = trace(bw)
    bp = BoundsPen(None)
    rec.replay(bp)
    x0, y0, x1, y1 = bp.bounds
    s = SIZE * (1 - 2 * MARGIN) / max(x1 - x0, y1 - y0)
    m = (s, 0, 0, s, SIZE / 2 - s * (x0 + x1) / 2, SIZE / 2 - s * (y0 + y1) / 2)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" role="img">'
           f'<title>{TITLES[key]}</title><path fill="currentColor" d="{path_data(rec, m)}"/></svg>\n')
    # fidelity: the outline at the PNG's own size against the PNG
    h, w = ink.shape
    check = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
             f'<rect width="{w}" height="{h}" fill="#fff"/>'
             f'<path d="{path_data(rec, (1 / UP, 0, 0, 1 / UP, 0, 0), nd=2)}"/></svg>')
    with tempfile.TemporaryDirectory() as t:
        cf, cp = os.path.join(t, "c.svg"), os.path.join(t, "c.png")
        open(cf, "w").write(check)
        subprocess.run(["rsvg-convert", cf, "-o", cp], check=True)
        got = np.asarray(Image.open(cp).convert("L")) < 128
        iou = (got & ink).sum() / (got | ink).sum()
        if iou < MIN_IOU:
            raise SystemExit(f"{key}: the trace covers only {iou:.4f} of the drawing (need {MIN_IOU})")
        open(os.path.join(OUT, key + ".svg"), "w").write(svg)
        sf, pf = os.path.join(t, "s.svg"), os.path.join(t, "p.png")
        open(sf, "w").write(svg)
        subprocess.run(["rsvg-convert", "-w", "512", "-h", "512", sf, "-o", pf], check=True)
        subprocess.run(["pngquant", "--force", "--quality", "70-95", "--output", os.path.join(OUT, key + ".png"), pf],
                       check=True)
    return iou, len(svg)


def main(src_dir, keys):
    names = drive_names()
    missing = sorted(set(TITLES) - set(names))
    if missing:
        raise SystemExit("README table has no Drive file for: " + ", ".join(missing))
    for k in keys or sorted(names):
        iou, n = build(k, os.path.join(src_dir, names[k]))
        print(f"{k:20s} {names[k]:28s} IoU {iou:.4f}  {n / 1024:5.1f} KB")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2:])
