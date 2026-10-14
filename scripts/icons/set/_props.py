"""Lane B helpers: two-bone arms, sampled keyframes, small balls, impact swooshes, cut strokes.

Shared by golf, fencing, martial arts, boccia, curling, shooting, dance and multi. Everything
draws in figure space (wheel centre 0,0) like figure.py.

Two kit behaviours shape these icons (worked around here, not changed in the kit):
- groups in one parent/child chain never cut gaps into each other while moving, so parts of a
  chain (a head and an arm, a rifle and a torso) are designed to keep a full GAP of clearance;
- a moving group cuts its gap into static ink behind it even when both share a merge tag, so an
  arm whose root sits in the static body is added with gap=False (it crosses nothing else).
"""
import math
import kit
from kit import brush, circle, diff, union, outline, inter, poly, add, sub, mul, norm, dist
import figure as F


# ---------------------------------------------------------------- geometry
def ang(a, b):
    """Screen angle (deg, clockwise from +x) of the direction a -> b."""
    return math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))


def wrap(d):
    """Angle folded into -180..180."""
    while d > 180:
        d -= 360
    while d < -180:
        d += 360
    return d


def ik(a, c, l1, l2, bend=1):
    """Elbow of a two-bone limb a -> elbow -> c with bone lengths l1, l2.

    bend=+1 puts the elbow on the clockwise side of a->c (below a forward reach), -1 the other side.
    """
    d = min(dist(a, c), l1 + l2 - 1e-6)
    x = (l1 * l1 - l2 * l2 + d * d) / (2 * d)
    h = math.sqrt(max(0.0, l1 * l1 - x * x))
    u = norm(sub(c, a))
    n = (-u[1], u[0])
    return add(add(a, mul(u, x)), mul(n, h * bend))


def arm_angles(R, E0, H0, H, bend=1):
    """Two-bone arm with rest pose R-E0-H0 reaching hand target H.

    Returns (upper-arm turn about R, forearm turn about E0 relative to the upper arm) in degrees,
    for nested Motion groups (forearm parent = upper arm).
    """
    l1, l2 = dist(R, E0), dist(E0, H0)
    E = ik(R, H, l1, l2, bend)
    a1 = wrap(ang(R, E) - ang(R, E0))
    a2 = wrap(ang(E, H) - ang(E0, H0))
    return a1, wrap(a2 - a1)


# ---------------------------------------------------------------- keyframes
def spline(keys):
    """Monotone cubic through keys [(t, value)]: velocity carries through a key unless it is a turn or a hold."""
    return kit._pchip([k[0] for k in keys], [k[1] for k in keys])


def times(keys, n=24):
    """Sample times: n uniform steps plus every key time (so holds and turns land exactly)."""
    ts = set(round(i / n, 4) for i in range(n + 1))
    for ks in keys:
        ts.update(round(k[0], 4) for k in ks)
    return sorted(ts)


def sampled(fn, ts):
    """Keyframes [(pct, css)] from fn(t) at times ts (0 and 1 are forced to the rest pose 'none')."""
    return [(round(t * 100, 2), "none" if t in (0, 1) else fn(t)) for t in ts]


def rot_css(deg):
    v = round(deg, 1)
    return "none" if v == 0 else f"rotate({v:g}deg)"


# ---------------------------------------------------------------- the athlete, in parts
def torso(lean=0.0):
    """The brush torso with its top pulled 1 unit down-left so the head's gap never nicks the shoulder."""
    t = brush([(4.6, -32.4), (4.4, -26.0), (3.4, -19.8)], [11.0, 9.8, 7.2], ("round", "round"))
    return kit.rotate(t, lean, F.HIP) if lean else t


def athlete(ic, P, lean=0.0, back=True, group=None):
    """The logo athlete minus the head (so an icon can put an arm behind it): body, wheel, leg.

    back=True: the logo's own torso + swoosh back. back=None: the brush torso alone (a raised rear
    arm takes the swoosh's place). back=<path>: the brush torso plus that path as the rear arm.
    Returns (shoulder, head centre) in figure space after the lean.
    """
    sh, hd = F.upper(lean)
    if back is True:
        ic.add(P(F.body(lean)), merge="body", group=group)
    else:
        if back is not None:
            ic.add(P(back), merge="body", group=group)
        ic.add(P(torso(lean)), merge="body", group=group)
    ic.add(P(F.wheel()))
    ic.add(P(F.leg()), cls="a")
    return sh, hd


def cut_stroke(path, pts, joints, widths):
    """Cut one smooth stroke into lengths at the given point indices (lines square to the stroke).

    Returns [length0, length1, ...]; every length after the first carries a round joint disc so it
    can turn about its joint without opening a seam.
    """
    aheads = []
    for j in joints:
        p = pts[j]
        t = norm(sub(pts[min(j + 1, len(pts) - 1)], pts[max(j - 1, 0)]))
        n = (-t[1], t[0])
        far = 400.0
        aheads.append(poly([add(p, mul(n, far)), add(add(p, mul(n, far)), mul(t, far)),
                            add(add(p, mul(n, -far)), mul(t, far)), add(p, mul(n, -far))]))
    out = []
    for k in range(len(joints) + 1):
        piece = path
        if k > 0:
            piece = inter(piece, aheads[k - 1])
        if k < len(joints):
            piece = diff(piece, aheads[k])
        if k > 0:
            j = joints[k - 1]
            piece = union(piece, circle(*pts[j], widths[j] / 2))
        out.append(piece)
    return out


# ---------------------------------------------------------------- props
def basketball(c, r, w=None):
    """Ball with the four basketball seams cut out (same drawing as set/basketball.py)."""
    x, y = c
    w = w or max(0.8, r * 0.155)
    seams = union(
        outline(kit.arc_pts((x - r * 1.55, y), r * 1.25, -38, 38), w),
        outline(kit.arc_pts((x + r * 1.55, y), r * 1.25, 142, 218), w),
        outline([(x - r, y - 0.1), (x + r, y + 0.1)], w),
        outline([(x - 0.1, y - r), (x + 0.1, y + r)], w),
    )
    return diff(circle(x, y, r), seams)


def tennis_ball(c, r, w=None):
    """Tennis ball: one disc, the S seam cut as a pair of facing arcs."""
    x, y = c
    w = w or max(0.75, r * 0.2)
    seam = union(outline(kit.arc_pts((x - r * 1.18, y), r * 0.92, -62, 62), w),
                 outline(kit.arc_pts((x + r * 1.18, y), r * 0.92, 118, 242), w))
    return diff(circle(x, y, r), seam)


def soccer_ball(c, r, w=None, spin=-90.0):
    """Soccer ball, one ink: a dark disc with white seams - a centre pentagon and five seams out to the rim."""
    w = w or max(0.75, r * 0.17)
    pent = [kit.polar(c, r * 0.42, spin + 72 * i) for i in range(5)]
    seams = [outline(pent + [pent[0]], w)]
    for i in range(5):
        seams.append(outline([pent[i], kit.polar(c, r + 1.0, spin + 72 * i)], w))
    return diff(circle(c[0], c[1], r), union(*seams))


def boccia_ball(c, r, w=None):
    """Leather boccia ball: disc with two panel seams."""
    x, y = c
    w = w or max(0.75, r * 0.18)
    seams = union(outline(kit.arc_pts((x - r * 1.35, y - r * 0.2), r * 1.15, -48, 40), w),
                  outline(kit.arc_pts((x + r * 0.95, y - r * 1.25), r * 1.05, 98, 168), w))
    return diff(circle(x, y, r), seams)


def ring(c, r, w):
    """A ring (the white jack in boccia)."""
    return kit.ring(c[0], c[1], r, r - w)


def dome(c, deg, depth, half):
    """Half-ellipse cup (a fencing bell guard in profile): flat side at c, bulging toward deg."""
    u = (math.cos(math.radians(deg)), math.sin(math.radians(deg)))
    n = (-u[1], u[0])
    pts = [add(add(c, mul(u, depth * math.cos(a))), mul(n, half * math.sin(a)))
           for a in [(-math.pi / 2) + math.pi * i / 24 for i in range(25)]]
    return poly(pts)


def burst(c, deg, n=3, r0=2.0, r1=7.5, spread=28.0, w=1.9, bend=0.0):
    """n short swooshes radiating from c around direction deg (impact lines, muzzle lines)."""
    out = []
    for i in range(n):
        a = deg + spread * (i - (n - 1) / 2)
        ln = (r1 - r0) * (1.0 if i == (n - 1) // 2 else 0.78)
        p0 = kit.polar(c, r0, a)
        p2 = kit.polar(c, r0 + ln, a)
        mid = kit.polar(c, r0 + ln * 0.5, a + bend)
        out.append(brush([p0, mid, p2], [0.0, w, 0.0], ("point", "point")))
    return union(*out)
