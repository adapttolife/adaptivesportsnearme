import kit
from kit import Icon, circle, union
import figure as F
from set._balls import football as ball_shape, helmet, add_arm, body_zone, two_part_arm, fly, settle

UA, FA = -126.0, -104.0         # cocked: upper arm up and back, forearm up, the ball behind the helmet
L1, L2 = 12.0, 12.0
BD = -60.0                      # nose up: by the release it has turned to point along the throw


def build():
    ic = Icon("football", "Wheelchair football")
    P = F.Placement(40, 84)
    sh = F.SHOULDER
    elbow = kit.polar(sh, L1, UA)
    hand = kit.polar(elbow, L2, FA)
    bc = kit.polar(hand, 8.6, BD - 90)               # the hand under the ball's belly
    ball = ball_shape(bc, 15.6, 9.0, BD)

    ic.add(P(F.body()), merge="body")
    ic.add(P(F.wheel()))
    ic.add(P(F.leg()), cls="a")
    add_arm(ic, P(kit.limb([sh, kit.lerp(sh, elbow, 0.5), elbow], 7.2, 6.0)), body_zone(P), "ua")
    add_arm(ic, P(union(kit.limb([elbow, kit.lerp(elbow, hand, 0.5), hand], 6.0, 4.6), circle(*hand, 3.4))),
            body_zone(P), "fa")
    ic.add(P(ball), group="hb")                      # held: in front of the hand
    ic.add(P(ball), group="fb")                      # thrown
    ic.add(P(helmet(F.HEAD, F.HEAD_R)))              # the arm passes behind the helmet

    R, GONE, BACK = 29.0, 74.0, 90.0
    whip = "cubic-bezier(.6,0,.8,.4)"
    fol = (12.0, 16.0)
    up, mid = (-100, -95), (-121, -102)           # the recock: a quick rise past the head (behind it), then home
    keys = [(0, UA, FA, None), (18, UA - 6, FA - 16, whip), (R, -64, -56, None), (R + 0.6, -64, -56, None),
            (40, *fol, None), (50, *fol, "cubic-bezier(.5,0,.6,1)"), (60, *up, "cubic-bezier(.3,.2,.5,1)"),
            (GONE, *mid, "cubic-bezier(.4,0,.5,1)"), (BACK, UA, FA, None), (100, UA, FA, None)]
    dur = 2.4
    two_part_arm(ic, UA, FA, keys, P.pt(sh), P.pt(elbow), dur, held="hb", release=R, gone=GONE, back=BACK)
    s = P.s
    # a spiral: the ball flies nose first, the nose dipping as it goes
    fly(ic, "hb", "fb", P.pt(bc), R, dur, [(42, 20 * s, -4 * s, 10, 1), (56, 36 * s, 1 * s, 26, 0)])
    return settle(ic)
