"""Track and field: a seated thrower on a throwing frame (no wheel), legs forward,
the far arm cocked back with a javelin angled up and forward. The arm whips up
and through, driving the javelin along its own line; the javelin flies off up
and to the right and fades, the arm comes back, and a new javelin fades into
the hand."""
import math
import kit
from kit import Icon, Motion, brush, union, add, mul, polar
import figure as F
from set import _wheels as D

LEAN = -6                   # torso tipped back a little in the cocked position
JAV = -28.0                 # javelin angle (up and forward)
U = polar((0, 0), 1.0, JAV)
L1, L2 = 12.6, 11.4         # throwing arm: upper arm, forearm
GRIP = (-19.0, -46.4)
DUR = 2.4
PULL = 23.0                 # how far the hand drives the javelin along its axis before letting go
SHIFT = (2.0, -0.5)         # the throwing shoulder comes through from behind
T_WIND, T_PULL, T_REL, T_FOLLOW, T_SETTLE, T_HOME, T_NEW = 0.10, 0.22, 0.32, 0.40, 0.48, 0.80, 0.82
FOLLOW = 10.0               # the arm carries on past the release (deg), stopping short of the head


def javelin(grip, back=10.0, front=36.0):
    """Shaft, cord grip and a pointed metal head, through the grip point."""
    tail = add(grip, mul(U, -back))
    tip = add(grip, mul(U, front))
    head0 = add(grip, mul(U, front - 6.5))
    shaft = brush([tail, grip, head0], [0.9, 1.6, 1.5], ("round", "flat"))
    head = brush([head0, add(head0, mul(U, 2.5)), tip], [2.2, 1.8, 0.0], ("flat", "point"))
    cord = brush([add(grip, mul(U, -2.6)), add(grip, mul(U, 2.6))], [2.4, 2.4], ("round", "round"))
    return union(shaft, head, cord)


def sm(u):
    u = min(1.0, max(0.0, u))
    return (1 - math.cos(math.pi * u)) / 2


def phase(t, a, b):
    return min(1.0, max(0.0, (t - a) / (b - a)))


def trunk(t):
    """Torso lean change (deg): back in the wind-up, forward through the throw, home again."""
    if t < T_PULL:
        return -3.0 * sm(phase(t, T_WIND, T_PULL))
    if t < T_REL:
        return -3.0 + 9.0 * phase(t, T_PULL, T_REL) ** 2
    if t < T_SETTLE:
        return 6.0 + 2.0 * sm(phase(t, T_REL, T_SETTLE))
    return 8.0 * (1 - sm(phase(t, T_SETTLE, T_HOME)))


def shoulder_shift(t):
    if t < T_PULL:
        return 0.0
    if t < T_REL:
        return phase(t, T_PULL, T_REL) ** 1.5
    if t < T_SETTLE:
        return 1.0
    return 1 - sm(phase(t, T_SETTLE, T_HOME))


def hand(t, S):
    """Throwing hand in figure space; S is the throwing shoulder at this instant."""
    if t < T_PULL:                                 # wind-up: draw back along the javelin
        return add(GRIP, mul(U, -2.4 * sm(phase(t, T_WIND, T_PULL))))
    rel = add(GRIP, mul(U, PULL))
    if t < T_REL:                                  # the drive: push the javelin along its own line
        return add(GRIP, mul(U, -2.4 + (PULL + 2.4) * phase(t, T_PULL, T_REL) ** 2))
    a_rel, r_rel = D.ang(S, rel), kit.dist(S, rel)
    if t < T_SETTLE:                               # follow-through: the arm carries on and slows
        k = 1 - (1 - phase(t, T_REL, T_FOLLOW)) ** 2
        return polar(S, r_rel, a_rel + FOLLOW * k)
    # the arm comes back down into the cocked pose
    k = sm(phase(t, T_SETTLE, T_HOME))
    a1, r1 = D.ang(S, GRIP), kit.dist(S, GRIP)
    return polar(S, r_rel + (r1 - r_rel) * k, a_rel + FOLLOW + (a1 - a_rel - FOLLOW) * k)


def build():
    ic = Icon("trackfield", "Track and field")
    P = F.Placement(40, 80)
    hip = F.HIP
    sh = F.rot(F.SHOULDER, hip, LEAN)
    hd = F.rot(F.HEAD, hip, LEAN)
    fsh = add(sh, (-6.4, -1.4))                    # the throwing shoulder, drawn back
    # throwing frame: seat, two splayed legs, ground bar, a brace (one welded piece)
    frame = union(brush([(-9.0, -0.6), (18.0, -0.6)], [4.0, 4.0], ("round", "round")),
                  brush([(-5.6, -0.6), (-9.0, 18.6)], [3.2, 3.0], ("round", "round")),
                  brush([(14.6, -0.6), (18.0, 18.6)], [3.2, 3.0], ("round", "round")),
                  brush([(-13.0, 18.6), (22.0, 18.6)], [3.0, 3.0], ("round", "round")),
                  brush([(-7.6, 11.0), (16.4, 7.0)], [2.2, 2.2], ("round", "round")))
    ic.add(P(frame))
    # javelin, then the far (throwing) arm cocked back: it stands in for the swoosh back
    ic.add(P(javelin(GRIP)), group="jv")
    el = D.ik(fsh, GRIP, L1, L2, bend=1)
    ic.add(P(D.seg(fsh, el, 7.2, 5.8)), group="ta", merge="body")
    ic.add(P(D.seg(el, GRIP, 5.8, 4.6, end_r=3.2)), group="tf", merge="body")
    ic.add(P(F.torso(LEAN)), group="tb", merge="body")
    ic.add(P(F.leg()), cls="a")
    ic.add(P(F.head(hd)), group="tb")
    # near arm reaches forward toward the throw
    ic.add(P(F.arm([sh, (17.6, -29.6), (27.0, -27.4)])), group="tb", merge="body")

    keys = [0, T_WIND, 0.16, T_PULL, 0.25, 0.28, 0.30, T_REL, 0.34, 0.37, T_FOLLOW, T_SETTLE,
            0.56, 0.64, 0.72, T_HOME, 0.87, 0.92, 1.0]
    tb, ta, tf = [], [], []
    G0 = P.pt(GRIP)
    for t in keys:
        u = trunk(t)
        f = shoulder_shift(t)
        loc = add(fsh, mul(SHIFT, f))
        S = F.rot(loc, hip, u)
        h = hand(t, S)
        e = D.ik(S, h, L1, L2, bend=1)
        wu = D.wrap(D.ang(S, e) - D.ang(fsh, el))
        wf = D.wrap(D.ang(e, h) - D.ang(el, GRIP))
        tb.append(u)
        ta.append((SHIFT[0] * f * P.s, SHIFT[1] * f * P.s, wu - u))
        tf.append(wf - wu)
    tb, tf = D.unwrap(tb), D.unwrap(tf)
    tav = D.unwrap([a for _, _, a in ta])
    ta = [(x, y, a) for (x, y, _), a in zip(ta, tav)]
    pc = lambda t: round(t * 100, 2)
    ic.motion(Motion("tb", [(pc(t), "none" if t in (0, 1) else f"rotate({v:.1f}deg)") for t, v in zip(keys, tb)],
                     pivot=P.pt(hip), dur=DUR, ease="linear"))
    ic.motion(Motion("ta", [(pc(t), f"translate({x:.2f}px,{y:.2f}px) rotate({a:.1f}deg)") for t, (x, y, a) in zip(keys, ta)],
                     pivot=P.pt(fsh), dur=DUR, ease="linear", parent="tb"))
    ic.motion(Motion("tf", [(pc(t), "none" if t in (0, 1) else f"rotate({v:.1f}deg)") for t, v in zip(keys, tf)],
                     pivot=P.pt(el), dur=DUR, ease="linear", parent="ta"))
    # javelin: in the hand up to the release, then on along its own line, fading out; it jumps home
    # only while invisible, and a new one fades into the hand once the arm is cocked again
    jfr = []
    T_GONE = 0.44
    for t in [0, T_WIND, 0.16, T_PULL, 0.25, 0.28, 0.30, T_REL, 0.35, 0.38, 0.41, T_GONE]:
        if t <= T_REL:
            u = trunk(t)
            S = F.rot(add(fsh, mul(SHIFT, shoulder_shift(t))), hip, u)
            g, op = hand(t, S), 1.0
        else:
            k = phase(t, T_REL, T_GONE)
            g, op = add(GRIP, mul(U, PULL + 13.0 * k)), 1.0 - k
        q = P.pt(g)
        jfr.append((pc(t), f"transform:translate({q[0] - G0[0]:.2f}px,{q[1] - G0[1]:.2f}px);opacity:{op:.2f}"))
    jfr += [(pc(T_GONE + 0.005), "transform:translate(0px,0px);opacity:0"), (pc(T_NEW), "transform:translate(0px,0px);opacity:0"),
            (pc(0.92), "transform:translate(0px,0px);opacity:1"), (100, "transform:translate(0px,0px);opacity:1")]
    ic.motion(Motion("jv", jfr, pivot=G0, dur=DUR, ease="linear"))
    return D.finish(ic)
