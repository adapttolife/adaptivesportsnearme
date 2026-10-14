import math
import kit
from kit import Icon, Motion, circle, union, brush, add, sub, mul, polar
import figure as F
from set import _props as B

LA = 25.0          # shoulder -> hands
LC = 41.0          # hands -> club head (shaft tip)
GROUND = 20.0


def club(grip, ang, L):
    """Shaft from the grip along ang (deg) for L, ending in a driver head: a fat bean hanging off the toe side."""
    tip = polar(grip, L, ang)
    shaft = brush([grip, polar(grip, L * 0.5, ang), tip], [2.6, 2.2, 1.8], ("round", "round"))
    u = (math.cos(math.radians(ang)), math.sin(math.radians(ang)))
    n = (-u[1], u[0])                       # toe side: clockwise of the shaft
    heel = add(tip, mul(u, -0.4))
    mid = add(add(tip, mul(n, 3.0)), mul(u, 1.1))
    toe = add(add(tip, mul(n, 5.9)), mul(u, 0.8))
    head = brush([heel, mid, toe], [2.8, 5.2, 4.7], ("round", "round"))
    return union(shaft, head)


def tee(x, h=5.2):
    g = GROUND
    cup = brush([(x - 2.3, g - h), (x, g - h + 0.3), (x + 2.3, g - h)], [1.5, 1.7, 1.5], ("round", "round"))
    stem = brush([(x, g - h + 0.6), (x, g - 1.8), (x, g)], [1.8, 1.4, 0.0], ("flat", "point"))
    return union(cup, stem)


def build():
    ic = Icon("golf", "Golf")
    P = F.Placement(40, 80)
    sh, hd = B.athlete(ic, P)
    th0, ph0 = -125.0, -24.0                    # top of the backswing: arm angle, shaft angle
    hand = polar(sh, LA, th0)
    bend = mul((math.cos(math.radians(th0 + 90)), math.sin(math.radians(th0 + 90))), -1.2)
    elbow = add(polar(sh, LA * 0.5, th0), bend)
    ic.add(P(F.arm([sh, elbow, hand], w0=7.0, w1=4.8, fist=3.4)), group="arm", merge="body", gap=False)
    ic.add(P(club(hand, ph0, LC)), group="club", merge="body")      # one mass with the fist (as in the moving chain)
    ic.add(P(F.head(hd)))                       # in front: the swinging arm passes behind the head
    tx = 60.0
    ic.add(P(tee(tx)))
    br = 3.5
    bc = (tx, GROUND - 5.2 - kit.GAP - br + 0.4)
    ic.add(P(circle(*bc, br)), group="ball")

    # impact: the shaft tip one gap behind the ball, low
    T = (bc[0] - br - kit.GAP - 2.2, bc[1] - 2.0)
    # arm angle th with |T - (sh + LA u(th))| = LC  (take the solution with the hands in front of the body)
    d = sub(T, sh)
    R = math.hypot(*d)
    k = (R * R + LA * LA - LC * LC) / (2 * LA * R)
    base = math.degrees(math.atan2(d[1], d[0]))
    thi = base - math.degrees(math.acos(max(-1, min(1, k))))
    hi = polar(sh, LA, thi)
    phi_i = B.ang(hi, T)
    psi0 = ph0 - th0                             # club angle relative to the arm at rest
    # follow-through: arm up in front (below the head line), club rising toward the target
    thf, phf = 9.0, -45.0

    arm_keys = [(0, th0), (0.10, th0), (0.17, th0 - 7), (0.31, thi), (0.35, thi + 3), (0.47, thf), (0.58, thf - 2),
                (0.86, th0), (1, th0)]
    # the club by its own (absolute) angle: a late release that brings the head down the far side of the
    # ball and in, never across the leg; then up toward the target, and back to the top kept low
    # (flatter while the arm passes overhead, so the swing never rises above the rest pose)
    club_abs = [(0, ph0), (0.10, ph0), (0.17, ph0 - 1), (0.24, 40.0), (0.26, 62.0), (0.27, 66.0), (0.31, phi_i),
                (0.35, phi_i - 12), (0.47, phf), (0.58, phf), (0.72, -10.0), (0.86, ph0), (1, ph0)]
    ts = B.times([arm_keys, club_abs], 40)
    dur = 2.8
    fa, fc = B.spline(arm_keys), B.spline(club_abs)
    ic.motion(Motion("arm", B.sampled(lambda t: B.rot_css(fa(t) - th0), ts), pivot=P.pt(sh), dur=dur, ease="linear"))
    ic.motion(Motion("club", B.sampled(lambda t: B.rot_css(B.wrap(fc(t) - fa(t) - psi0)), ts), pivot=P.pt(hand),
                     dur=dur, ease="linear", parent="arm"))
    # the ball: launched at impact, flies up and away (shrinks) and fades; a new one fades in on the tee
    fly = [(0, "transform:none;opacity:1"), (31, "transform:none;opacity:1"),
           (36, "transform:translate(7px,-8px) scale(.85);opacity:1"),
           (44, "transform:translate(15px,-21px) scale(.6);opacity:.8"),
           (52, "transform:translate(20px,-31px) scale(.4);opacity:0"),
           (53, "transform:none;opacity:0"), (70, "transform:none;opacity:0"),
           (80, "transform:none;opacity:1"), (100, "transform:none;opacity:1")]
    ic.motion(Motion("ball", fly, pivot=P.pt(bc), dur=dur, ease="linear"))
    return ic.finish(sweep=True)
