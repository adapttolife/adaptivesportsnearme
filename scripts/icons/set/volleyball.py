import kit
from kit import Icon, Motion, circle, union, brush, outline, rrect
import figure as F
from set._balls import volley_ball, add_arm, body_zone, settle, tr, two_part_arm

UA, FA = -18.0, -66.0           # the striking arm: elbow forward, forearm up to the ball
L1, L2 = 12.0, 13.0
HEAD = (9.6, -45.6)             # the head tipped back, watching the ball
FLOOR = -11.4


def floor_leg():
    """Sitting on the floor, in the logo's leg language: a pointed tail behind the hip, the seat on the
    floor, the thigh rising to a soft knee, the shin running down to a pointed foot on the floor."""
    pts = [(-3.0, -26.0), (-4.4, -20.6), (-2.4, -16.0), (2.6, -15.9), (8.6, -16.6), (14.6, -19.8), (20.2, -23.4),
           (24.6, -24.0), (28.6, -21.4), (33.6, -17.2), (39.4, -14.4), (45.2, -13.0), (50.6, -12.4)]
    ws = [0, 4.4, 7.6, 9.0, 8.6, 8.2, 8.6, 8.8, 8.2, 7.6, 6.4, 3.8, 0]
    return brush(pts, ws, ("point", "point"))


def net(x0, top, post_x):
    """Post on the right, a top band, a mesh of thin lines under it, a thin side line at the left end."""
    band_h, depth, cell = 2.6, 12.6, 3.0
    post = brush([(post_x, FLOOR + 0.6), (post_x, top - 3.0)], [3.2, 3.0], ("flat", "round"))
    band = rrect(x0 - 0.6, top - band_h / 2, post_x - x0, band_h, 1.0)
    lines = [outline([(x0, top), (x0, top + depth)], 0.9)]
    x = x0 + cell
    while x < post_x - 1.0:
        lines.append(outline([(x, top), (x, top + depth)], 0.75, "butt"))
        x += cell
    y = top + cell
    while y <= top + depth + 0.01:
        lines.append(outline([(x0, y), (post_x, y)], 0.75, "butt"))
        y += cell
    return union(post, band), union(*lines)


def build():
    ic = Icon("volleyball", "Sitting volleyball")
    P = F.Placement(40, 84)
    sh = F.SHOULDER
    elbow = kit.polar(sh, L1, UA)
    hand = kit.polar(elbow, L2, FA)
    r = 5.6
    bc = kit.polar(hand, 3.4 + kit.GAP + r + 0.4, FA)   # just off the fingertips, one gap away
    frame, mesh = net(44.0, -49.0, 66.0)

    ic.add(P(frame))
    ic.add(P(mesh), gap=False)
    ic.add(P(F.body()), merge="body")
    ic.add(P(floor_leg()), cls="a")
    add_arm(ic, P(kit.limb([sh, kit.lerp(sh, elbow, 0.5), elbow], 7.2, 6.0)), body_zone(P), "ua")
    add_arm(ic, P(union(kit.limb([elbow, kit.lerp(elbow, hand, 0.5), hand], 6.0, 4.6), circle(*hand, 3.4))),
            body_zone(P), "fa")
    ic.add(P(F.head(HEAD)))
    ic.add(P(volley_ball(bc, r, deg=-10)), group="ball")

    dur = 2.4
    whip = "cubic-bezier(.55,0,.8,.45)"
    keys = [(0, UA, FA, None), (16, UA - 6, FA - 20, whip), (26, UA + 14, FA + 74, None), (34, UA + 18, FA + 84, None),
            (46, UA + 18, FA + 84, None), (86, UA, FA, None), (100, UA, FA, None)]
    two_part_arm(ic, UA, FA, keys, P.pt(sh), P.pt(elbow), dur)
    s = P.s
    ic.motion(Motion("ball", [(0, tr(0, 0, 0, 1)), (19, tr(0, 0, 0, 1, "cubic-bezier(.2,.5,.6,1)")),
                              (32, tr(14 * s, -5 * s, 70, 1)), (44, tr(27 * s, -1 * s, 140, 0)),
                              (70, tr(0, 0, 0, 0)), (90, tr(0, 0, 0, 1)), (100, tr(0, 0, 0, 1))],
                     pivot=P.pt(bc), dur=dur, ease="linear"))
    return settle(ic)
