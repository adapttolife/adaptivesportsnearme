import kit
from kit import Icon, Motion
import figure as F
from set._balls import baseball as ball_shape, add_arm, body_zone, fly, settle, rz

A0 = -126.0                     # rest: the straight arm up and back at the top of the windmill
LEN = 22.0


def build():
    ic = Icon("softball", "Softball")
    P = F.Placement(40, 84)
    sh = F.SHOULDER
    hand = kit.polar(sh, LEN, A0)
    r = 4.8
    bc = kit.polar(hand, 6.4, A0 - 8)                # cupped in the palm at the end of the arm
    ball = ball_shape(bc, r)
    # the windmill's trail: an arc over the head, from the front up to the hand
    R = LEN + 3.0
    trail = F.swoosh(kit.arc_pts(sh, R, -8, A0 + 16, 10), 3.4)

    ic.add(P(F.body()), merge="body")
    ic.add(P(F.wheel()))
    ic.add(P(F.leg()), cls="a")
    add_arm(ic, P(kit.limb([sh, kit.lerp(sh, hand, 0.5), hand], 7.2, 4.8, end_r=3.4)), body_zone(P), "arm")
    ic.add(P(ball), group="hb")
    ic.add(P(ball), group="fb")
    ic.add(P(F.head()))
    ic.add(P(trail), group="tr", gap=False)

    dur = 2.6
    # one full turn, counter-clockwise (up at the front, over, back, down, forward): a slow drift back,
    # a fast whip down past the hip, the ball let go low in front, then the arm rises quickly past the
    # head (it goes behind it) and eases home over the top; a new ball fades into the hand from G
    REL = 34.0
    G = 72.0
    turn = [(0, 0), (20, -38), (REL, -204), (REL + 0.6, -207), (46, -244), (52, -252), (62, -334), (G, -350),
            (90, -360), (100, -360)]
    ease = {0: "cubic-bezier(.4,0,.7,.4)", 20: "cubic-bezier(.4,.25,.8,.6)", REL: None, REL + 0.6: "cubic-bezier(.2,.5,.5,1)",
            46: "cubic-bezier(.3,0,.7,.4)", 52: "cubic-bezier(.4,.3,.6,1)", 62: "cubic-bezier(.3,.6,.6,1)",
            G: "cubic-bezier(.3,.3,.5,1)", 90: None, 100: None}
    ic.motion(Motion("arm", [(p, rz(a, ease[p])) for p, a in turn], pivot=P.pt(sh), dur=dur, ease="linear"))
    op = {0: 1, 20: 1, REL: 1, REL + 0.6: 0, 46: 0, 52: 0, 62: 0, G: 0, 90: 1, 100: 1}
    ic.motion(Motion("hb", [(p, rz(a, ease[p]) + f";opacity:{op[p]}") for p, a in turn], pivot=P.pt(sh), dur=dur,
                     ease="linear"))
    s = P.s
    fly(ic, "hb", "fb", P.pt(bc), REL, dur, [(44, 14 * s, -2 * s, -140, 1), (56, 26 * s, -1 * s, -260, 0)])
    ic.motion(Motion("tr", [(0, "transform:none;opacity:1"), (10, "transform:rotate(-14deg);opacity:0"),
                            (92, "transform:rotate(10deg);opacity:0"), (100, "transform:none;opacity:1")],
                     pivot=P.pt(sh), dur=dur))
    return settle(ic)
