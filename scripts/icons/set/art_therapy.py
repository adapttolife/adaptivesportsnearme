import kit
from kit import Icon, Motion, brush, union, diff, rrect
import figure as F

CANVAS = (38.0, -66.0, 30.0, 33.0)    # x, y, w, h (figure space)
LEAN_BACK = 6.0                        # easels lean back a little


def easel():
    """Canvas on a tripod easel, as one shape: everything solid is joined first, the canvas opening is cut
    last (kit.union drops overlaps when an input already has a hole)."""
    x, y, w, h = CANVAS
    cx = x + w / 2
    bar = lambda a, b, wd: brush([a, b], [wd, wd], ("round", "round"))
    solid = union(rrect(x, y, w, h, 1.4), rrect(x - 2.4, y + h + 0.6, w + 4.8, 3.0, 1.2),
                  bar((cx, y - 7.0), (cx, y + 1.0), 2.6),
                  bar((cx - 4.0, y + h + 2.0), (x + 6.0, 20.0), 2.8),
                  bar((cx + 4.0, y + h + 2.0), (x + w + 5.0, 20.0), 2.8),
                  bar((cx + 1.0, y + h + 3.6), (cx + 2.0, 19.0), 2.2))
    return diff(solid, rrect(x + 3.0, y + 3.0, w - 6.0, h - 6.0, 0.6))


def heart(c, s):
    """Two brush strokes: the left lobe, then the right lobe (each from the dip at the top round to the point)."""
    x, y = c

    def lobe(k):
        pts = [(x, y - 2.4 * s), (x + k * 1.6 * s, y - 5.0 * s), (x + k * 4.2 * s, y - 5.6 * s), (x + k * 6.0 * s, y - 3.4 * s),
               (x + k * 5.4 * s, y + 0.2 * s), (x + k * 2.8 * s, y + 3.4 * s), (x, y + 6.0 * s)]
        return brush(pts, [2.2, 3.2, 3.6, 3.6, 3.4, 2.8, 0.6], ("round", "round"))
    return lobe(-1), lobe(1)


def build():
    ic = Icon("art-therapy", "Art therapy")
    P = F.Placement(36, 86, 0.92)
    x, y, w, h = CANVAS
    piv = (x + w / 2, y + h + 2.0)
    tilt = lambda p: kit.rotate(p, -LEAN_BACK, piv)
    ic.add(P(tilt(easel())), merge="easel")          # behind the athlete: the logo foot passes in front of its leg
    sh, hd = F.seated(ic, P)
    hc = (x + w / 2 + 0.5, y + h / 2 + 0.8)
    l1, l2 = heart(hc, 1.42)
    ic.add(P(tilt(l1)), group="h1", gap=False, merge="body")      # wet paint: the brush tip joins it
    ic.add(P(tilt(l2)), group="h2", gap=False, merge="body")
    # arm with a brush: elbow out in front, hand at the canvas
    elbow, hand = (24.0, -27.5), (32.0, -41.5)
    tip = (46.4, -54.2)
    brush_ = union(brush([hand, kit.lerp(hand, tip, .6)], [1.7, 1.5], ("round", "round")),
                   brush([kit.lerp(hand, tip, .58), kit.lerp(hand, tip, .82), tip], [1.4, 2.6, 0.0], ("round", "point")))
    ic.add(P(brush_), group="arm", merge="body")
    ic.add(P(F.arm([sh, elbow, hand], w0=7.0, w1=4.6, fist=3.3)), group="arm", merge="body")
    dur = 3.0
    ic.motion(Motion("arm", [(0, "none"), (14, "rotate(3deg)"), (24, "rotate(-2deg)"), (34, "rotate(2deg)"), (44, "rotate(-3deg)"),
                             (58, "rotate(-1deg)"), (68, "rotate(-4deg)"), (80, "rotate(1deg)"), (90, "none"), (100, "none")],
                     pivot=P.pt(sh), dur=dur))
    ic.motion(Motion("h1", [(0, "opacity:1"), (8, "opacity:0"), (18, "opacity:0"), (40, "opacity:1"), (100, "opacity:1")],
                     pivot=P.pt(hc), dur=dur))
    ic.motion(Motion("h2", [(0, "opacity:1"), (8, "opacity:0"), (46, "opacity:0"), (72, "opacity:1"), (100, "opacity:1")],
                     pivot=P.pt(hc), dur=dur))
    return ic.settle()
