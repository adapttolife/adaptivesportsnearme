"""Lane E shared parts: the horse (riding, vaulting, equine therapy).

Horse space: ground at y = 0, the horse faces right (+x), one unit = one figure
unit (the athlete at scale 1), so a rider drawn with figure.py sits on it at
the right size. Withers height is 50 (the rider's hip-to-head is 29).

The horse is a few brush strokes: a swelling body stroke and an arched neck
stroke (one mass, its joins filleted like a single brush shape), a wedge head
with a round cheek and two leaf ears (its own shape, so the white gap behind it
reads as the bridle line), a mane band along the crest, a tail swoosh, and
four tapered legs ending in small round hooves (the far pair a little thinner).
The legs grow out of the body and merge where they cross, like a horse
silhouette pictogram; white gaps are kept for the rider, the head and mane.

canter() animates it: the body rocks and bobs in step with a real canter
footfall (hind pair, then the fore pair, leading fore last), the near legs fold
at knee and hock, the far legs swing, the head nods.
"""
import math
import pathops
import kit
from kit import Motion, brush, circle, union, diff, add, sub, mul, norm, lerp


# ---------------------------------------------------------------- helpers
def _dir(deg):
    """Unit vector deg degrees forward (+x) of straight down."""
    a = math.radians(deg)
    return (math.sin(a), math.cos(a))


def shrink(p, r):
    s = pathops.Path(p)
    s.stroke(2 * r, pathops.LineCap.ROUND_CAP, pathops.LineJoin.ROUND_JOIN, 4)
    s.convertConicsToQuads()
    return diff(p, union(s))


def smooth(p, r):
    """Fill the concave corners where strokes meet with radius-r fillets (one brush shape)."""
    return shrink(kit.grow(p, r), r)


# ---------------------------------------------------------------- landmarks
NF_TOP = (18.5, -37.5)      # near foreleg (shoulder joint, inside the chest)
FF_TOP = (14.0, -37.0)      # far foreleg (a little behind the near one)
NH_TOP = (-19.0, -43.0)     # near hind leg (hip joint, inside the quarters)
FH_TOP = (-12.5, -40.0)     # far hind leg (set forward: it shows under the belly)
POLL = (36.0, -68.5)        # top of the head
HEAD_ANG = 64.0             # face line, degrees below horizontal
THROAT = (28.0, -66.0)      # head nods about this point


# ---------------------------------------------------------------- legs
def fore_points(top, a, b, l1=17.0, l2=13.0):
    """Foreleg: forearm a degrees forward of down; the knee folds the cannon back by b."""
    knee = add(top, mul(_dir(a), l1))
    foot = add(knee, mul(_dir(a - b), l2))
    return knee, foot


def hind_points(top, a, b, l1=19.0, l2=13.0):
    """Hind leg: gaskin a degrees forward of down (negative = back); the hock folds the cannon forward by b."""
    hock = add(top, mul(_dir(a), l1))
    foot = add(hock, mul(_dir(a + b), l2))
    return hock, foot


def hoof(foot, deg):
    """Small round hoof: the pastern flares a little past the fetlock."""
    return brush([foot, add(foot, mul(_dir(deg), 1.6))], [3.6, 4.6], ("round", "round"))


def fore_leg(top, a, b, w=(9.0, 4.8, 3.6), far=False):
    """(upper, lower) shapes of a foreleg; lower includes the hoof."""
    knee, foot = fore_points(top, a, b)
    if far:
        w = (7.6, 4.3, 3.3)
    up = brush([top, lerp(top, knee, .5), knee], [w[0], (w[0] + w[1]) / 2 + .5, w[1]], ("round", "round"))
    lo = brush([knee, lerp(knee, foot, .5), foot], [w[1] - .2, (w[1] + w[2]) / 2, w[2]], ("round", "round"))
    pd = 26 if b < 40 else 26 - (b - 40) * 0.9      # a folded leg curls its hoof back
    return up, union(lo, hoof(foot, a - b + pd))


def hind_leg(top, a, b, w=(14.0, 5.2, 3.6), far=False):
    """(upper, lower) shapes of a hind leg: a haunch wedge whose back edge bows out (the buttock), then the cannon."""
    hock, foot = hind_points(top, a, b)
    if far:
        w = (9.0, 4.6, 3.3)
    d = norm(sub(hock, top))
    back = (-d[1], d[0])                 # perpendicular, turned to point behind the leg
    if back[0] > 0:
        back = (-back[0], -back[1])
    mid = add(lerp(top, hock, .42), mul(back, 1.3))
    up = brush([top, mid, hock], [w[0], w[0] * 0.66 + 0.6, w[1]], ("round", "round"))
    lo = brush([hock, lerp(hock, foot, .5), foot], [w[1] - .4, (w[1] + w[2]) / 2, w[2]], ("round", "round"))
    return up, union(lo, hoof(foot, a + b + 26))


# ---------------------------------------------------------------- body, neck, head
def barrel():
    return brush([(15.0, -41.5), (5, -39.5), (-5, -40), (-14, -41.5)], [17.5, 20.5, 19.5, 18.5], ("round", "round"))


def neck():
    return brush([(15.5, -44.5), (22.5, -52.0), (29.0, -58.0), (34.0, -62.5)], [19, 14.0, 11.0, 9.0], ("round", "round"))


def mass(r=6.0):
    """Body and neck as one brush shape."""
    return smooth(union(barrel(), neck()), r)


def mane():
    return brush([(34.5, -71.0), (29.5, -67.5), (23.0, -62.5), (16.0, -57.0), (8.5, -53.5)], [0, 4.8, 5.2, 4.0, 0],
                 ("point", "point"))


def _head_at(u, w):
    d = (math.cos(math.radians(HEAD_ANG)), math.sin(math.radians(HEAD_ANG)))
    n = (-d[1], d[0])
    return add(add(POLL, mul(d, u)), mul(n, w))


def head(ears=2):
    """Wedge head with a round cheek, and the ears (one shape): the far ear tips back behind the near one."""
    at = _head_at
    h = union(brush([at(2.6, 3.7), at(10, 3.6), at(16.6, 3.5)], [7.4, 7.6, 7.0], ("round", "round")),
              circle(*at(5.0, 5.8), 5.5))
    h = smooth(h, 2.0)
    e0 = at(0.6, 1.2)
    ear = brush([e0, add(e0, (-0.6, -4.8)), add(e0, (-1.8, -9.6))], [4.6, 3.4, 0.0], ("round", "point"))
    if ears == 2:
        e1 = add(e0, (-2.6, 1.4))
        far = brush([e1, add(e1, (-1.8, -4.2)), add(e1, (-4.4, -8.0))], [4.0, 3.0, 0.0], ("round", "point"))
        ear = union(ear, far)
    return union(h, ear)


def tail():
    return brush([(-25.5, -49.5), (-31.5, -52.5), (-38.0, -51.5), (-42.5, -46.5), (-44.5, -39.5), (-44.5, -31.5)],
                 [2.8, 4.8, 5.8, 5.4, 3.6, 0.0], ("round", "point"))


# ---------------------------------------------------------------- rider
def rider_leg(knee=(12.2, -8.4), ankle=(9.0, 7.6), toe=(16.0, 10.2)):
    """The logo leg's character, sized for a horse: pointed seat tail, thick thigh, shin, a foot tapering forward."""
    pts = [(-4.2, -24.0), (-4.0, -18.6), (-0.6, -14.8), (4.6, -13.0), (9.4, -10.8), knee,
           kit.lerp(knee, ankle, .5), ankle, kit.lerp(ankle, toe, .55), toe]
    return brush(pts, [0.0, 5.4, 8.6, 9.4, 9.2, 8.8, 7.6, 6.4, 4.2, 0.0], ("point", "point"))


def rider_body(lean=0.0):
    """Brush torso and the level swoosh back as one shape (filleted where they meet, like the logo's body)."""
    import figure as F
    return smooth(union(F.torso(lean), rider_back(lean)), 1.6)


def rider_back(lean=0.0):
    """The logo swoosh (rear arm) swept back level, so it clears the horse's croup."""
    pts = [(4.0, -34.6), (-2.5, -35.4), (-8.6, -34.0), (-13.9, -31.0), (-17.8, -27.4), (-20.4, -24.0)]
    b = brush(pts, [8.0, 7.6, 7.0, 5.8, 3.6, 0.0], ("round", "point"))
    return kit.rotate(b, lean, (2.6, -19.5)) if lean else b


# ---------------------------------------------------------------- canter
def _blend(keys, x):
    """keys [(x, values...)] periodic on [0, 1); smooth (cosine) blend between neighbours."""
    x %= 1.0
    ks = keys + [(keys[0][0] + 1.0,) + tuple(keys[0][1:])]
    for k0, k1 in zip(ks, ks[1:]):
        x0, x1 = k0[0], k1[0]
        xx = x if x >= x0 else x + 1.0
        if x0 <= xx <= x1:
            f = (xx - x0) / (x1 - x0)
            f = (1 - math.cos(math.pi * f)) / 2
            return tuple(a + (b - a) * f for a, b in zip(k0[1:], k1[1:]))
    return tuple(keys[0][1:])


# one leg's cycle in its own time: 0 = hoof lands, stance until ~0.38, then the swing
FORE_CYCLE = [(0.00, 24, 0), (0.19, 2, 0), (0.38, -15, 10), (0.55, 6, 104), (0.70, 36, 98), (0.86, 34, 34)]
HIND_CYCLE = [(0.00, 2, 36), (0.19, -16, 28), (0.38, -36, 14), (0.55, -32, 52), (0.72, -16, 70), (0.88, -2, 52)]


def leg_pose(kind, tau):
    return _blend(FORE_CYCLE if kind == "f" else HIND_CYCLE, tau)


# ---------------------------------------------------------------- the cantering horse, animated
BODY_PIVOT = (0.0, -40.0)       # the body rocks about its middle (horse space)
LEG_OFFSETS = dict(nh=0.0, fh=-0.2, nf=-0.15, ff=-0.30)   # canter: hind pair, then the fore pair, leading fore last


def body_state(g, pitch=2.4, bob=1.3):
    """Body pitch (deg, + = nose down) and drop (horse units, + = down) at gait phase g (0 = near hind lands).

    The forehand rises while the hind legs carry the horse (g ~ .15), dips as the
    forelegs land (g ~ .65); the body is lowest mid-support and highest in the
    suspension that ends each stride.
    """
    return -pitch * math.cos(2 * math.pi * (g - 0.15)), bob * math.cos(2 * math.pi * (g - 0.35))


def _fmt(v, nd=1):
    s_ = f"{v:.{nd}f}"
    if "." in s_:
        s_ = s_.rstrip("0").rstrip(".")
    return "0" if s_ in ("-0", "") else s_


def canter(ic, place, t0=0.0, dur=1.6, N=8, rider=None, knock=None, nod=3.0, pitch=1.7, bob=1.3):
    """Add the cantering horse to ic. place: (scale, (x, y)) maps horse space into the icon.

    rider(add) is called while the body group is open: anything it adds rides the
    horse rigidly (it rocks and bobs with the body) and its parts are cut out of
    the far legs. Returns a Canter with the placement and the body's motion, so an
    icon can hang its own groups on the body (Motion parent "hb").
    """
    k, (ox, oy) = place
    hz = lambda p: kit.xf(p, k, 0, 0, k, ox, oy)
    hp = lambda q: (ox + q[0] * k, oy + q[1] * k)
    ts = [i / N for i in range(N + 1)]
    pose = lambda leg, t: leg_pose(leg[1], t0 + t + LEG_OFFSETS[leg])
    rest = {g: pose(g, 0.0) for g in LEG_OFFSETS}

    def legs_of(kind, top, a, b):
        return (fore_leg if kind == "f" else hind_leg)(top, a, b)

    # body group parts first collected so the far legs can be pre-cut by them
    body_parts = [(hz(tail()), {}), (hz(mass()), {"merge": "h"}), (hz(mane()), {})]
    if knock is not None:      # e.g. a rein crossing the neck: a thin white line through the ink
        body_parts = [(diff(p, knock), kw) for p, kw in body_parts]
    extra = []
    if rider:
        rider(lambda path, **kw: extra.append((path, kw)))
    # far legs merge into the horse's silhouette; only the rider's parts cut them
    cutter = kit.grow(union(*[p for p, kw in extra if kw.get("gap", True)]), kit.GAP) if extra else None
    # far legs: rigid children of the body (they swing about the shoulder / hip), pre-cut by the rider
    for leg, top in (("ff", FF_TOP), ("fh", FH_TOP)):
        up, lo = (fore_leg if leg[1] == "f" else hind_leg)(top, *rest[leg], far=True)
        shape = hz(union(up, lo))
        ic.add(diff(shape, cutter) if cutter is not None else shape, group=leg, merge="h", gap=False)
    for path, kw in body_parts:
        ic.add(path, group="hb", **kw)
    for path, kw in extra:
        ic.add(path, group="hb", **kw)
    # near legs: children of the body, one mass with it
    for leg, top in (("nf", NF_TOP), ("nh", NH_TOP)):
        up, lo = legs_of(leg[1], top, *rest[leg])
        ic.add(hz(up), group=leg + "1", merge="h", gap=False)    # legs merge where they cross
        ic.add(hz(lo), group=leg + "2", merge="h", gap=False)
    ic.add(hz(head()), group="hd", merge="hd")

    # ---- motion
    C = hp(BODY_PIVOT)

    def hb_at(t):
        p1, l1 = body_state(t0 + t, pitch, bob)
        p0, l0 = body_state(t0, pitch, bob)
        return p1 - p0, (l1 - l0) * k

    def frames(fn):
        return [(t * 100, fn(t) if 0 < t < 1 else "none") for t in ts]

    ic.motion(Motion("hb", frames(lambda t: f"translate(0px,{_fmt(hb_at(t)[1])}px) rotate({_fmt(hb_at(t)[0])}deg)"),
                     pivot=C, dur=dur, ease="linear"))
    for leg, top in (("nf", NF_TOP), ("nh", NH_TOP)):
        a0, b0 = rest[leg]
        j0, _ = (fore_points if leg[1] == "f" else hind_points)(top, a0, b0)
        sgn = 1 if leg[1] == "f" else -1
        ic.motion(Motion(leg + "1", frames(lambda t, leg=leg, a0=a0: f"rotate({_fmt(-(pose(leg, t)[0] - a0), 0)}deg)"),
                         pivot=hp(top), dur=dur, ease="linear", parent="hb"))
        ic.motion(Motion(leg + "2", frames(lambda t, leg=leg, b0=b0, sgn=sgn: f"rotate({_fmt(sgn * (pose(leg, t)[1] - b0), 0)}deg)"),
                         pivot=hp(j0), dur=dur, ease="linear", parent=leg + "1"))
    for leg, top in (("ff", FF_TOP), ("fh", FH_TOP)):
        a0 = rest[leg][0]
        ic.motion(Motion(leg, frames(lambda t, leg=leg, a0=a0: f"rotate({_fmt(-(pose(leg, t)[0] - a0), 0)}deg)"),
                         pivot=hp(top), dur=dur, ease="linear", parent="hb"))
    # head: the body's motion composed with a nod about the throat (not a child, so its gap can cut the neck)
    T = hp(THROAT)

    def hd_at(t):
        th, dy = hb_at(t)
        nu = nod * (math.cos(2 * math.pi * (t0 + t - 0.3)) - math.cos(2 * math.pi * (t0 - 0.3)))
        r = kit.rot(T, C, th)
        return (r[0] - T[0], r[1] + dy - T[1]), th + nu

    ic.motion(Motion("hd", frames(lambda t: f"translate({_fmt(hd_at(t)[0][0])}px,{_fmt(hd_at(t)[0][1])}px) rotate({_fmt(hd_at(t)[1])}deg)"),
                     pivot=T, dur=dur, ease="linear"))
    return Canter(hz, hp, hb_at, frames, dur)


class Canter:
    """What an icon needs to hang its own moving parts on the cantering horse."""

    def __init__(self, hz, hp, body_at, frames, dur):
        self.hz, self.hp, self.body_at, self.frames, self.dur = hz, hp, body_at, frames, dur
