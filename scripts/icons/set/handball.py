import kit
from kit import Icon, circle, union
import figure as F
from set._balls import panel_ball, add_arm, body_zone, two_part_arm, fly, settle

UA, FA = -128.0, -70.0          # cocked: upper arm up and back, forearm up and forward, the ball held high
L1, L2 = 12.0, 13.0


def build():
    ic = Icon("handball", "Handball")
    P = F.Placement(40, 84)
    sh = F.SHOULDER
    elbow = kit.polar(sh, L1, UA)
    hand = kit.polar(elbow, L2, FA)
    r = 5.7
    bc = kit.polar(hand, 8.0, -104)                  # the ball in the palm, the hand cupped under it
    ball = panel_ball(bc, r, deg=8)

    ic.add(P(F.body()), merge="body")
    ic.add(P(F.wheel()))
    ic.add(P(F.leg()), cls="a")
    add_arm(ic, P(kit.limb([sh, kit.lerp(sh, elbow, 0.5), elbow], 7.2, 6.0)), body_zone(P), "ua")
    add_arm(ic, P(union(kit.limb([elbow, kit.lerp(elbow, hand, 0.5), hand], 6.0, 4.6), circle(*hand, 3.4))),
            body_zone(P), "fa")
    ic.add(P(ball), group="hb")
    ic.add(P(ball), group="fb")
    ic.add(P(F.head()))                              # the arm whips past behind the head

    R, GONE, BACK = 29.0, 74.0, 90.0
    whip = "cubic-bezier(.6,0,.8,.4)"
    fol = (14.0, 18.0)
    up, mid = (-100, -88), (-122, -76)           # the recock: a quick rise past the head (behind it), then home
    keys = [(0, UA, FA, None), (18, UA - 6, FA - 18, whip), (R, -60, -60, None), (R + 0.6, -60, -60, None),
            (40, *fol, None), (50, *fol, "cubic-bezier(.5,0,.6,1)"), (60, *up, "cubic-bezier(.3,.2,.5,1)"),
            (GONE, *mid, "cubic-bezier(.4,0,.5,1)"), (BACK, UA, FA, None), (100, UA, FA, None)]
    dur = 2.4
    two_part_arm(ic, UA, FA, keys, P.pt(sh), P.pt(elbow), dur, held="hb", release=R, gone=GONE, back=BACK)
    s = P.s
    fly(ic, "hb", "fb", P.pt(bc), R, dur, [(42, 20 * s, -3 * s, 50, 1), (56, 34 * s, 3 * s, 100, 0)])
    return settle(ic)
