"""ASNM icon kit: calligraphic brush strokes drawn as clean Bezier outlines.

Every icon is built from a few primitives on a 120 x 120 grid (y down):
circles, polygons, SVG path data, and brush strokes (a smooth centreline with a
width at each control point, tapering to a point or ending round). Shapes are
stacked back to front; a shape in front cuts a GAP-wide white gap into the
shapes behind it, the way the Adapt To Life athlete is drawn. Output is one
small SVG per icon: plain paths, CSS keyframe motion, no scripts.
"""
import math
import pathops
from fontTools.svgLib.path import parse_path
from fontTools.pens.svgPathPen import SVGPathPen

GAP = 2.4            # white gap between overlapping shapes (the logo's own gaps run 1.9 to 2.6)
FLATTEN_MASKS = False  # nested animated groups in masks work in Chromium and WebKit (checked 2026-10-14)
K = 0.5522847498     # cubic circle constant
UNION, DIFF, INTER = pathops.PathOp.UNION, pathops.PathOp.DIFFERENCE, pathops.PathOp.INTERSECTION


# ---------------------------------------------------------------- vectors
def add(a, b): return (a[0] + b[0], a[1] + b[1])
def sub(a, b): return (a[0] - b[0], a[1] - b[1])
def mul(a, s): return (a[0] * s, a[1] * s)
def dot(a, b): return a[0] * b[0] + a[1] * b[1]
def dist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1])
def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def norm(a):
    d = math.hypot(*a)
    return (a[0] / d, a[1] / d) if d > 1e-12 else (0.0, 0.0)


def polar(c, r, deg):
    a = math.radians(deg)
    return (c[0] + r * math.cos(a), c[1] + r * math.sin(a))


def rot(p, c, deg):
    """Rotate point p about c by deg (clockwise on screen, since y points down)."""
    a = math.radians(deg)
    x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))


# ---------------------------------------------------------------- paths
def new():
    return pathops.Path()


def svg(d):
    """Path from SVG path data (absolute or relative; arcs allowed)."""
    p = new()
    parse_path(d, p.getPen())
    return p


def circle(cx, cy, r):
    p, k = new(), K * r
    p.moveTo(cx + r, cy)
    p.cubicTo(cx + r, cy + k, cx + k, cy + r, cx, cy + r)
    p.cubicTo(cx - k, cy + r, cx - r, cy + k, cx - r, cy)
    p.cubicTo(cx - r, cy - k, cx - k, cy - r, cx, cy - r)
    p.cubicTo(cx + k, cy - r, cx + r, cy - k, cx + r, cy)
    p.close()
    return p


def ellipse(cx, cy, rx, ry, deg=0):
    p = xf(circle(0, 0, 1), rx, 0, 0, ry, 0, 0)
    return xf(rotate(p, deg, (0, 0)), 1, 0, 0, 1, cx, cy)


def poly(pts, close=True):
    p = new()
    p.moveTo(*pts[0])
    for q in pts[1:]:
        p.lineTo(*q)
    if close:
        p.close()
    return p


def rrect(x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    k = K * r
    p = new()
    p.moveTo(x + r, y)
    p.lineTo(x + w - r, y)
    p.cubicTo(x + w - r + k, y, x + w, y + r - k, x + w, y + r)
    p.lineTo(x + w, y + h - r)
    p.cubicTo(x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h)
    p.lineTo(x + r, y + h)
    p.cubicTo(x + r - k, y + h, x, y + h - r + k, x, y + h - r)
    p.lineTo(x, y + r)
    p.cubicTo(x, y + r - k, x + r - k, y, x + r, y)
    p.close()
    return p


def ring(cx, cy, ro, ri):
    return diff(circle(cx, cy, ro), circle(cx, cy, ri))


def xf(p, a, b, c, d, e, f):
    """Affine transform with SVG matrix(a b c d e f) semantics."""
    return p.transform(scaleX=a, skewY=b, skewX=c, scaleY=d, translateX=e, translateY=f)


def move(p, dx, dy):
    return xf(p, 1, 0, 0, 1, dx, dy)


def scale(p, s, c=(0, 0)):
    return xf(p, s, 0, 0, s, c[0] - s * c[0], c[1] - s * c[1])


def rotate(p, deg, c):
    a = math.radians(deg)
    co, si = math.cos(a), math.sin(a)
    return xf(p, co, si, -si, co, c[0] - co * c[0] + si * c[1], c[1] - si * c[0] - co * c[1])


def mirror(p, x0):
    """Mirror left-right about the vertical line x = x0."""
    return xf(p, -1, 0, 0, 1, 2 * x0, 0)


def union(*ps):
    """Union of paths, folded pair by pair.

    pathops.op is exact; OpBuilder (tried first in an earlier version) dropped the overlap when an
    input already had a hole, e.g. a bar across a picture frame. Skia occasionally refuses a pair;
    nudging that shape by a hair always resolves it.
    """
    ps = [p for p in ps if p is not None]
    if not ps:
        return new()
    if len(ps) == 1:      # already resolved; re-resolving thin grids (racket strings) can fill cells
        return ps[0]
    acc = ps[0]
    for p in ps[1:]:
        for eps in (0.0, 0.003, -0.004, 0.007):
            try:
                q = p if eps == 0.0 else move(p, eps, -eps)
                acc = pathops.op(acc, q, UNION, fix_winding=True)
                break
            except pathops.PathOpsError:
                continue
    return acc


def diff(a, b):
    return pathops.op(a, b, DIFF, fix_winding=True)


def inter(a, b):
    return pathops.op(a, b, INTER, fix_winding=True)


def grow(p, d):
    """p expanded outward by d (round joins).

    Skia can refuse to stroke a very busy outline (the swept shape of spinning spokes); simplifying
    it first, or nudging it by a hair, always gets through.
    """
    if d <= 0:
        return p
    for attempt in range(4):
        q = pathops.Path(p)
        try:
            if attempt:
                q.simplify(fix_winding=True)
                if attempt > 1:
                    q = move(q, 0.002 * attempt, -0.002 * attempt)
            s = pathops.Path(q)
            s.stroke(2 * d, pathops.LineCap.ROUND_CAP, pathops.LineJoin.ROUND_JOIN, 4)
            s.convertConicsToQuads()
            return union(q, s)
        except pathops.PathOpsError:
            continue
    raise pathops.PathOpsError(f"grow({d}) failed on a path with {len(list(p.contours))} contours")


def outline(pts, width, cap="round"):
    """Uniform-width stroke along a polyline (for strings, nets, spokes)."""
    p = poly(pts, close=False)
    c = {"round": pathops.LineCap.ROUND_CAP, "butt": pathops.LineCap.BUTT_CAP,
         "square": pathops.LineCap.SQUARE_CAP}[cap]
    p.stroke(width, c, pathops.LineJoin.ROUND_JOIN, 4)
    p.convertConicsToQuads()
    return union(p)


def line(a, b, width, cap="round"):
    return outline([a, b], width, cap)


def arc_pts(c, r, a0, a1, n=None):
    """Points along a circular arc from a0 to a1 degrees (clockwise on screen)."""
    n = n or max(4, int(abs(a1 - a0) / 6))
    return [polar(c, r, a0 + (a1 - a0) * i / n) for i in range(n + 1)]


def stroke_arc(c, r, a0, a1, width, cap="round"):
    return outline(arc_pts(c, r, a0, a1, max(8, int(abs(a1 - a0) / 3))), width, cap)


# ---------------------------------------------------------------- brush
def _catmull(pts, samples):
    """Centripetal Catmull-Rom through pts. Returns dense points + index of each control point."""
    P = [sub(mul(pts[0], 2), pts[1])] + list(pts) + [sub(mul(pts[-1], 2), pts[-2])]
    out, marks = [pts[0]], [0]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        t0 = 0.0
        t1 = t0 + max(dist(p0, p1), 1e-6) ** 0.5
        t2 = t1 + max(dist(p1, p2), 1e-6) ** 0.5
        t3 = t2 + max(dist(p2, p3), 1e-6) ** 0.5
        for s in range(1, samples + 1):
            t = t1 + (t2 - t1) * s / samples
            a1 = add(mul(p0, (t1 - t) / (t1 - t0)), mul(p1, (t - t0) / (t1 - t0)))
            a2 = add(mul(p1, (t2 - t) / (t2 - t1)), mul(p2, (t - t1) / (t2 - t1)))
            a3 = add(mul(p2, (t3 - t) / (t3 - t2)), mul(p3, (t - t2) / (t3 - t2)))
            b1 = add(mul(a1, (t2 - t) / (t2 - t0)), mul(a2, (t - t0) / (t2 - t0)))
            b2 = add(mul(a2, (t3 - t) / (t3 - t1)), mul(a3, (t - t1) / (t3 - t1)))
            out.append(add(mul(b1, (t2 - t) / (t2 - t1)), mul(b2, (t - t1) / (t2 - t1))))
        marks.append(len(out) - 1)
    return out, marks


def _pchip(xs, ys):
    """Monotone cubic interpolation (no overshoot) -> function."""
    n = len(xs)
    if n == 1:
        return lambda x: ys[0]
    h = [xs[i + 1] - xs[i] for i in range(n - 1)]
    d = [(ys[i + 1] - ys[i]) / h[i] if h[i] else 0 for i in range(n - 1)]
    m = [0.0] * n
    m[0], m[-1] = d[0], d[-1]
    for i in range(1, n - 1):
        if d[i - 1] * d[i] <= 0:
            m[i] = 0.0
        else:
            w1, w2 = 2 * h[i] + h[i - 1], h[i] + 2 * h[i - 1]
            m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i])

    def f(x):
        if x <= xs[0]:
            return ys[0]
        if x >= xs[-1]:
            return ys[-1]
        i = max(j for j in range(n - 1) if xs[j] <= x)
        t = (x - xs[i]) / h[i] if h[i] else 0
        t2, t3 = t * t, t * t * t
        return ((2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i]
                + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1])
    return f


def _bez(b, t):
    mt = 1 - t
    return (mt ** 3 * b[0][0] + 3 * mt * mt * t * b[1][0] + 3 * mt * t * t * b[2][0] + t ** 3 * b[3][0],
            mt ** 3 * b[0][1] + 3 * mt * mt * t * b[1][1] + 3 * mt * t * t * b[2][1] + t ** 3 * b[3][1])


def _bez1(b, t):
    mt = 1 - t
    return (3 * (mt * mt * (b[1][0] - b[0][0]) + 2 * mt * t * (b[2][0] - b[1][0]) + t * t * (b[3][0] - b[2][0])),
            3 * (mt * mt * (b[1][1] - b[0][1]) + 2 * mt * t * (b[2][1] - b[1][1]) + t * t * (b[3][1] - b[2][1])))


def _bez2(b, t):
    mt = 1 - t
    return (6 * (mt * (b[2][0] - 2 * b[1][0] + b[0][0]) + t * (b[3][0] - 2 * b[2][0] + b[1][0])),
            6 * (mt * (b[2][1] - 2 * b[1][1] + b[0][1]) + t * (b[3][1] - 2 * b[2][1] + b[1][1])))


def _gen_bez(pts, u, t1, t2):
    p0, p3 = pts[0], pts[-1]
    c00 = c01 = c11 = x0 = x1 = 0.0
    for p, t in zip(pts, u):
        mt = 1 - t
        b0, b1, b2, b3 = mt ** 3, 3 * mt * mt * t, 3 * mt * t * t, t ** 3
        a1, a2 = mul(t1, b1), mul(t2, b2)
        c00 += dot(a1, a1)
        c01 += dot(a1, a2)
        c11 += dot(a2, a2)
        tmp = sub(p, add(mul(p0, b0 + b1), mul(p3, b2 + b3)))
        x0 += dot(a1, tmp)
        x1 += dot(a2, tmp)
    det = c00 * c11 - c01 * c01
    seg = dist(p0, p3)
    eps = 1e-6 * seg
    if abs(det) > 1e-12:
        al1 = (x0 * c11 - x1 * c01) / det
        al2 = (c00 * x1 - c01 * x0) / det
    else:
        al1 = al2 = seg / 3
    if al1 < eps or al2 < eps or al1 > seg * 2 or al2 > seg * 2:
        al1 = al2 = seg / 3
    return (p0, add(p0, mul(t1, al1)), add(p3, mul(t2, al2)), p3)


def _max_err(pts, b, u):
    m, idx = 0.0, len(pts) // 2
    for i in range(1, len(pts) - 1):
        d = dist(_bez(b, u[i]), pts[i])
        if d > m:
            m, idx = d, i
    return m, idx


def _reparam(pts, b, u):
    out = []
    for p, t in zip(pts, u):
        q, q1, q2 = _bez(b, t), _bez1(b, t), _bez2(b, t)
        num = dot(sub(q, p), q1)
        den = dot(q1, q1) + dot(sub(q, p), q2)
        out.append(min(1.0, max(0.0, t - num / den)) if abs(den) > 1e-12 else t)
    return out


def _fit(pts, t1, t2, err, depth=0):
    if len(pts) == 2 or depth > 12:
        d = dist(pts[0], pts[-1]) / 3
        return [(pts[0], add(pts[0], mul(t1, d)), add(pts[-1], mul(t2, d)), pts[-1])]
    acc = [0.0]
    for i in range(1, len(pts)):
        acc.append(acc[-1] + dist(pts[i], pts[i - 1]))
    total = acc[-1] or 1.0
    u = [a / total for a in acc]
    b = _gen_bez(pts, u, t1, t2)
    e, split = _max_err(pts, b, u)
    if e < err:
        return [b]
    if e < err * 6:
        for _ in range(12):
            u = _reparam(pts, b, u)
            b = _gen_bez(pts, u, t1, t2)
            e, split = _max_err(pts, b, u)
            if e < err:
                return [b]
    split = min(max(split, 1), len(pts) - 2)
    tc = norm(sub(pts[split - 1], pts[split + 1]))
    if tc == (0.0, 0.0):
        tc = norm(sub(pts[split - 1], pts[split]))
    return _fit(pts[:split + 1], t1, tc, err, depth + 1) + _fit(pts[split:], mul(tc, -1), t2, err, depth + 1)


def fit(pts, err=0.05):
    """Fit a polyline with as few cubic Beziers as the tolerance allows."""
    clean = [pts[0]]
    for p in pts[1:]:
        if dist(p, clean[-1]) > 1e-4:
            clean.append(p)
    if len(clean) < 2:
        return []
    t1 = norm(sub(clean[1], clean[0]))
    t2 = norm(sub(clean[-2], clean[-1]))
    return _fit(clean, t1, t2, err)


def _arc_beziers(c, r, a0, a1):
    """Cubic segments for an arc from angle a0 to a1 (radians)."""
    n = max(1, math.ceil(abs(a1 - a0) / (math.pi / 2) - 1e-9))
    da = (a1 - a0) / n
    k = 4 / 3 * math.tan(da / 4)
    out = []
    for i in range(n):
        s, e = a0 + i * da, a0 + (i + 1) * da
        p0 = (c[0] + r * math.cos(s), c[1] + r * math.sin(s))
        p3 = (c[0] + r * math.cos(e), c[1] + r * math.sin(e))
        c1 = (p0[0] - k * r * math.sin(s), p0[1] + k * r * math.cos(s))
        c2 = (p3[0] + k * r * math.sin(e), p3[1] - k * r * math.cos(e))
        out.append((p0, c1, c2, p3))
    return out


def _prune(side, centre, tangents):
    """Drop offset points that run backwards (inner side of a tight bend)."""
    keep = [0]
    for i in range(1, len(side)):
        j = keep[-1]
        if dot(sub(side[i], side[j]), tangents[i]) > -1e-6 or i == len(side) - 1:
            keep.append(i)
    return [side[i] for i in keep]


def brush(pts, widths, caps=("round", "round"), samples=24, err=0.04):
    """A calligraphic stroke through pts (a smooth curve passes through every point).

    widths: one width per point (interpolated smoothly along the stroke). A
    'point' cap needs width 0 at that end; 'round' ends in a half circle; 'flat'
    ends square to the stroke.
    """
    assert len(pts) == len(widths) and len(pts) >= 2
    line_, marks = _catmull(pts, samples)
    acc = [0.0]
    for i in range(1, len(line_)):
        acc.append(acc[-1] + dist(line_[i], line_[i - 1]))
    wf = _pchip([acc[m] for m in marks], list(widths))
    W = [max(0.0, wf(a)) for a in acc]
    if caps[0] == "point":
        W[0] = 0.0
    if caps[1] == "point":
        W[-1] = 0.0
    n = len(line_)
    T = []
    for i in range(n):
        a, b = line_[max(i - 1, 0)], line_[min(i + 1, n - 1)]
        T.append(norm(sub(b, a)))
    N = [(-t[1], t[0]) for t in T]
    L = [add(p, mul(nn, w / 2)) for p, nn, w in zip(line_, N, W)]
    R = [sub(p, mul(nn, w / 2)) for p, nn, w in zip(line_, N, W)]
    L = _prune(L, line_, T)
    Rr = _prune(R[::-1], line_[::-1], [mul(t, -1) for t in T[::-1]])

    p = new()
    p.moveTo(*L[0])
    for b in fit(L, err):
        p.cubicTo(*b[1], *b[2], *b[3])
    # end cap
    an = math.atan2(N[-1][1], N[-1][0])
    if caps[1] == "round" and W[-1] > 1e-3:
        for b in _arc_beziers(line_[-1], W[-1] / 2, an, an - math.pi):
            p.cubicTo(*b[1], *b[2], *b[3])
    else:
        p.lineTo(*Rr[0])
    for b in fit(Rr, err):
        p.cubicTo(*b[1], *b[2], *b[3])
    an0 = math.atan2(N[0][1], N[0][0])
    if caps[0] == "round" and W[0] > 1e-3:
        for b in _arc_beziers(line_[0], W[0] / 2, an0 - math.pi, an0 - 2 * math.pi):
            p.cubicTo(*b[1], *b[2], *b[3])
    p.close()
    return union(p)


def limb(pts, w0, w1, end_r=None, start="round"):
    """Arm or leg: width tapers w0 -> w1 along pts; optional round hand/foot of radius end_r."""
    n = len(pts)
    ws = [w0 + (w1 - w0) * i / (n - 1) for i in range(n)]
    shape = brush(pts, ws, (start, "round"))
    if end_r:
        shape = union(shape, circle(*pts[-1], end_r))
    return shape


# ---------------------------------------------------------------- icon
class Part:
    __slots__ = ("path", "cls", "group", "gap", "merge", "cut_all")

    def __init__(self, path, cls="i", group=None, gap=True, merge=None, cut_all=False):
        self.path, self.cls, self.group, self.gap, self.merge, self.cut_all = path, cls, group, gap, merge, cut_all


class Motion:
    """CSS keyframe motion for one group. frames: [(percent, transform), ...].

    Rotation pivots are in viewBox units. Frame 0 and 100 must be the rest pose
    (transform 'none' or equivalent) so a finished animation rests on the drawing.
    """

    def __init__(self, name, frames, pivot=(60, 60), dur=2.4, ease="cubic-bezier(.45,0,.55,1)", delay=0.0,
                 parent=None, clip=None):
        self.name, self.frames, self.pivot, self.dur, self.ease, self.delay = name, frames, pivot, dur, ease, delay
        self.parent, self.clip = parent, clip


class Icon:
    def __init__(self, key, title):
        self.key, self.title = key, title
        self.parts = []      # back to front
        self.motions = {}    # group name -> Motion

    def add(self, path, cls="i", group=None, gap=True, merge=None, cut_all=False):
        self.parts.append(Part(path, cls, group, gap, merge, cut_all))
        return self

    def motion(self, m):
        self.motions[m.name] = m
        return self

    def bounds(self):
        b = union(*[p.path for p in self.parts]).bounds
        return b

    def sweep_bounds(self, steps=24, vis=0.25):
        """Bounds of everything visible across the whole motion (rest pose included)."""
        boxes = [self.bounds()]
        for _, st in motion_states(self, steps):
            for p in self.parts:
                if p.group is None:
                    continue
                path, v = p.path, 1.0
                for g in reversed(_chain(self, p.group)):
                    if g not in st:
                        continue
                    ops, op = st[g]
                    path = _apply(path, ops, self.motions[g].pivot)
                    v *= op
                m = self.motions.get(p.group)
                if m is not None and m.clip is not None:
                    path = inter(path, m.clip)
                if v > vis and abs(path.area) > 1e-6:
                    boxes.append(path.bounds)
        return (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))

    def finish(self, margin=6.0, box=120.0, centre=True, dy=0.0, sweep=False):
        """Centre the drawing in the box (optical: dy nudges down) and check it fits.

        sweep=True centres and fits everything the motion shows, not just the rest pose,
        so a tossed ball or a flying arrow stays inside the frame while visible.
        """
        x0, y0, x1, y1 = self.sweep_bounds() if sweep else self.bounds()
        w, h = x1 - x0, y1 - y0
        if w > box - 2 * margin + 0.01 or h > box - 2 * margin + 0.01:
            raise ValueError(f"{self.key}: {w:.1f} x {h:.1f} does not fit {box - 2 * margin:.0f}")
        if centre:
            dx_, dy_ = box / 2 - (x0 + x1) / 2, box / 2 - (y0 + y1) / 2 + dy
            for p in self.parts:
                p.path = move(p.path, dx_, dy_)
            for m in self.motions.values():
                m.pivot = (m.pivot[0] + dx_, m.pivot[1] + dy_)
                if m.clip is not None:
                    m.clip = move(m.clip, dx_, dy_)
        return self

    def settle(self, margin=6.0, travel=3.0, dy=0.0):
        """Centre the rest pose (so the athlete sits where it does in every icon), then nudge only
        as far as needed to keep everything the motion shows `travel` units inside the box."""
        self.finish(margin=margin, dy=dy)
        x0, y0, x1, y1 = self.sweep_bounds()
        dx = max(0.0, travel - x0) - max(0.0, x1 - (120 - travel))
        dy_ = max(0.0, travel - y0) - max(0.0, y1 - (120 - travel))
        if dx or dy_:
            bx0, by0, bx1, by1 = self.bounds()
            if bx0 + dx < 0.5 or bx1 + dx > 119.5 or by0 + dy_ < 0.5 or by1 + dy_ > 119.5:
                raise ValueError(f"{self.key}: the motion does not fit the box")
            for p in self.parts:
                p.path = move(p.path, dx, dy_)
            for m in self.motions.values():
                m.pivot = (m.pivot[0] + dx, m.pivot[1] + dy_)
                if m.clip is not None:
                    m.clip = move(m.clip, dx, dy_)
        return self

    # resolve gaps: each shape loses a GAP band wherever a shape in front of it overlaps
    def resolved(self):
        out = []
        for i, part in enumerate(self.parts):
            cutters = []
            for f in self.parts[i + 1:]:
                if not f.gap:
                    continue
                if part.merge and part.merge == f.merge:
                    continue
                if f.group != part.group and not f.cut_all:
                    continue
                cutters.append(f.path)
            shape = part.path
            if cutters:
                shape = diff(shape, grow(union(*cutters), GAP))
            out.append(Part(shape, part.cls, part.group, part.gap, part.merge, part.cut_all))
        return out


def _num(v, nd):
    s = ("%." + str(nd) + "f") % v
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def _d(path, nd=1):
    pen = SVGPathPen(None, ntos=lambda v: _num(v, nd))
    path.draw(pen)
    return pen.getCommands()


def _fmt(v):
    s = ("%.2f" % v).rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def _chain(icon, g):
    out = []
    while g is not None:
        out.append(g)
        m = icon.motions.get(g)
        g = m.parent if m else None
    return out[::-1]   # outermost first


def _wrap(icon, g, inner):
    """Wrap inner in its motion classes, outermost parent first, so CSS moves it exactly like g."""
    for c in reversed(_chain(icon, g)):
        inner = f'<g class="{c}">{inner}</g>'
    return inner


def swept(icon, group, steps=24):
    """Union of a group's shapes over one loop (for deciding who needs a moving gap)."""
    base = union(*[p.path for p in icon.parts if p.group == group])
    acc = [base]
    for _, st in motion_states(icon, steps):
        path, vis = base, 1.0
        for g in reversed(_chain(icon, group)):
            if g in st:
                ops, op = st[g]
                path = _apply(path, ops, icon.motions[g].pivot)
                vis *= op
        if vis > 0.05:
            acc.append(path)
    return union(*acc)


def render(icon, loops="2", static=False, nd=1):
    """SVG text. static=True renders the rest pose with no motion.

    Shapes that never move are merged into one path. Each moving group gets its
    own <g> with a CSS animation. Where a moving group passes in front of other
    ink, the ink behind is masked by a copy of the group (grown by GAP) that
    runs the same animation, so the white gap travels with it.
    """
    k = icon.key
    if static:
        st = Icon(icon.key, icon.title)
        for p in icon.parts:
            path, vis = p.path, 1.0
            for g in reversed(_chain(icon, p.group)):   # innermost first, as the browser composes them
                m = icon.motions.get(g)
                if m is None:
                    continue
                ops, op = state_at(m, 0.0)
                path = _apply(path, ops, m.pivot)
                vis *= op
            for g in _chain(icon, p.group):
                m = icon.motions.get(g)
                if m is not None and m.clip is not None:
                    path = inter(path, m.clip)
            if vis < 0.5:      # hidden at rest (a muzzle flash, a ball not yet thrown)
                continue
            st.parts.append(Part(path, p.cls, None, p.gap, p.merge, False))
        parts = st.resolved()
        out = ""
        for cls in ("i", "a"):
            sel = [p.path for p in parts if p.cls == cls]
            if sel:
                out += f'<path class="{cls}" d="{_d(union(*sel), nd)}"/>'
        css = f".asnm-{k} .i{{fill:var(--asnm-ink,#1A1A1A)}}"
        if any(p.cls == "a" for p in parts):
            css += f".asnm-{k} .a{{fill:var(--asnm-accent,var(--asnm-ink,#1A1A1A))}}"
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" class="asnm-icon asnm-{k}" role="img">'
                f'<title>{icon.title}</title><style>{css}</style>{out}</svg>\n')

    parts = icon.resolved()
    groups = [g for g in dict.fromkeys(p.group for p in icon.parts) if g is not None]
    z = {g: min(i for i, p in enumerate(icon.parts) if p.group == g) for g in groups}
    states = list(motion_states(icon, 24))
    psweep = {}

    def part_sweep(i):
        """Everywhere moving part i goes while visible."""
        if i not in psweep:
            base = icon.parts[i].path
            acc = [base]
            for _, st in states:
                path, vis = base, 1.0
                for g in reversed(_chain(icon, icon.parts[i].group)):
                    if g in st:
                        ops, op = st[g]
                        path = _apply(path, ops, icon.motions[g].pivot)
                        vis *= op
                if vis > 0.05:
                    acc.append(path)
            sw = union(*acc)
            for g in _chain(icon, icon.parts[i].group):
                mc = icon.motions.get(g)
                if mc is not None and mc.clip is not None:
                    sw = inter(sw, mc.clip)
            psweep[i] = sw
        return psweep[i]

    def merged(a, b):
        return bool(a.merge) and a.merge == b.merge

    def touches(a, b):
        return abs(inter(grow(a, GAP), b).area) > 0.05

    defs, masks, flat = [], {}, set()

    def clip_id(g, m):
        cid = f"asnm-{k}-c{g}"
        if not any(f'id="{cid}"' in d for d in defs):
            defs.append(f'<clipPath id="{cid}"><path d="{_d(m.clip, nd)}"/></clipPath>')
        return cid

    def mask_for(static_cut, moving_cut):
        """One mask: white everywhere, black where the given shapes sit.

        moving_cut is ((group, (part indices...)), ...): those parts, grown by GAP,
        wrapped in the group's motion classes so the gap travels with them.
        """
        key = (None if static_cut is None else _d(static_cut, nd), moving_cut)
        if key in masks:
            return masks[key]
        mid = f"asnm-{k}-k{len(masks) + 1}"
        body = '<rect x="-30" y="-30" width="180" height="180" fill="#fff"/>'
        if static_cut is not None:
            body += f'<path d="{_d(static_cut, nd)}"/>'
        for g, js in moving_cut:
            shape = grow(union(*[icon.parts[j].path for j in js]), GAP)
            copy = _wrap(icon, g, f'<path d="{_d(shape, nd)}"/>')
            for c in _chain(icon, g):          # a clipped part only cuts where it can be seen
                mc = icon.motions.get(c)
                if mc is not None and mc.clip is not None:
                    copy = f'<g clip-path="url(#{clip_id(c, mc)})">{copy}</g>'
            body += copy
        defs.append(f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="-30" y="-30" width="180" height="180">{body}</mask>')
        masks[key] = mid
        return mid

    def cutters(front_of, exclude_group=None):
        """Moving parts in front of index front_of that may cut part `front_of`'s shapes, by group."""
        me = icon.parts[front_of]
        found = {}
        for j, q in enumerate(icon.parts):
            if j <= front_of or q.group is None or q.group == exclude_group or not q.gap or merged(me, q):
                continue
            found.setdefault(q.group, []).append(j)
        return found

    # static ink: each static part is masked by the moving parts that pass in front of it
    buckets = {}
    for i, p in enumerate(parts):
        if p.group is not None:
            continue
        cut = []
        for g, js in cutters(i).items():
            hit = tuple(j for j in js if touches(p.path, part_sweep(j)))
            if hit:
                cut.append((g, hit))
        buckets.setdefault(tuple(cut), {}).setdefault(p.cls, []).append(p.path)
    out = ""
    for cut, by_cls in buckets.items():
        paths = "".join(f'<path class="{c}" d="{_d(union(*by_cls[c]), nd)}"/>' for c in ("i", "a") if c in by_cls)
        out += f'<g mask="url(#{mask_for(None, cut)})">{paths}</g>' if cut else paths

    # moving groups, back to front, each wrapped in its class chain at top level. Within a group,
    # parts that need different cuts (a head and a torso merged with the arm) get separate masks.
    for g in sorted(groups, key=lambda g: z[g]):
        m = icon.motions.get(g)
        mine = [i for i, p in enumerate(icon.parts) if p.group == g]
        pieces = {}
        for i in mine:
            me = icon.parts[i]
            st_cut = [q.path for j, q in enumerate(icon.parts)
                      if j > i and q.group is None and q.gap and not merged(me, q) and touches(q.path, part_sweep(i))]
            mv = {}
            for h, js in cutters(i, exclude_group=g).items():
                for j in js:
                    if touches(part_sweep(j), part_sweep(i)):
                        mv.setdefault(h, set()).add(j)
            key = (tuple(id(c) for c in st_cut), tuple((h, tuple(sorted(js))) for h, js in sorted(mv.items())))
            pieces.setdefault(key, {"st": st_cut, "mv": key[1], "idx": []})["idx"].append(i)
        for piece in sorted(pieces.values(), key=lambda v: min(v["idx"])):
            inner = "".join(f'<path class="{c}" d="{_d(union(*[parts[i].path for i in piece["idx"] if parts[i].cls == c]), nd)}"/>'
                            for c in ("i", "a") if any(parts[i].cls == c for i in piece["idx"]))
            if not inner:
                continue
            el = _wrap(icon, g, inner)
            if m is not None and m.clip is not None:
                el = f'<g clip-path="url(#{clip_id(g, m)})">{el}</g>'
            if piece["st"] or piece["mv"]:
                sc = grow(union(*piece["st"]), GAP) if piece["st"] else None
                el = f'<g mask="url(#{mask_for(sc, piece["mv"])})">{el}</g>'
            out += el
    if defs:
        out = "<defs>" + "".join(defs) + "</defs>" + out

    css = [f".asnm-{k} .i{{fill:var(--asnm-ink,#1A1A1A)}}"]
    if any(p.cls == "a" for p in parts):
        css.append(f".asnm-{k} .a{{fill:var(--asnm-accent,var(--asnm-ink,#1A1A1A))}}")
    for name, m in icon.motions.items():
        css.append(
            f".asnm-{k} .{name}{{transform-box:view-box;transform-origin:{_fmt(m.pivot[0])}px {_fmt(m.pivot[1])}px;"
            f"animation:asnm-{k}-{name} {_fmt(m.dur)}s {m.ease} {_fmt(m.delay)}s var(--asnm-loops,{loops}) both;"
            f"animation-play-state:var(--asnm-play,running)}}")
        frames = {}
        for pct, tr in m.frames:
            decl = tr if ":" in tr else f"transform:{tr}"
            frames.setdefault(decl, []).append(pct)
        kf = "".join(f"{','.join(_fmt(p) + '%' for p in pcts)}{{{decl}}}" for decl, pcts in frames.items())
        css.append(f"@keyframes asnm-{k}-{name}{{{kf}}}")
    for g in sorted(flat):
        ch = _chain(icon, g)
        ms = [icon.motions[c] for c in ch]
        assert len({(m.dur, m.delay) for m in ms}) == 1, f"{k}: motions in one chain must share duration and delay"
        m0 = icon.motions[g]
        N = 40
        kfs = []
        for i in range(N + 1):
            pct = 100 * i / N
            M, vis = chain_matrix(icon, g, pct)
            mtx = ",".join(_num(v, 4) for v in M)
            kfs.append(f"{_fmt(pct)}%{{transform:matrix({mtx});opacity:{_num(vis, 3)}}}")
        css.append(f".asnm-{k} .{g}-f{{transform-box:view-box;transform-origin:0 0;"
                   f"animation:asnm-{k}-{g}-f {_fmt(m0.dur)}s linear {_fmt(m0.delay)}s var(--asnm-loops,{loops}) both;"
                   f"animation-play-state:var(--asnm-play,running)}}")
        css.append(f"@keyframes asnm-{k}-{g}-f{{{''.join(kfs)}}}")
    if icon.motions:
        css.append(f"@media (prefers-reduced-motion:reduce){{.asnm-{k} *{{animation:none!important}}}}")
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" class="asnm-icon asnm-{k}" role="img">'
            f'<title>{icon.title}</title><style>{"".join(css)}</style>{out}</svg>\n')


# ---------------------------------------------------------------- motion QA
import re as _re


def _parse_tr(tr):
    """CSS transform list -> list of ('t', x, y) | ('r', deg) | ('s', k)."""
    if ":" in tr:
        m = _re.search(r"transform:([^;]*)", tr)
        tr = m.group(1) if m else "none"
    ops = []
    for name, args in _re.findall(r"(\w+)\(([^)]*)\)", tr):
        vals = [float(v.replace("px", "").replace("deg", "")) for v in _re.split(r"[ ,]+", args.strip()) if v]
        if name == "translate":
            ops.append(("t", vals[0], vals[1] if len(vals) > 1 else 0.0))
        elif name == "translateX":
            ops.append(("t", vals[0], 0.0))
        elif name == "translateY":
            ops.append(("t", 0.0, vals[0]))
        elif name == "rotate":
            ops.append(("r", vals[0]))
        elif name == "scale":
            ops.append(("s", vals[0], vals[1] if len(vals) > 1 else vals[0]))
    return ops


def _opacity(tr):
    m = _re.search(r"opacity:([\d.]+)", tr)
    return float(m.group(1)) if m else 1.0


def _mix(a, b, t):
    """Interpolate two op lists of the same shape; otherwise snap."""
    if len(a) != len(b) or any(x[0] != y[0] for x, y in zip(a, b)):
        a = a or [(o[0],) + tuple(0.0 if o[0] != "s" else 1.0 for _ in o[1:]) for o in b]
        b = b or [(o[0],) + tuple(0.0 if o[0] != "s" else 1.0 for _ in o[1:]) for o in a]
        if len(a) != len(b) or any(x[0] != y[0] for x, y in zip(a, b)):
            return b if t >= 0.5 else a
    return [(x[0],) + tuple(u + (v - u) * t for u, v in zip(x[1:], y[1:])) for x, y in zip(a, b)]


def _apply(path, ops, origin):
    p = move(path, -origin[0], -origin[1])
    for op in reversed(ops):
        if op[0] == "t":
            p = move(p, op[1], op[2])
        elif op[0] == "r":
            p = rotate(p, op[1], (0, 0))
        elif op[0] == "s":
            p = xf(p, op[1], 0, 0, op[2], 0, 0)
    return move(p, origin[0], origin[1])


def _bezier_ease(x1, y1, x2, y2):
    def bx(t): return 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t * t * x2 + t ** 3
    def by(t): return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3
    def f(x):
        lo, hi = 0.0, 1.0
        for _ in range(40):
            mid = (lo + hi) / 2
            if bx(mid) < x:
                lo = mid
            else:
                hi = mid
        return by((lo + hi) / 2)
    return f


_NAMED = {"linear": None, "ease": (.25, .1, .25, 1), "ease-in": (.42, 0, 1, 1), "ease-out": (0, 0, .58, 1),
          "ease-in-out": (.42, 0, .58, 1)}


def ease_fn(spec):
    spec = spec.strip()
    if spec in _NAMED:
        v = _NAMED[spec]
        return (lambda u: u) if v is None else _bezier_ease(*v)
    m = _re.match(r"cubic-bezier\(([^)]*)\)", spec)
    if m:
        return _bezier_ease(*[float(v) for v in m.group(1).split(",")])
    return lambda u: u


def _seg_ease(m, decl):
    mm = _re.search(r"animation-timing-function:([^;]*)", decl)
    return ease_fn(mm.group(1) if mm else m.ease)


def state_at(m, pct):
    """(ops, opacity) of motion m at percent pct of its loop, honouring per-keyframe easing."""
    fr = sorted(m.frames, key=lambda f: f[0])
    a = max((f for f in fr if f[0] <= pct), key=lambda f: f[0], default=fr[0])
    b = min((f for f in fr if f[0] > pct), key=lambda f: f[0], default=fr[-1])
    u = 0.0 if b[0] == a[0] else (pct - a[0]) / (b[0] - a[0])
    u = _seg_ease(m, a[1])(u)
    ops = _mix(_parse_tr(a[1]), _parse_tr(b[1]), u)
    op = _opacity(a[1]) + (_opacity(b[1]) - _opacity(a[1])) * u
    return ops, op


def motion_states(icon, steps=24):
    """Yield (time fraction, {group: (ops, opacity)}) samples across one loop of every motion."""
    for i in range(steps + 1):
        t = i / steps
        yield t, {name: state_at(m, t * 100) for name, m in icon.motions.items()}


def _mat(ops, origin):
    """2x3 affine (a,b,c,d,e,f) for CSS ops applied about origin."""
    def mul_(m, n):
        a, b, c, d, e, f = m
        A, B, C, D, E, F = n
        return (a * A + c * B, b * A + d * B, a * C + c * D, b * C + d * D, a * E + c * F + e, b * E + d * F + f)
    M = (1, 0, 0, 1, origin[0], origin[1])
    for op in ops:
        if op[0] == "t":
            M = mul_(M, (1, 0, 0, 1, op[1], op[2]))
        elif op[0] == "r":
            r = math.radians(op[1])
            M = mul_(M, (math.cos(r), math.sin(r), -math.sin(r), math.cos(r), 0, 0))
        elif op[0] == "s":
            M = mul_(M, (op[1], 0, 0, op[2], 0, 0))
    return mul_(M, (1, 0, 0, 1, -origin[0], -origin[1]))


def chain_matrix(icon, group, pct):
    """Composed transform and opacity of a group (with all its parents) at pct."""
    M, vis = (1, 0, 0, 1, 0, 0), 1.0
    for g in _chain(icon, group):   # outermost first
        m = icon.motions[g]
        ops, op = state_at(m, pct)
        A = _mat(ops, m.pivot)
        a, b, c, d, e, f = M
        A_, B_, C_, D_, E_, F_ = A
        M = (a * A_ + c * B_, b * A_ + d * B_, a * C_ + c * D_, b * C_ + d * D_, a * E_ + c * F_ + e, b * E_ + d * F_ + f)
        vis *= op
    return M, vis


def check_motion(icon, clearance=1.0, steps=24):
    """Report frames where a moving group touches ink it should stay clear of.

    A moving part may overlap only shapes it merges with (same merge tag) - for
    example an arm whose root sits inside the torso.
    """
    problems = []
    parts = icon.parts
    for t, st in motion_states(icon, steps):
        placed = []
        for p in parts:
            path, vis = p.path, 1.0
            g = p.group
            chain = []
            while g is not None:
                chain.append(g)
                g = icon.motions[g].parent if g in icon.motions else None
            for g in chain:  # innermost first
                if g in st:
                    ops, op = st[g]
                    path = _apply(path, ops, icon.motions[g].pivot)
                    vis *= op
            placed.append((p, path, vis))
        for i, (p, path, vis) in enumerate(placed):
            if p.group is None or vis < 0.3:
                continue
            for j, (q, qpath, qvis) in enumerate(placed):
                if j == i or qvis < 0.3 or q.group == p.group:
                    continue
                if p.merge and p.merge == q.merge:
                    continue
                # skip pairs inside the same parent chain
                hit = inter(path, grow(qpath, clearance))
                if abs(hit.area) > 0.4:
                    problems.append((round(t, 2), p.group, q.group or "static", round(abs(hit.area), 1)))
    return problems


def turn(a, b, c):
    """Degrees (clockwise on screen) that rotate direction a->b onto direction a->c."""
    a1 = math.atan2(b[1] - a[1], b[0] - a[0])
    a2 = math.atan2(c[1] - a[1], c[0] - a[0])
    d = math.degrees(a2 - a1)
    while d > 180:
        d -= 360
    while d < -180:
        d += 360
    return d


def kf(*frames):
    """Readable keyframes: kf((0, 'none'), (40, 'rotate(3deg)'), ...) -> list."""
    return list(frames)
