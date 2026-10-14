"""Wheelchair racing: the athlete folded low over the knees in a racing chair (big
rear wheel with a push rim and spokes, long frame, small front wheel). The arm
drives the push rim with the wheel, then recovers; the wheels spin; the trunk
pumps; speed lines stream behind."""
import math
import kit
from kit import Icon, Motion, brush, union, add, polar
import figure as F
from set import _wheels as D

LEAN = 62                 # upper body folded forward over the knees
RIM = 7.6                 # push rim radius (the fist stays inside the wheel's inner edge)
L1, L2 = 12.2, 11.8       # upper arm, forearm
DUR = 1.6
REAR_TURN = 288           # rear wheel degrees per loop (five spokes: any multiple of 72 loops cleanly)
FRONT_TURN = 900          # front wheel degrees per loop (six spokes: a multiple of 60)
CATCH, RELEASE = -70.0, 18.0
N = 16                    # keyframes for the arm chain
SH = F.rot(F.SHOULDER, F.HIP, LEAN)


def hand_at(t):
    """Fist target in figure space at loop time t. Pushing, the fist rides the rim with the wheel
    (rest pose: 3 o'clock, mid-push); recovering, the nearly straight arm swings back to the catch."""
    w = REAR_TURN
    tc = 1.0 + CATCH / w                # catch time; pushing runs tc -> 1 -> tr
    tr = RELEASE / w
    t %= 1.0
    if t <= tr or t >= tc:
        th = (t if t <= tr else t - 1.0) * w
        return polar(D.HUB, RIM, th)
    u = (t - tr) / (tc - tr)
    e = (1 - math.cos(math.pi * u)) / 2
    a, b = polar(D.HUB, RIM, RELEASE), polar(D.HUB, RIM, CATCH)
    pa, pb = D.ang(SH, a), D.ang(SH, b)
    ra, rb = kit.dist(SH, a), kit.dist(SH, b)
    phi = pa + D.wrap(pb - pa) * e
    r = ra + (rb - ra) * e - 1.2 * math.sin(math.pi * u)
    return polar(SH, r, phi)


def pump(t):
    """Trunk lean change (deg): lowest at the release, highest at the catch; 0 at rest."""
    tl = RELEASE / REAR_TURN
    return 2.0 * math.cos(2 * math.pi * (t - tl)) - 2.0 * math.cos(2 * math.pi * tl)


def build():
    ic = Icon("wheelchairracing", "Wheelchair racing")
    P = F.Placement(40, 70)
    hip = F.HIP
    sh = F.rot(F.SHOULDER, hip, LEAN)
    T = F.rot(D.TORSO_TOP, hip, LEAN)

    # leg: thigh tucked under the chest, a rounded knee, shin down, foot forward on the frame
    knee, ankle = (25.6, -8.8), (28.0, 4.0)
    leg = union(F.thigh((18.0, -10.6), knee, 8.6, 8.2), F.shin(knee, ankle, 8.0, 4.8))
    # speed lines streaming behind
    ic.add(P(F.swoosh([(-39.0, -1.0), (-32.5, -1.8), (-26.0, -1.6)], 2.0)), group="v1")
    ic.add(P(F.swoosh([(-36.0, 8.0), (-30.5, 7.4), (-25.0, 7.6)], 1.8)), group="v2")
    # frame: one tube from behind the wheel, under the feet, to the front fork
    fr = 8.0
    fhub = (54.0, 20.0 - fr)
    ic.add(P(brush([(12.0, 9.4), (29.0, 10.2), (40.0, 11.0), fhub], [3.4, 3.0, 2.6, 2.2], ("round", "round"))))
    ic.add(P(F.wheel()))
    ic.add(P(D.spokes(D.HUB, D.HOLE_R, 5, w=1.0, hub=2.4, a0=-63, rim=RIM, rim_w=1.5)), group="sp", gap=False)
    ic.add(P(leg), cls="a")
    # upper body: the swoosh back arcs over the wheel, the torso folds forward
    back = brush([add(T, (-0.6, -1.6)), add(T, (-8.0, -3.6)), add(T, (-16.0, -3.6)), add(T, (-23.0, -1.0)),
                  add(T, (-28.5, 3.0))], [8.0, 7.6, 7.0, 5.0, 0.0], ("round", "point"))
    ic.add(P(back), group="up", merge="body")
    ic.add(P(F.torso(LEAN)), group="up", merge="body")
    hd = D.head_off(T, -22)
    ic.add(P(F.head(hd)), group="up")
    ic.add(P(D.ring(fhub, fr, fr - 2.5)))
    ic.add(P(D.spokes(fhub, fr - 2.5, 6, w=0.8, hub=1.6)), group="fs", gap=False)
    # near arm in two pieces so the fist can ride the rim
    h0 = hand_at(0.0)
    e0 = D.ik(sh, h0, L1, L2, bend=-1)
    ua, fa = D.seg(sh, e0, 7.2, 5.9), D.seg(e0, h0, 5.9, 4.6, end_r=3.4)
    ic.add(P(ua), group="ua", merge="body")
    ic.add(P(fa), group="fa", merge="body")

    ts = [i / N for i in range(N + 1)]
    a_up, a_ua, a_fa = [], [], []
    for t in ts:
        u = pump(t)
        s = F.rot(sh, hip, u)
        h = hand_at(t)
        e = D.ik(s, h, L1, L2, bend=-1)
        wu = D.wrap(D.ang(s, e) - D.ang(sh, e0))
        wf = D.wrap(D.ang(e, h) - D.ang(e0, h0))
        a_up.append(u)
        a_ua.append(wu - u)
        a_fa.append(wf - wu)
    a_ua, a_fa = D.unwrap(a_ua), D.unwrap(a_fa)
    fr_ = lambda vals: [(round(t * 100, 2), "none" if t in (0, 1) else f"rotate({v:.1f}deg)") for t, v in zip(ts, vals)]
    ic.motion(Motion("up", fr_(a_up), pivot=P.pt(hip), dur=DUR, ease="linear"))
    ic.motion(Motion("ua", fr_(a_ua), pivot=P.pt(sh), dur=DUR, ease="linear", parent="up"))
    ic.motion(Motion("fa", fr_(a_fa), pivot=P.pt(e0), dur=DUR, ease="linear", parent="ua"))
    sp = D.spin("sp", P.pt(D.HUB), DUR, REAR_TURN)
    sp.clip = P(D.spoke_clip())
    ic.motion(sp)
    ic.motion(D.spin("fs", P.pt(fhub), DUR, FRONT_TURN))
    for name, y, ph in (("v1", -1.6, 0.0), ("v2", 7.6, 0.5)):
        fade = [(0, "transform:none;opacity:1"), (45, "transform:translate(-5px,0px);opacity:0"),
                (46, "transform:translate(4px,0px);opacity:0"), (70, "transform:translate(2px,0px);opacity:1"),
                (100, "transform:none;opacity:1")]
        if ph:
            fade = [(0, "transform:none;opacity:1"), (20, "transform:translate(-2px,0px);opacity:1"),
                    (60, "transform:translate(-5px,0px);opacity:0"), (61, "transform:translate(4px,0px);opacity:0"),
                    (90, "transform:translate(1px,0px);opacity:1"), (100, "transform:none;opacity:1")]
        ic.motion(Motion(name, fade, pivot=P.pt((-30.0, y)), dur=DUR, ease="linear"))
    return D.finish(ic)
