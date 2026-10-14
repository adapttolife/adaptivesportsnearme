"""Cycling: an upright rider on a road bicycle, the near lower leg a prosthesis
(socket and pylon, built like the running blade; the far leg stays hidden
behind it). The foot follows the pedal round the crank (thigh about the hip,
shin about the knee, solved per keyframe); the crank and both wheels turn."""
import kit
from kit import Icon, Motion, brush, union, add, sub, mul, polar, norm, dist
import figure as F
from set import _wheels as D

R = 15.6                      # wheel radius
TW = 3.4                      # tyre width
REAR, FRONT = (0.0, 0.0), (55.0, 0.0)
BB = (22.0, 1.4)              # bottom bracket (crank axle)
CRANK = 6.6
HIP = (13.4, -31.2)
LT, LS = 19.0, 20.6           # thigh, shin
LEAN = 52                     # torso forward lean
TH0 = 30.0                    # near pedal angle at rest (deg, screen): forward and a little down
DUR = 1.6
N = 12


def pylon(knee, ankle, w0=7.8):
    """Prosthetic lower leg: a socket under the knee, a thin pylon, a small foot on the pedal."""
    d = norm(sub(ankle, knee))
    L = dist(knee, ankle)
    sock_end = add(knee, mul(d, L * 0.42))
    socket = brush([knee, add(knee, mul(d, L * 0.22)), sock_end], [w0, 7.0, 5.8], ("round", "round"))
    rod = brush([add(knee, mul(d, L * 0.36)), ankle], [2.8, 2.6], ("round", "round"))
    fwd = (d[1], -d[0]) if d[1] > 0 else (1.0, 0.0)
    if fwd[0] < 0:
        fwd = (-fwd[0], -fwd[1])
    foot = brush([add(ankle, mul(fwd, -1.4)), ankle, add(ankle, mul(fwd, 5.2))], [3.2, 3.4, 0.0], ("round", "point"))
    return union(socket, rod, foot)


def leg_to(hip, pedal):
    """Knee for a foot on the pedal (the knee bends forward)."""
    return D.ik(hip, pedal, LT, LS, bend=-1)


def build():
    ic = Icon("cycling", "Cycling")
    P = F.Placement(40, 70)
    sh = F.rot(F.SHOULDER, F.HIP, LEAN)
    T = F.rot(D.TORSO_TOP, F.HIP, LEAN)
    off = sub(HIP, F.HIP)
    sh, T = add(sh, off), add(T, off)
    saddle = (12.0, -25.4)
    bar = (46.6, -26.4)
    head_top = (47.6, -19.6)
    seat_top = (15.6, -21.6)

    # the bike, flattened into one static shape: tyres, then the frame over them
    frame = union(
        brush([REAR, BB], [2.6, 2.6], ("round", "round")),
        brush([REAR, seat_top], [2.2, 2.4], ("round", "round")),
        brush([BB, seat_top, saddle], [3.0, 2.8, 2.6], ("round", "round")),
        brush([seat_top, head_top], [3.0, 3.0], ("round", "round")),
        brush([BB, (46.4, -15.0)], [3.4, 3.0], ("round", "round")),
        brush([FRONT, (48.6, -17.0), head_top], [2.6, 2.8, 3.0], ("round", "round")),
        brush([head_top, (47.4, -24.0), bar], [3.0, 2.8, 2.6], ("round", "round")),
        brush([(4.6, -25.8), (12.0, -25.6), (17.4, -25.0)], [2.4, 3.2, 1.8], ("round", "round")),
    )
    ic.add(P(D.flat(D.ring(REAR, R, R - TW), D.ring(FRONT, R, R - TW), frame)), merge="bike")
    # spokes turn over the frame's stays and fork (thin lines, no gap needed)
    for c, g in ((REAR, "rs"), (FRONT, "fs")):
        ic.add(P(D.spokes(c, R - TW, 6, w=0.8, hub=2.2, a0=-75)), group=g, gap=False)
    # crank: chainring and the near crank arm
    pn = polar(BB, CRANK, TH0)
    ic.add(P(union(D.ring(BB, 4.6, 2.6), D.disc(BB, 1.2), brush([polar(BB, 3.6, TH0), pn], [2.4, 2.2], ("round", "round")))),
           group="ck")
    # near leg: thigh, then the prosthetic shin on the pedal; the torso sits in front of the hip
    kn = leg_to(HIP, pn)
    ic.add(P(F.thigh(HIP, kn, 9.0, 7.8)), cls="a", group="t1", merge="legA")
    ic.add(P(pylon(kn, pn)), cls="a", group="c1", merge="legA")
    # upper body: the swoosh back along the back, torso, head, arm to the bar
    back = brush([add(T, (-0.6, -2.0)), add(T, (-8.0, -1.8)), add(T, (-15.6, 1.6)), add(T, (-21.6, 6.8)), add(T, (-25.0, 12.0))],
                 [8.0, 7.4, 6.2, 4.0, 0.0], ("round", "point"))
    ic.add(P(back), merge="body")
    ic.add(P(kit.move(F.torso(LEAN), *off)), merge="body")
    hd = D.head_off(T, -22)
    ic.add(P(F.head(hd)))
    el = D.ik(sh, bar, 12.0, 11.6, bend=1)
    ic.add(P(F.arm([sh, el, bar], w0=7.2, w1=4.6, fist=3.2)), merge="body")

    ts = [i / N for i in range(N + 1)]
    th, sn = [], []
    for t in ts:
        p = polar(BB, CRANK, TH0 + 360.0 * t)
        k = leg_to(HIP, p)
        a_t = D.ang(HIP, k) - D.ang(HIP, kn)
        th.append(a_t)
        sn.append(D.ang(k, p) - D.ang(kn, pn) - a_t)
    th, sn = D.unwrap([D.wrap(v) for v in th]), D.unwrap([D.wrap(v) for v in sn])
    rot = lambda vals: [(round(t * 100, 2), "none" if t in (0, 1) else f"rotate({v:.1f}deg)") for t, v in zip(ts, vals)]
    ic.motion(Motion("t1", rot(th), pivot=P.pt(HIP), dur=DUR, ease="linear"))
    ic.motion(Motion("c1", rot(sn), pivot=P.pt(kn), dur=DUR, ease="linear", parent="t1"))
    ic.motion(D.spin("ck", P.pt(BB), DUR, 360))
    ic.motion(D.spin("rs", P.pt(REAR), DUR, 720))
    ic.motion(D.spin("fs", P.pt(FRONT), DUR, 720))
    return D.finish(ic)
