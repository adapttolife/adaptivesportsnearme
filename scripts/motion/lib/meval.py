"""Evaluate spec keyframes the way the browser does, so a part can follow another
exactly (a ball riding in a pocket until it is thrown, a contact point on a bat)."""
import math, re, sys
from mv import EASE

def _bezier(p1x, p1y, p2x, p2y):
    def f(x):
        if x <= 0: return 0.0
        if x >= 1: return 1.0
        lo, hi = 0.0, 1.0
        for _ in range(60):
            t = (lo + hi) / 2
            bx = 3 * (1 - t) ** 2 * t * p1x + 3 * (1 - t) * t * t * p2x + t ** 3
            lo, hi = (t, hi) if bx < x else (lo, t)
        t = (lo + hi) / 2
        return 3 * (1 - t) ** 2 * t * p1y + 3 * (1 - t) * t * t * p2y + t ** 3
    return f

def ease_fn(name):
    s = EASE.get(name, name) if name else "ease"
    if s == "linear": return lambda x: x
    if s == "ease": return _bezier(.25, .1, .25, 1)
    a = [float(v) for v in re.match(r"cubic-bezier\(([^)]+)\)", s).group(1).split(",")]
    return _bezier(*a)

def _funcs(tf):
    tf = tf.split(";")[0].strip()
    if tf in ("none", ""): return []
    out = []
    for name, args in re.findall(r"(\w+)\(([^)]*)\)", tf):
        v = [float(re.sub(r"[a-z%]+", "", a)) for a in args.replace(",", " ").split()]
        if name == "rotate": out.append(("rotate", v[0]))
        elif name == "translate": out.append(("translate", v[0], v[1] if len(v) > 1 else 0.0))
        elif name == "scale": out.append(("scale", v[0], v[1] if len(v) > 1 else v[0]))
        elif name == "scaleX": out.append(("scale", v[0], 1.0))
        else: raise ValueError(name)
    return out

def _expand(keys):
    rows = []
    for pct, tf, ease in keys:
        for p in (pct.replace("%", "").split(",") if isinstance(pct, str) else [pct]):
            rows.append((float(p), _funcs(tf), ease))
    return sorted(rows, key=lambda r: r[0])

def funcs_at(keys, pct):
    rows = _expand(keys)
    if pct <= rows[0][0]: return rows[0][1]
    for (p0, f0, e0), (p1, f1, _) in zip(rows, rows[1:]):
        if p0 <= pct <= p1:
            u = ease_fn(e0)((pct - p0) / (p1 - p0)) if p1 > p0 else 1
            if not f0: f0 = [(f[0],) + ((0.0,) if f[0] == "rotate" else (1.0, 1.0) if f[0] == "scale" else (0.0, 0.0)) for f in f1]
            if not f1: f1 = [(f[0],) + ((0.0,) if f[0] == "rotate" else (1.0, 1.0) if f[0] == "scale" else (0.0, 0.0)) for f in f0]
            return [(a[0],) + tuple(x + (y - x) * u for x, y in zip(a[1:], b[1:])) for a, b in zip(f0, f1)]
    return rows[-1][1]

def _mul(A, B):
    a, b, c, d, e, f = A; g, h, i, j, k, l = B
    return (a * g + b * j, a * h + b * k, a * i + b * l + c, d * g + e * j, d * h + e * k, d * i + e * l + f)

def matrix(funcs, origin):
    ox, oy = origin; M = (1, 0, ox, 0, 1, oy)
    for f in funcs:
        if f[0] == "rotate":
            r = math.radians(f[1]); M = _mul(M, (math.cos(r), -math.sin(r), 0, math.sin(r), math.cos(r), 0))
        elif f[0] == "translate": M = _mul(M, (1, 0, f[1], 0, 1, f[2]))
        else: M = _mul(M, (f[1], 0, 0, 0, f[2], 0))
    return _mul(M, (1, 0, -ox, 0, 1, -oy))

def apply(M, p):
    return (M[0] * p[0] + M[1] * p[1] + M[2], M[3] * p[0] + M[4] * p[1] + M[5])

def world(spec, chain, p, pct):
    """chain: group classes from outermost to innermost."""
    M = (1, 0, 0, 0, 1, 0)
    for cls in chain:
        if cls in spec["keys"]:
            M = _mul(M, matrix(funcs_at(spec["keys"][cls], pct), spec["origins"].get(cls, (0, 0))))
    return apply(M, p)

def follow(spec, chain, p, t0, t1, step=1.0):
    """Translate keys that keep a free part on point p of a moving chain from t0 to t1 (percent)."""
    out = []; t = t0
    while t < t1 + 1e-9:
        x, y = world(spec, chain, p, t); out.append((round(t, 2), f"translate({x - p[0]:.2f}px,{y - p[1]:.2f}px)", "lin")); t += step
    if out[-1][0] < t1:
        x, y = world(spec, chain, p, t1); out.append((t1, f"translate({x - p[0]:.2f}px,{y - p[1]:.2f}px)", "lin"))
    return out

def bez(ctrl, s):
    """Point at s on a Bezier curve through control points ctrl (any degree)."""
    pts = list(ctrl)
    while len(pts) > 1:
        pts = [(a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s) for a, b in zip(pts, pts[1:])]
    return pts[0]

def path_keys(t0, t1, ctrl, ease, fmt, step=1.0):
    """Dense linear keys that carry a part along a smooth curve from t0 to t1 (percent);
    ease shapes the speed along it, fmt(t, x, y) writes each keyframe's value."""
    f = ease_fn(ease); out = []; n = max(2, int(round((t1 - t0) / step)))
    for i in range(n + 1):
        t = t0 + (t1 - t0) * i / n; x, y = bez(ctrl, f(i / n))
        out.append((round(t, 3), fmt(t, x, y), "lin"))
    return out
