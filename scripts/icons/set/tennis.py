import kit
from kit import Icon, Motion, circle, diff, union, outline, ellipse, inter, brush
import figure as F


def racket(grip, head_c, rx, ry, deg):
    """Grip point -> racket: handle, throat, oval head with a string grid."""
    rim = diff(ellipse(*head_c, rx, ry, deg), ellipse(*head_c, rx - 1.7, ry - 1.7, deg))
    inner = ellipse(*head_c, rx - 1.7, ry - 1.7, deg)
    lines = []
    for i in (-2, -1, 0, 1, 2):
        lines.append(outline([(-20, i * 2.3), (20, i * 2.3)], 0.55, "butt"))
        lines.append(outline([(i * 2.3, -20), (i * 2.3, 20)], 0.55, "butt"))
    strings = kit.rotate(kit.move(union(*lines), *head_c), deg, head_c)
    strings = inter(strings, inner)
    # handle from grip to the bottom of the head
    import math
    a = math.radians(deg + 90)
    bottom = (head_c[0] + ry * math.cos(a), head_c[1] + ry * math.sin(a))
    handle = brush([grip, kit.lerp(grip, bottom, 0.55), bottom], [2.4, 1.9, 1.7], ("round", "flat"))
    return union(rim, strings, handle)


def build():
    ic = Icon("tennis", "Tennis")
    P = F.Placement(40, 80)
    sh, hd = F.seated(ic, P)
    hand = (28.0, -34.8)        # low enough that the swing clears the head by a gap
    ic.add(P(F.arm([sh, (19.6, -29.2), hand])), group="m1", merge="body")
    ic.add(P(racket((29.7, -36.4), (37.4, -48.6), 5.8, 7.6, 32)), group="m1")
    ball_c = (49.4, -43.4)
    b = diff(circle(*ball_c, 2.9), outline(kit.arc_pts((ball_c[0] - 3.4, ball_c[1]), 3.0, -50, 50), 0.6))
    ic.add(P(b), group="m2")
    ic.motion(Motion("m1", [(0, "none"), (14, "rotate(-5deg)"), (30, "rotate(-5deg)"), (62, "rotate(34deg)"),
                            (88, "none"), (100, "none")], pivot=P.pt(sh), dur=2.6))
    # after the hit the ball recedes (shrinks and fades); the next one approaches the same way
    ic.motion(Motion("m2", [(0, "transform:none;opacity:1"), (16, "transform:translate(2px,-6px) scale(.35);opacity:0"),
                            (17, "transform:translate(4px,5px) scale(.35);opacity:0"), (44, "transform:translate(2.5px,3px) scale(.6);opacity:1"),
                            (88, "transform:none;opacity:1"), (100, "transform:none;opacity:1")],
                     pivot=P.pt(ball_c), dur=2.6, ease="linear"))
    return ic.finish()
