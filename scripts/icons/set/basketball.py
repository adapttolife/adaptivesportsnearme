import kit
from kit import Icon, Motion, circle, diff, union, outline
import figure as F


def ball(c, r):
    x, y = c
    seams = union(
        outline(kit.arc_pts((x - r * 1.55, y), r * 1.25, -38, 38), 1.15),
        outline(kit.arc_pts((x + r * 1.55, y), r * 1.25, 142, 218), 1.15),
        outline([(x - r, y - 0.1), (x + r, y + 0.1)], 1.15),
        outline([(x - 0.1, y - r), (x + 0.1, y + r)], 1.15),
    )
    return diff(circle(x, y, r), seams)


def build():
    ic = Icon("basketball", "Basketball")
    P = F.Placement(40, 82)
    F.seated(ic, P)
    sh = (7.2, -30.2)           # arm root low in the shoulder so the arm clears the head by a gap all the way
    hand = (30.4, -44.4)
    ic.add(P(F.arm([sh, (25.6, -30.4), hand])), group="m1", merge="body")
    r = 7.4
    bc = (hand[0] + 2.2, hand[1] - (3.4 + r + kit.GAP))   # resting on the fingertips, one gap above
    ic.add(P(ball(bc, r)), group="m2")
    ic.motion(Motion("m1", [(0, "none"), (22, "rotate(8deg)"), (40, "rotate(-4deg)"), (60, "none"), (100, "none")],
                     pivot=P.pt(sh), dur=2.4))
    ic.motion(Motion("m2", [(0, "none"), (40, "translate(0px,0px) rotate(-60deg)"),
                            (58, "translate(4px,-16px) rotate(-200deg)"), (78, "translate(0px,0px) rotate(-330deg)"),
                            (100, "rotate(-360deg)")], pivot=P.pt(bc), dur=2.4, parent="m1"))
    return ic.finish(sweep=True)
