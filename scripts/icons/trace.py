"""Designer-grade SVGs of Alec's sport drawings.

  python3 scripts/icons/trace.py SRC_DIR [key ...]

SRC_DIR holds Alec's PNGs from Google Drive (Website / ASNM Flat Vector Logo), named as in
the table in public/emblems/sports/README.md (that table is the key -> file map). For each
key this writes public/emblems/sports/<key>.svg and a 512 px transparent <key>.png.

How: the PNG is flattened onto white, upscaled 4x and lightly blurred (sigma 5 px at 4x,
about 1.25 px of the original: clean edges without closing thin white details), and the ink
outline is taken at exactly 50% grey with sub-pixel precision (marching squares). Each
outline is then rebuilt the way an illustrator draws: a closed outline that is a circle
becomes a perfect circle; the rest is split at its real corners and every piece becomes an
exact straight line, a true circular arc, or the fewest cubic curves within 0.15 units of
the outline. One path on a 512 grid, even-odd fill, the drawing centred with a 6% margin,
relative coordinates rounded to 0.1 without drift, fill="currentColor".

Checks: every rebuilt outline must keep its shape (area within 0.25 units times its
perimeter of the original), and every icon must cover the same pixels as its PNG (IoU of
at least 0.985 at the PNG's own size), or the run stops.

Needs: python3 with numpy, pillow, scikit-image; rsvg-convert and pngquant.
"""
import math, os, re, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageFilter
from skimage import measure

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "emblems", "sports")
UP, BLUR, SIZE, MARGIN = 4, 5.0, 512, 0.06
MIN_AREA = 2.5                   # specks smaller than this (original px^2) are dropped
TOL_CURVE = 0.15                 # max distance (512 units) between a fitted curve and the outline
TOL_LINE = 0.20
CORNER_DEG = 38.0                # turning, over about 1.5 units either side, that makes a corner
CIRCLE_REL, CIRCLE_ABS = 0.012, 0.25
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


# ------------------------------------------------------------------ geometry
def resample(P, step):
    """Uniformly spaced points along a closed polyline P (n x 2), first point repeated at the end."""
    d = np.r_[0, np.cumsum(np.hypot(*np.diff(P, axis=0).T))]
    n = max(8, int(d[-1] / step))
    t = np.linspace(0, d[-1], n + 1)
    return np.c_[np.interp(t, d, P[:, 0]), np.interp(t, d, P[:, 1])]


def fit_circle(P):
    x, y = P[:, 0], P[:, 1]
    A = np.c_[2 * x, 2 * y, np.ones(len(x))]
    b = x * x + y * y
    (cx, cy, c), *_ = np.linalg.lstsq(A, b, rcond=None)
    r = math.sqrt(max(c + cx * cx + cy * cy, 1e-9))
    dev = np.abs(np.hypot(x - cx, y - cy) - r)
    return cx, cy, r, dev.max()


def turning(P, k):
    """Turning angle (degrees) at each point of a closed resampled loop, using neighbours k away."""
    Q = P[:-1]
    a = Q - np.roll(Q, k, axis=0)
    b = np.roll(Q, -k, axis=0) - Q
    ang = np.degrees(np.arctan2(a[:, 0] * b[:, 1] - a[:, 1] * b[:, 0], (a * b).sum(1)))
    return np.abs(ang)


def corners(P, step):
    k = max(2, int(round(1.5 / step)))
    t = turning(P, k)
    n = len(t)
    idx = []
    for i in range(n):
        if t[i] < CORNER_DEG:
            continue
        w = [t[(i + j) % n] for j in range(-k, k + 1)]
        if t[i] >= max(w) and (not idx or i - idx[-1] > k):
            idx.append(i)
    if len(idx) > 1 and idx[0] + n - idx[-1] <= k:
        idx.pop()
    return idx


# ------------------------------------------------------------------ Schneider curve fitting
def _bez(b, t):
    mt = 1 - t
    return (mt ** 3)[:, None] * b[0] + (3 * mt * mt * t)[:, None] * b[1] + (3 * mt * t * t)[:, None] * b[2] + (t ** 3)[:, None] * b[3]


def _bez1(b, t):
    mt = 1 - t
    return (3 * mt * mt)[:, None] * (b[1] - b[0]) + (6 * mt * t)[:, None] * (b[2] - b[1]) + (3 * t * t)[:, None] * (b[3] - b[2])


def _bez2(b, t):
    mt = 1 - t
    return (6 * mt)[:, None] * (b[2] - 2 * b[1] + b[0]) + (6 * t)[:, None] * (b[3] - 2 * b[2] + b[1])


def _gen(P, u, t1, t2):
    p0, p3 = P[0], P[-1]
    mt = 1 - u
    B0, B1, B2, B3 = mt ** 3, 3 * mt * mt * u, 3 * mt * u * u, u ** 3
    A1, A2 = np.outer(B1, t1), np.outer(B2, t2)
    C = np.array([[(A1 * A1).sum(), (A1 * A2).sum()], [(A1 * A2).sum(), (A2 * A2).sum()]])
    tmp = P - np.outer(B0 + B1, p0) - np.outer(B2 + B3, p3)
    X = np.array([(A1 * tmp).sum(), (A2 * tmp).sum()])
    seg = np.linalg.norm(p3 - p0)
    det = C[0, 0] * C[1, 1] - C[0, 1] ** 2
    if abs(det) > 1e-12:
        a1 = (X[0] * C[1, 1] - X[1] * C[0, 1]) / det
        a2 = (C[0, 0] * X[1] - C[0, 1] * X[0]) / det
    else:
        a1 = a2 = seg / 3
    if a1 < 1e-6 * seg or a2 < 1e-6 * seg or a1 > 3 * seg or a2 > 3 * seg:
        a1 = a2 = seg / 3
    return np.array([p0, p0 + t1 * a1, p3 + t2 * a2, p3])


def _fit(P, t1, t2, tol, depth=0):
    if len(P) <= 2 or depth > 14:
        seg = np.linalg.norm(P[-1] - P[0]) / 3
        return [np.array([P[0], P[0] + t1 * seg, P[-1] + t2 * seg, P[-1]])]
    d = np.r_[0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]
    u = d / d[-1] if d[-1] > 0 else np.linspace(0, 1, len(P))
    b = _gen(P, u, t1, t2)
    for _ in range(25):
        err = np.linalg.norm(_bez(b, u) - P, axis=1)
        i = int(err.argmax())
        if err[i] <= tol:
            return [b]
        q, q1, q2 = _bez(b, u), _bez1(b, u), _bez2(b, u)
        num = ((q - P) * q1).sum(1)
        den = (q1 * q1).sum(1) + ((q - P) * q2).sum(1)
        step = np.divide(num, den, out=np.zeros_like(num), where=np.abs(den) > 1e-12)
        u = np.clip(u - step, 0, 1)
        b = _gen(P, u, t1, t2)
    err = np.linalg.norm(_bez(b, u) - P, axis=1)
    i = min(max(int(err.argmax()), 1), len(P) - 2)
    tc = P[i - 1] - P[i + 1]
    tc = tc / (np.linalg.norm(tc) or 1)
    return _fit(P[:i + 1], t1, tc, tol, depth + 1) + _fit(P[i:], -tc, t2, tol, depth + 1)


def end_tangent(P, forward=True, span=1.2):
    """Unit tangent at the start (pointing in) or end (pointing back in), from points within `span` units."""
    Q = P if forward else P[::-1]
    d = np.cumsum(np.linalg.norm(np.diff(Q, axis=0), axis=1))
    j = int(np.searchsorted(d, span)) + 1
    j = min(max(j, 1), len(Q) - 1)
    v = Q[j] - Q[0]
    return v / (np.linalg.norm(v) or 1)


# ------------------------------------------------------------------ outline -> drawing commands
def piece(P, t1=None, t2=None):
    """One corner-to-corner piece: ('L', end) | ('A', r, large, sweep, end) | ('C', c1, c2, end)..."""
    a, b = P[0], P[-1]
    chord = b - a
    L = np.linalg.norm(chord)
    if L > 1e-6:
        nrm = np.array([-chord[1], chord[0]]) / L
        if np.abs((P - a) @ nrm).max() <= TOL_LINE:
            return [("L", b)]
    if len(P) >= 8 and L > 2.0:
        cx, cy, r, dev = fit_circle(P)
        if dev <= TOL_CURVE and r < 400:
            # flags from the points themselves: the unwrapped angle they sweep around the centre.
            # y points down, so a growing angle is clockwise on screen, which is SVG sweep-flag 1.
            th = np.unwrap(np.arctan2(P[:, 1] - cy, P[:, 0] - cx))
            span = th[-1] - th[0]
            if abs(span) > 1e-3:
                return [("A", r, 1 if abs(span) > math.pi else 0, 1 if span > 0 else 0, b)]
    t1 = end_tangent(P, True) if t1 is None else t1
    t2 = end_tangent(P, False) if t2 is None else t2
    return [("C", c[1], c[2], c[3]) for c in _fit(P, t1, t2, TOL_CURVE)]


def outline(P, step=0.25):
    """Commands for one closed outline (P in 512 units, closed). Returns (start, [commands])."""
    P = resample(P, step)
    loop = P[:-1]
    cx, cy, r, dev = fit_circle(loop)
    if dev <= max(CIRCLE_ABS, CIRCLE_REL * r):
        return ("circle", (cx, cy, r))
    cs = corners(P, step)
    n = len(loop)
    if not cs:
        # smooth closed curve: start where it bends most, keep the joint smooth
        k = max(2, int(round(1.5 / step)))
        s = int(turning(P, k).argmax())
        R = np.r_[loop[s:], loop[:s], loop[s:s + 1]]
        t = R[1] - R[-2]
        t = t / (np.linalg.norm(t) or 1)
        return (R[0], [("C", c[1], c[2], c[3]) for c in _fit(R, t, -t, TOL_CURVE)])
    cmds = []
    R = np.r_[loop[cs[0]:], loop[:cs[0]], loop[cs[0]:cs[0] + 1]]
    marks = [(c - cs[0]) % n for c in cs] + [n]
    # a piece that nearly closes on itself (one corner on a loop) is split in the middle,
    # so every fitted piece runs between two distinct points
    fixed = [marks[0]]
    for a, b in zip(marks, marks[1:]):
        seg = R[a:b + 1]
        arc = np.linalg.norm(np.diff(seg, axis=0), axis=1).sum()
        if np.linalg.norm(seg[-1] - seg[0]) < 0.25 * arc and b - a >= 8:
            fixed.append((a + b) // 2)
        fixed.append(b)
    for i in range(len(fixed) - 1):
        cmds += piece(R[fixed[i]:fixed[i + 1] + 1])
    return (R[0], cmds)


# ------------------------------------------------------------------ SVG text
def num(v, nd=1):
    s = ("%." + str(nd) + "f") % v
    s = s.rstrip("0").rstrip(".") if "." in s else s
    return "0" if s in ("-0", "") else s


def path_data(items, nd=1):
    q = 10 ** nd
    rd = lambda p: (round(p[0] * q) / q, round(p[1] * q) / q)
    out, cur = [], (0.0, 0.0)

    def nums(vals):
        s = ""
        for v in vals:
            t = num(v, nd)
            s += t if (not s or t.startswith("-")) else " " + t
        return s
    for kind, data in items:
        if isinstance(kind, str) and kind == "circle":
            cx, cy, r = data
            p = rd((cx + r, cy))
            rr = num(r, nd)
            out.append(("M" + nums(p)) if not out else ("m" + nums([p[0] - cur[0], p[1] - cur[1]])))
            out.append(f"a{rr} {rr} 0 1 0 {num(-2 * r, nd)} 0a{rr} {rr} 0 1 0 {num(2 * r, nd)} 0z")
            cur = p
            continue
        start, cmds = kind, data
        p0 = rd(start)
        out.append(("M" + nums(p0)) if not out else ("m" + nums([p0[0] - cur[0], p0[1] - cur[1]])))
        cur = p0
        last = None
        for c in cmds:
            if c[0] == "L":
                e = rd(c[1])
                body = nums([e[0] - cur[0], e[1] - cur[1]])
                out.append(("l" + body) if last != "l" else (body if body.startswith("-") else " " + body))
                last = "l"
            elif c[0] == "A":
                _, r, large, sweep, e = c
                e = rd(e)
                out.append(f"a{num(r, nd)} {num(r, nd)} 0 {large} {sweep} " + nums([e[0] - cur[0], e[1] - cur[1]]))
                last = "a"
            else:
                c1, c2, e = rd(c[1]), rd(c[2]), rd(c[3])
                body = nums([c1[0] - cur[0], c1[1] - cur[1], c2[0] - cur[0], c2[1] - cur[1], e[0] - cur[0], e[1] - cur[1]])
                out.append(("c" + body) if last != "c" else (body if body.startswith("-") else " " + body))
                last = "c"
            cur = e
        out.append("z")
        cur = p0
    return "".join(out)


def arc_points(p1, r, large, sweep, p2, n=32):
    """Points along an SVG circular arc (endpoint form), per the SVG implementation notes."""
    p1, p2 = np.asarray(p1, float), np.asarray(p2, float)
    d = (p1 - p2) / 2
    dd = float(d @ d)
    if dd < 1e-12:
        return np.array([p1, p2])
    r = max(r, math.sqrt(dd))
    coef = math.sqrt(max(r * r - dd, 0.0) / dd) * (-1 if large == sweep else 1)
    c = (p1 + p2) / 2 + coef * np.array([d[1], -d[0]])
    t1 = math.atan2(p1[1] - c[1], p1[0] - c[0])
    t2 = math.atan2(p2[1] - c[1], p2[0] - c[0])
    dt = t2 - t1
    if sweep == 0 and dt > 0:
        dt -= 2 * math.pi
    elif sweep == 1 and dt < 0:
        dt += 2 * math.pi
    t = t1 + dt * np.linspace(0, 1, n)
    return np.c_[c[0] + r * np.cos(t), c[1] + r * np.sin(t)]


def area(P):
    return abs(0.5 * np.sum(P[:-1, 0] * P[1:, 1] - P[1:, 0] * P[:-1, 1]))


def sampled(o):
    """Dense points along an outline's commands (for checking the fit)."""
    start, cmds = o
    cur = np.array(start, float)
    pts = [cur]
    for c in cmds:
        if c[0] == "C":
            b = np.array([cur, c[1], c[2], c[3]], float)
            pts += list(_bez(b, np.linspace(0, 1, 24))[1:])
        elif c[0] == "A":
            pts += list(arc_points(cur, c[1], c[2], c[3], np.array(c[4], float))[1:])
        else:
            pts.append(np.array(c[-1], float))
        cur = np.array(c[-1], float)
    return np.array(pts + [np.array(start, float)])


def outlines(src):
    """Rebuilt outlines in 512 units, the 512 <- 4x-pixel transform, and the PNG's ink mask."""
    im = Image.open(src).convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    bg.alpha_composite(im)
    g = bg.convert("L")
    W, H = g.size
    g = g.resize((W * UP, H * UP), Image.LANCZOS).filter(ImageFilter.GaussianBlur(BLUR))
    a = np.pad(np.asarray(g, dtype=float) / 255.0, 2, constant_values=1.0)
    raw = [c[:, ::-1] - 2 + 0.5 for c in measure.find_contours(a, 0.5)]   # (x, y) in 4x pixels, centres at +0.5
    raw = [c for c in raw if np.allclose(c[0], c[-1]) and area(c) >= MIN_AREA * UP * UP]
    allp = np.vstack(raw)
    x0, y0 = allp.min(0)
    x1, y1 = allp.max(0)
    s = SIZE * (1 - 2 * MARGIN) / max(x1 - x0, y1 - y0)
    ox, oy = SIZE / 2 - s * (x0 + x1) / 2, SIZE / 2 - s * (y0 + y1) / 2
    items = []
    for c in raw:
        P = np.c_[c[:, 0] * s + ox, c[:, 1] * s + oy]
        o = outline(P)
        if not isinstance(o[0], str):
            per = np.linalg.norm(np.diff(P, axis=0), axis=1).sum()
            if abs(area(sampled(o)) - area(P)) > 0.25 * per + 1:
                raise SystemExit(f"{src}: a rebuilt outline strays from the drawing")
        items.append(o)
    return items, (s, ox, oy), np.asarray(bg.convert("L")) < 128


def build(key, src):
    items, (s, ox, oy), ink = outlines(src)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" role="img">'
           f'<title>{TITLES[key]}</title><path fill="currentColor" fill-rule="evenodd" d="{path_data(items)}"/></svg>\n')
    h, w = ink.shape
    k = 1 / (s * UP)
    check = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{num(ox * k, 3)} {num(oy * k, 3)} {w} {h}" '
             f'width="{w}" height="{h}"><rect x="-99999" y="-99999" width="999999" height="999999" fill="#fff"/>'
             f'<g transform="scale({k:.8f})"><path fill-rule="evenodd" d="{path_data(items, 2)}"/></g></svg>')
    with tempfile.TemporaryDirectory() as t:
        cf, cp = os.path.join(t, "c.svg"), os.path.join(t, "c.png")
        open(cf, "w").write(check)
        subprocess.run(["rsvg-convert", cf, "-o", cp], check=True)
        got = np.asarray(Image.open(cp).convert("L")) < 128
        iou = (got & ink).sum() / (got | ink).sum()
        if iou < MIN_IOU:
            raise SystemExit(f"{key}: the SVG covers only {iou:.4f} of the drawing (need {MIN_IOU})")
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
        print(f"{k:20s} {names[k]:28s} IoU {iou:.4f}  {n / 1024:5.1f} KB", flush=True)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2:])
