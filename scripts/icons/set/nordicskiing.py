import kit
from kit import Icon, Motion, union, brush, add, mul, sub
import figure as F
from set import _water as C


def ski(x0, x1, y, w=3.0, tip=5.0):
    """A cross-country ski from the side: long and thin, the front curling up."""
    L = x1 - x0
    pts = [(x0, y), (x0 + L * 0.5, y), (x1 - tip * 1.5, y - 0.2), (x1 - tip * 0.45, y - tip * 0.45), (x1, y - tip)]
    return brush(pts, [w * 0.85, w, w, w * 0.85, w * 0.6], ("round", "round"))


def pole(top, tip, w=2.2, over=3.0):
    """Ski pole: grip just above the fist, a shaft tapering to a point, a small basket above the tip."""
    d = kit.norm(sub(tip, top))
    a = add(top, mul(d, -over))
    shaft = brush([a, kit.lerp(a, tip, 0.5), tip], [w, w * 0.9, 0.0], ("round", "point"))
    b = add(tip, mul(d, -4.5))
    n = (-d[1], d[0])
    basket = brush([add(b, mul(n, -2.8)), b, add(b, mul(n, 2.8))], [1.3, 1.7, 1.3], ("round", "round"))
    return union(shaft, basket)


def build(lean=14, ski_y=25.0, sx=(-26, 58), hand=(34.0, -24.0), tipp=(22.0, 23.5), L1=13.5, L2=13.0, dur=1.9,
          push=(12.0, 34.0), far=(-3.0, -1.0), farp=(-7.0, 0.0)):
    """The logo athlete with the wheel swapped for a sit-ski: a cross-braced frame on two skis; double poling."""
    ic = Icon("nordicskiing", "Nordic skiing")
    P = F.Placement(46, 66)
    sh, hd = F.upper(lean)
    # snow lines under the skis, sliding back
    snow = union(F.swoosh([(-30, ski_y + 6.0), (-10, ski_y + 6.4), (10, ski_y + 6.2)], 3.4),
                 F.swoosh([(20, ski_y + 6.0), (38, ski_y + 6.3), (56, ski_y + 6.0)], 3.0))
    ic.add(P(snow), group="sn")
    # skis (the far one a touch higher) and the frame
    ic.add(P(ski(sx[0] + 4, sx[1] - 12, ski_y - 3.6, w=2.6, tip=0.8)))
    ic.add(P(ski(sx[0], sx[1], ski_y)))
    frame = union(brush([(-6.0, -6.0), (16.0, ski_y - 1.8)], [3.0, 3.0], ("round", "round")),
                  brush([(14.0, -6.0), (-8.0, ski_y - 1.8)], [3.0, 3.0], ("round", "round")),
                  brush([(-9.0, -7.0), (4.0, -5.4), (17.0, -6.0)], [3.4, 3.6, 3.4], ("round", "round")))
    ic.add(P(frame))
    ic.add(P(F.body(lean)), merge="body", group="bd")
    ic.add(P(F.leg()), cls="a")
    ic.add(P(F.head(hd)), group="bd")
    # the arm and both poles (the far pole just behind the near one) swing as one piece about the shoulder
    E = C.elbow(sh, hand, L1, L2, bend=1)
    up, fo = C.arm2(sh, E, hand)
    ic.add(P(pole(add(hand, far), add(tipp, farp))), group="arm")
    ic.add(P(pole(hand, tipp)), group="arm")
    ic.add(P(up), merge="body", group="arm")
    ic.add(P(fo), merge="body", group="arm")
    db, da = push
    kf = lambda v: [(0, "none"), (42, f"rotate({v}deg)"), (100, "none")]
    ic.motion(Motion("bd", kf(db), pivot=P.pt(F.HIP), dur=dur))
    ic.motion(Motion("arm", kf(da), pivot=P.pt(sh), dur=dur, parent="bd"))
    # the snow slides back under the skis, fades, and comes in again from just ahead
    ic.motion(Motion("sn", [(0, "transform:none;opacity:1"), (70, "transform:translate(-7px,0px);opacity:1"),
                            (85, "transform:translate(-8.5px,0px);opacity:0"), (86, "transform:translate(1.4px,0px);opacity:0"),
                            (100, "transform:none;opacity:1")], pivot=P.pt((0, ski_y + 6)), dur=dur, ease="linear"))
    return ic.settle()
