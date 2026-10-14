import kit
from kit import Icon, Motion
import figure as F
from set._balls import volley_ball, add_arm, body_zone, settle, tr, rz, fmt

LEAN = 10.0


def build():
    ic = Icon("rugby", "Wheelchair rugby")
    P = F.Placement(40, 84)
    sh, hd = F.upper(LEAN)
    # no front bumper: drawn in side view it read as a stick lying on the floor (review, 2026-10-14)
    ic.add(P(F.body(LEAN)), group="up", merge="body")
    ic.add(P(F.wheel()))
    ic.add(P(F.leg()), cls="a")
    ic.add(P(F.head(hd)), group="up")
    elbow, hand = kit.rot((18.0, -29.6), F.HIP, LEAN), kit.rot((27.6, -33.0), F.HIP, LEAN)
    add_arm(ic, P(kit.limb([sh, elbow, hand], 7.2, 4.6, end_r=3.4)), body_zone(P, LEAN), "arm")
    r = 5.6
    bc = (hand[0] + 6.4, hand[1] - 3.4)
    ic.add(P(volley_ball(bc, r, deg=20)), group="ball")
    # speed: two swooshes streaming back from the wheel
    s1 = F.swoosh([(-24.0, -5.0), (-30.0, -5.6), (-37.0, -5.0)], 2.6)
    s2 = F.swoosh([(-25.0, 3.6), (-31.0, 3.0), (-36.0, 3.6)], 2.2)
    ic.add(P(s1), group="s1", gap=False)            # motion lines never cut the drawing
    ic.add(P(s2), group="s2", gap=False)

    dur = 2.0
    lean = [(0, "none"), (30, rz(9)), (50, rz(9)), (80, "none"), (100, "none")]
    ic.motion(Motion("up", lean, pivot=P.pt(F.HIP), dur=dur))
    ic.motion(Motion("arm", lean, pivot=P.pt(F.HIP), dur=dur))
    # the ball: tossed forward a little out of the hands and caught again, riding the lean
    ic.motion(Motion("ball", [(0, tr(0, 0, 0)), (30, tr(0, 0, 0)), (44, tr(8.0, -4.4, 60)), (58, tr(0, 0, 120)),
                              (100, tr(0, 0, 120))], pivot=P.pt(bc), dur=dur, parent="up"))
    # the swooshes stream back and fade, one after the other, and slide in again from the wheel
    for g, t0 in (("s1", 0), ("s2", 30)):
        fr = [(0, 0, 1), (t0, 0, 1), (t0 + 26, -8, 0), (t0 + 27, 2, 0), (t0 + 56, 0, 1), (100, 0, 1)]
        ic.motion(Motion(g, [(p, f"transform:translate({fmt(dx)}px,0px);opacity:{fmt(op)}") for p, dx, op in sorted(set(fr))],
                         pivot=P.pt((-30, 0)), dur=dur, ease="linear"))
    return settle(ic)
