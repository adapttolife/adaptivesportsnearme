"""Lane D1 helpers for the wheeled sports (wheelchair racing, handcycling, cycling,
power soccer) and the seated thrower: spoked wheels, two-joint limbs with a
small IK solver, the logo thigh cut below the knee, and a finish() that guards
against a pathops quirk in kit.union()."""
import math
import pathops
import kit
from kit import brush, circle, union, diff, outline, add, sub, mul, norm, dist, polar, lerp, Motion
import figure as F

HUB = (0.0, -0.35)          # centre of the logo wheel's inner edge (spokes turn about it)
HOLE_R = 13.3               # radius of the logo wheel's inner edge
TORSO_TOP, TORSO_R = (4.8, -32.4), 5.4      # top end of F.torso() and its cap radius


# ---------------------------------------------------------------- joints
def ik(a, t, l1, l2, bend=1):
    """Middle joint of a two-link chain from a reaching t; bend=+1 puts it clockwise (screen) of a->t."""
    d = dist(a, t)
    d = max(min(d, l1 + l2 - 1e-6), abs(l1 - l2) + 1e-6)
    x = (l1 * l1 - l2 * l2 + d * d) / (2 * d)
    h = math.sqrt(max(0.0, l1 * l1 - x * x))
    u = norm(sub(t, a))
    n = (-u[1], u[0])
    return add(add(a, mul(u, x)), mul(n, h * bend))


def ang(a, b):
    return math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))


def wrap(d):
    while d > 180:
        d -= 360
    while d < -180:
        d += 360
    return d


def unwrap(vals):
    """Make a list of angles continuous (no jumps over 180), so CSS never spins the long way round."""
    out = []
    for v in vals:
        if out:
            while v - out[-1] > 180:
                v -= 360
            while v - out[-1] < -180:
                v += 360
        out.append(v)
    return out


def seg(a, b, w0, w1, end_r=None):
    """One limb segment with round ends (upper arm, forearm), optionally ending in a fist."""
    s = brush([a, lerp(a, b, 0.5), b], [w0, (w0 + w1) / 2, w1], ("round", "round"))
    if end_r:
        s = union(s, circle(*b, end_r))
    return s


def head_off(top, deg):
    """Head centre one standard gap clear of the torso's top cap, in direction deg."""
    return add(top, mul(polar((0, 0), 1.0, deg), F.HEAD_R + TORSO_R + kit.GAP + 0.3))


def half(p0, n, size=300.0):
    """Big polygon covering the side of the line through p0 (normal n) that n points away from."""
    n = norm(n)
    t = (-n[1], n[0])
    a = add(p0, mul(t, size))
    b = sub(p0, mul(t, size))
    return kit.poly([a, b, sub(b, mul(n, size)), sub(a, mul(n, size))])


def thigh_of_logo(cut=(28.6, -7.4), n=(0.64, 0.77)):
    """The logo's own leg (tail, hip and thigh) cut off below the knee, so a custom shin can carry on."""
    return kit.inter(F.leg(), half(cut, n))


# ---------------------------------------------------------------- wheels
def disc(c, r):
    """A circle whose Bezier joins sit at 45 degrees. kit.union() (a pathops OpBuilder) can fill
    the hole of a ring built from circles jointed at 0/90/180/270; these keep their holes."""
    return kit.rotate(circle(*c, r), 45.0, c)


def ring(c, ro, ri):
    return diff(disc(c, ro), disc(c, ri))


def spokes(c, r, n, w=1.0, hub=2.2, a0=-90.0, rim=None, rim_w=1.4):
    """Hub disc, n thin spokes out to radius r, optional thin ring (a push rim) at radius rim.
    With a rim, keep no spoke vertical (a0=-63 for five): kit.union() fills some gaps otherwise."""
    parts = [disc(c, hub)]
    for i in range(n):
        parts.append(outline([c, polar(c, r, a0 + 360.0 * i / n)], w, "butt"))
    if rim:
        parts.append(ring(c, rim + rim_w / 2, rim - rim_w / 2))
    return union(*parts)


def spoke_clip(r_open=9.6, a0=-134.0, a1=-18.0):
    """Static clip for spokes turning inside the logo wheel: full length where the tyre is,
    cut short (r_open) across the C's opening, where the body sits."""
    wedge = kit.poly([HUB] + [polar(HUB, 30.0, a0 + (a1 - a0) * i / 24) for i in range(25)])
    return union(circle(*HUB, r_open), diff(circle(*HUB, HOLE_R + 0.3), wedge))


def spin(name, hub, dur, deg=360.0, parent=None):
    return Motion(name, [(0, "none"), (100, f"rotate({deg:g}deg)")], pivot=hub, dur=dur, ease="linear", parent=parent)


# ---------------------------------------------------------------- assembly
def flat(*parts):
    """Flatten static shapes into one path with their white gaps already cut (back to front;
    each item is a path or (path, merge)). One static part means one mask behind moving parts
    instead of one per shape, which keeps the SVG small."""
    items = [(p, None) if not isinstance(p, tuple) else p for p in parts]
    out = []
    for i, (p, m) in enumerate(items):
        cut = [q for q, mq in items[i + 1:] if not (m and m == mq)]
        out.append(diff(p, kit.grow(union(*cut), kit.GAP)) if cut else p)
    return union(*out)


def _sum(paths):
    """Union by plain boolean ops (no OpBuilder): what kit.union() should give."""
    acc = pathops.Path()
    for p in paths:
        acc = pathops.op(acc, p, pathops.PathOp.UNION, fix_winding=True)
    return acc


def finish(ic, **kw):
    """ic.settle() (centre the rest pose, nudge only if the motion would leave the box), then
    check every moving group the way render() will draw it: kit.union() of a lone path can
    fill a hole (a push rim, the gaps between spokes). A group that loses area is turned by a
    hair about its pivot (at most 0.3 deg); if that cannot fix it, fail loudly."""
    ic.settle(**kw)
    groups = [g for g in dict.fromkeys(p.group for p in ic.parts) if g is not None]
    for g in groups:
        piv = ic.motions[g].pivot
        for attempt in range(40):
            parts = ic.resolved()
            bad = False
            for c in ("i", "a"):
                ps = [p.path for p in parts if p.group == g and p.cls == c]
                if ps:
                    ref = abs(_sum(ps).area)
                    bad = bad or abs(abs(kit.union(*ps).area) - ref) > 0.01 * max(1.0, ref)
            if not bad:
                break
            d = 0.0075 * (attempt + 1) * (1 if attempt % 2 else -1)
            for p in ic.parts:
                if p.group == g:
                    p.path = kit.rotate(p.path, d, piv)
        else:
            raise RuntimeError(f"{ic.key}: group {g} keeps losing holes in kit.union")
    return ic
