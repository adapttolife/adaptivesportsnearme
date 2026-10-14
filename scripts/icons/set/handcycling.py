"""Handcycling: a recumbent handcycle (the logo wheel at the back, a low frame, a
smaller front wheel with the hand cranks on a mast above it); the athlete lies
back with both hands on the crank grips. The cranks turn, the arms follow them,
the wheels spin."""
import kit
from kit import Icon, Motion, brush, union, add, sub, polar
import figure as F
from set import _wheels as D

LEAN = -38                       # reclined against the seat back
HIP = (7.0, -13.0)               # the torso pivots here
SEAT = (9.4, -8.8)               # the thigh starts here, a little lower and forward
L1, L2 = 12.4, 11.6              # upper arm, forearm
CR = 4.6                         # crank arm length
GA0 = 35.0                       # grip angle at rest (deg, screen): forward and a little low, arm long
FR = 11.4                        # front wheel radius
DUR = 2.0
N = 12


def build():
    ic = Icon("handcycling", "Handcycling")
    P = F.Placement(40, 70)
    off = sub(HIP, F.HIP)
    T = add(F.rot(D.TORSO_TOP, F.HIP, LEAN), off)
    sh = add(F.rot(F.SHOULDER, F.HIP, LEAN), off)
    CRANK = add(sh, (17.6, -4.6))
    FW = (47.0, 20.0 - FR)

    # the handcycle, flattened into one static shape: seat back, frame, mast, the logo wheel, front tyre
    seat = brush([(5.4, -3.6), (0.2, -10.6), (-4.4, -17.6), (-7.8, -24.0), (-9.0, -28.4)],
                 [3.4, 3.4, 3.2, 2.4, 0.0], ("round", "point"))
    fork = kit.lerp(FW, CRANK, 0.3)
    frame = brush([(14.0, 4.0), (28.0, 3.0), fork], [3.4, 3.0, 2.8], ("round", "round"))
    mast = brush([FW, kit.lerp(FW, CRANK, 0.5), CRANK], [3.0, 2.8, 2.6], ("round", "round"))
    ic.add(P(D.flat(union(seat, frame, mast), F.wheel(), D.ring(FW, FR, FR - 2.6))), merge="bike")
    ic.add(P(D.spokes(D.HUB, D.HOLE_R, 5, w=1.0, hub=2.4, a0=-63)), group="sp", gap=False)
    ic.add(P(D.spokes(FW, FR - 2.6, 6, w=0.8, hub=1.8)), group="fs", gap=False)
    ic.add(P(kit.move(F.torso(LEAN), *off)), merge="body")
    hd = D.head_off(T, -72)
    ic.add(P(F.head(hd)))
    # legs lie forward in the cradle, the near foot past the mast, over the front wheel
    leg = brush([SEAT, (17.0, -10.6), (25.0, -11.8), (31.6, -10.0), (37.6, -8.2), (43.4, -7.6)],
                [9.0, 8.8, 8.4, 7.2, 5.6, 0.0], ("round", "point"))
    ic.add(P(leg), cls="a")
    # crank: chainring, axle and the crank arm out to the grip
    g0 = polar(CRANK, CR, GA0)
    crank = union(D.ring(CRANK, 4.0, 2.2), D.disc(CRANK, 1.0),
                  brush([polar(CRANK, 3.2, GA0), g0], [2.4, 2.2], ("round", "round")))
    ic.add(P(crank), group="ck")
    # arm to the grip, in two pieces
    e0 = D.ik(sh, g0, L1, L2, bend=1)
    ic.add(P(D.seg(sh, e0, 7.2, 5.9)), group="ua", merge="body")
    ic.add(P(D.seg(e0, g0, 5.9, 4.6, end_r=3.4)), group="fa", merge="body")

    ts = [i / N for i in range(N + 1)]
    ua, fa = [], []
    for t in ts:
        g = polar(CRANK, CR, GA0 + 360.0 * t)
        e = D.ik(sh, g, L1, L2, bend=1)
        wu = D.ang(sh, e) - D.ang(sh, e0)
        ua.append(wu)
        fa.append(D.ang(e, g) - D.ang(e0, g0) - wu)
    ua, fa = D.unwrap([D.wrap(v) for v in ua]), D.unwrap([D.wrap(v) for v in fa])
    rot = lambda vals: [(round(t * 100, 2), "none" if t in (0, 1) else f"rotate({v:.1f}deg)") for t, v in zip(ts, vals)]
    ic.motion(Motion("ua", rot(ua), pivot=P.pt(sh), dur=DUR, ease="linear"))
    ic.motion(Motion("fa", rot(fa), pivot=P.pt(e0), dur=DUR, ease="linear", parent="ua"))
    ic.motion(D.spin("ck", P.pt(CRANK), DUR, 360))
    sp = D.spin("sp", P.pt(D.HUB), DUR, 360)
    sp.clip = P(D.spoke_clip())
    ic.motion(sp)
    ic.motion(D.spin("fs", P.pt(FW), DUR, 720))
    return D.finish(ic)
