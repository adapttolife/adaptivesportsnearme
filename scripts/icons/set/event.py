import math
from kit import Icon, Motion, brush, circle, union, poly, rrect, line
import figure as F

CX, HALF = 16.0, 44.0            # tent centre and half width (figure space)
N_SC = 8                         # scallops on the valance
R_SC = HALF / N_SC               # their radius
LOW = -57.5                      # lowest point of the valance: clear of the cheering fist
VAL_BOT = LOW - R_SC             # scallop centres
VAL_TOP = VAL_BOT - 3.6
EAVE, PEAK = VAL_TOP - 3.2, VAL_TOP - 16.0


def roof():
    """Shallow peaked roof: slightly concave sides, rounded eave corners."""
    pts = [(CX - HALF, EAVE)]
    for i in range(1, 9):
        u = i / 9
        x = CX - HALF + HALF * u
        pts.append((x, EAVE + (PEAK - EAVE) * u + 1.8 * math.sin(math.pi * u)))
    pts.append((CX, PEAK))
    pts += [(2 * CX - x, y) for x, y in reversed(pts[1:-1])]
    pts.append((CX + HALF, EAVE))
    return union(poly(pts), rrect(CX - HALF - 1.0, EAVE - 1.0, 2 * HALF + 2.0, 3.0, 1.4))


def valance(n=N_SC):
    w = 2 * HALF / n
    band = rrect(CX - HALF, VAL_TOP, 2 * HALF, VAL_BOT - VAL_TOP, 0.6)
    return union(band, *[circle(CX - HALF + w * (i + .5), VAL_BOT, w / 2) for i in range(n)])


def build():
    ic = Icon("event", "Events")
    P = F.Placement(56, 92, 0.86)
    sh, hd = F.seated(ic, P)
    elbow, fist = (26.5, -27.0), (30.0, -47.0)
    ic.add(P(F.arm([sh, elbow, fist], w0=7.0, w1=4.6, fist=3.4)), group="arm", merge="body")
    poles = union(line((CX - HALF + 2.6, VAL_BOT), (CX - HALF + 2.6, 20.0), 3.0, "round"),
                  line((CX + HALF - 2.6, VAL_BOT), (CX + HALF - 2.6, 20.0), 3.0, "round"))
    ic.add(P(poles), merge="tent")
    ic.add(P(valance()), merge="val")
    ic.add(P(roof()), merge="tent")
    mast = line((CX, PEAK + 1.0), (CX, PEAK - 10.0), 1.8, "round")
    ic.add(P(mast), merge="tent")
    flag = brush([(CX + 0.4, PEAK - 9.8), (CX + 6.5, PEAK - 8.4), (CX + 13.0, PEAK - 7.0)], [6.4, 4.0, 0.0], ("flat", "point"))
    ic.add(P(flag), group="flag", merge="tent")
    # confetti: little swooshes tossed up beside the cheering fist
    conf = [F.swoosh([(38.5, -44.0), (41.5, -47.0), (45.0, -47.6)], 3.0),
            F.swoosh([(42.0, -35.0), (45.5, -35.0), (48.0, -32.2)], 3.0),
            F.swoosh([(-12.0, -46.0), (-9.0, -49.0), (-5.5, -49.4)], 3.0)]
    for i, c in enumerate(conf):
        ic.add(P(c), group=f"c{i}")
    dur = 2.4
    ic.motion(Motion("arm", [(0, "none"), (18, "rotate(5deg)"), (36, "rotate(-1deg)"), (54, "rotate(5deg)"), (72, "none"), (100, "none")],
                     pivot=P.pt(sh), dur=dur))
    ic.motion(Motion("flag", [(0, "none"), (25, "rotate(-7deg) scale(1,.8)"), (50, "rotate(4deg) scale(1,1.08)"),
                              (75, "rotate(-5deg) scale(1,.86)"), (100, "none")], pivot=P.pt((CX + 0.4, PEAK - 9.8)), dur=dur / 2))
    centres = [(41.5, -46.5), (45.0, -34.5), (-9.0, -48.0)]
    for i, c in enumerate(centres):
        s0 = 22 + i * 12           # each piece floats up and fades, then drifts back in: staggered
        ic.motion(Motion(f"c{i}", [(0, "transform:none;opacity:1"),
                                   (s0, "transform:translate(0.6px,-3px) rotate(18deg);opacity:0"),
                                   (s0 + 1, "transform:translate(0px,2.4px) rotate(-12deg);opacity:0"),
                                   (s0 + 28, "transform:translate(0px,1px) rotate(-4deg);opacity:1"),
                                   (100, "transform:none;opacity:1")], pivot=P.pt(c), dur=dur))
    return ic.settle()
