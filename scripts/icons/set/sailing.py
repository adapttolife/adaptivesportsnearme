import math
import kit
from kit import Icon, Motion, brush, svg
import figure as F
from set import _water as C


def hull_shape(x0, x1, deck, depth, bow_up=7.0, stern_up=3.0):
    """Sailing dinghy hull: sheer line rising to a raked bow, rounded bilge, a short transom at the stern."""
    n = 18
    top, bot = [], []
    for i in range(n + 1):
        u = i / n
        x = x0 + (x1 - x0) * u
        top.append((x, deck - bow_up * u ** 3 - stern_up * (1 - u) ** 3))
        # keel: deepest a little aft of the middle, sweeping up to the bow
        k = math.sin(math.pi * min(1.0, u * 0.94 + 0.06)) ** 0.8
        bot.append((x, deck + depth * k - bow_up * u ** 6))
    p = kit.new()
    p.moveTo(*top[0])
    for b in kit.fit(top, 0.05):
        p.cubicTo(*b[1], *b[2], *b[3])
    p.lineTo(*bot[-1])
    for b in kit.fit(bot[::-1], 0.05):
        p.cubicTo(*b[1], *b[2], *b[3])
    p.close()
    return kit.union(p)


def sail_shape(mx, tack_y, head_y, clew, bulge=7.0, foot_sag=3.0):
    """Mainsail: luff up the mast, a convex leech down to the clew, a slightly curved foot back to the tack."""
    cx, cy = clew
    dx, dy = cx - mx, cy - head_y
    L = math.hypot(dx, dy)
    nx, ny = dy / L, -dx / L        # normal pointing up and out: the leech bulges this way
    c1 = (mx + dx * 0.3 + nx * bulge, head_y + dy * 0.3 + ny * bulge)
    c2 = (mx + dx * 0.72 + nx * bulge * 0.9, head_y + dy * 0.72 + ny * bulge * 0.9)
    return svg(f"M{mx},{tack_y} L{mx},{head_y} C{c1[0]:.2f},{c1[1]:.2f} {c2[0]:.2f},{c2[1]:.2f} {cx},{cy} "
               f"Q{(mx + cx) / 2:.2f},{tack_y + foot_sag:.2f} {mx},{tack_y} Z")


MAST, TOP, TACK, CLEW = 31.0, -84.0, -24.0, (60.0, -22.0)
HULL, DECK = (-32, 64), -16.0
HAND, SHEET_TO = (21.0, -27.0), (38.0, -23.5)
DUR = 3.2


def build():
    ic = Icon("sailing", "Sailing")
    P = F.Placement(50, 80)
    # waves, rocking against the boat
    ic.add(P(F.wave(HULL[0] - 2, HULL[1] + 2, -1.0, amp=2.2, crests=2.25, w=4.8, phase=0.4)), group="w1")
    ic.add(P(F.wave(HULL[0] + 12, HULL[1] - 12, 8.0, amp=1.9, crests=1.75, w=3.8, phase=2.4)), group="w2")
    # the boat: sail with one seam, mast, sailor holding the sheet, hull
    sail = sail_shape(MAST + 1.6, TACK, TOP + 3, CLEW)
    seam = brush([(MAST, -46.0), ((MAST + CLEW[0]) / 2 + 4, -44.0), (CLEW[0] + 10, -42.0)], [1.1, 1.1, 1.1], ("flat", "flat"))
    ic.add(P(kit.diff(sail, seam)), group="boat")
    ic.add(P(brush([(MAST, DECK - 1), (MAST, (DECK + TOP) / 2), (MAST, TOP)], [3.0, 2.6, 2.0], ("round", "round"))), group="boat")
    lean = -6                       # sitting up, leaning back a little against the pull of the sheet
    sh, hd = F.upper(lean)
    ic.add(P(F.body(lean)), merge="body", group="boat")
    ic.add(P(F.head(hd)), group="boat")
    up, fo = C.arm2(sh, C.elbow(sh, HAND, 10.5, 10.0), HAND)
    ic.add(P(up), merge="body", group="boat")
    ic.add(P(fo), merge="body", group="boat")
    ic.add(P(kit.outline([HAND, SHEET_TO], 1.1)), group="boat", gap=False)
    ic.add(P(hull_shape(HULL[0], HULL[1], DECK, 9.0)), group="boat")
    # the boat heels a few degrees each way about the middle of the hull and bobs twice
    ts = [i / 8 for i in range(9)]

    def heel(t):
        if t in (0, 1):
            return "none"
        return f"translateY({(1 - math.cos(4 * math.pi * t)) / 2:.2f}px) rotate({-4.0 * math.sin(2 * math.pi * t):.2f}deg)"
    ic.motion(Motion("boat", [(t * 100, heel(t)) for t in ts], pivot=P.pt(((HULL[0] + HULL[1]) / 2, DECK + 3)), dur=DUR,
                     ease="linear"))
    ic.motion(Motion("w1", [(0, "none"), (25, "translate(1.8px,.3px)"), (75, "translate(-1.8px,-.3px)"), (100, "none")],
                     pivot=P.pt((0, 0)), dur=DUR))
    ic.motion(Motion("w2", [(0, "none"), (25, "translate(-1.4px,0px)"), (75, "translate(1.4px,0px)"), (100, "none")],
                     pivot=P.pt((0, 9)), dur=DUR))
    return ic.settle()
