import math
from kit import Icon, Motion, circle, union, brush, rot
import figure as F
from set import _props as B


def build():
    ic = Icon("dance", "Wheelchair dance")
    P = F.Placement(40, 80)
    L0 = -4.0                                          # a little lean back with the lifted arm
    lp = lambda p: rot(p, F.HIP, L0)
    ic.add(P(F.body(L0)), group="ub", merge="body")
    ic.add(P(F.wheel()))
    ic.add(P(F.leg()), cls="a")
    ic.add(P(F.head(lp(F.HEAD))), group="ub")
    # the lifted arm: forward from the shoulder, then up in front of the face, the wrist turning back
    R = lp((8.0, -30.4))
    arm_pts = [R, lp((20.6, -31.6)), lp((28.4, -39.6)), lp((28.4, -48.6))]
    hand = arm_pts[-1]
    ic.add(P(union(brush(arm_pts, [7.0, 6.0, 5.2, 4.6], ("round", "round")), circle(*hand, 3.3))), group="arm",
           merge="body")
    # the ribbon: one long swoosh over the head and down behind, cut into three linked lengths
    rib = [hand, lp((27.0, -56.4)), lp((21.6, -62.8)), lp((12.2, -66.2)), lp((2.8, -65.2)), lp((-6.0, -60.6)),
           lp((-12.2, -54.4)), lp((-15.4, -46.8))]
    ws = [1.6, 2.8, 3.4, 3.6, 3.4, 3.0, 2.0, 0.0]
    pieces = B.cut_stroke(brush(rib, ws, ("round", "point")), rib, [2, 4], ws)
    for k, piece in enumerate(pieces):
        ic.add(P(piece), group=f"r{k + 1}", merge="ribbon", gap=False)

    dur = 3.0
    env = lambda t: math.sin(math.pi * t) ** 2           # the phrase starts and ends at rest

    def wave(amp, lag, cycles=2):
        return lambda t: amp * env(t) * math.sin(2 * math.pi * cycles * (t - lag))

    sway = wave(3.0, 0.0, 1)
    arm_w = lambda t: env(t) * (3.6 * math.sin(4 * math.pi * t) + 1.4)     # pumps mostly away from the head
    r1, r2, r3 = wave(-9.0, 0.07), wave(-13.0, 0.14), wave(-15.0, 0.21)
    ts = [i / 24 for i in range(25)]
    ic.motion(Motion("ub", B.sampled(lambda t: B.rot_css(sway(t)), ts), pivot=P.pt(F.HIP), dur=dur, ease="linear"))
    ic.motion(Motion("arm", B.sampled(lambda t: B.rot_css(arm_w(t)), ts), pivot=P.pt(R), dur=dur, ease="linear",
                     parent="ub"))
    ic.motion(Motion("r1", B.sampled(lambda t: B.rot_css(r1(t)), ts), pivot=P.pt(hand), dur=dur, ease="linear",
                     parent="arm"))
    ic.motion(Motion("r2", B.sampled(lambda t: B.rot_css(r2(t)), ts), pivot=P.pt(rib[2]), dur=dur, ease="linear",
                     parent="r1"))
    ic.motion(Motion("r3", B.sampled(lambda t: B.rot_css(r3(t)), ts), pivot=P.pt(rib[4]), dur=dur, ease="linear",
                     parent="r2"))
    return ic.finish()
