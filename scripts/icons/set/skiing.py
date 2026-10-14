import kit
from kit import Icon, Motion, union, brush, circle, rot
import figure as F
from set import _water as C

def ski(x0, x1, y, w=3.6, tip=6.4):
    """A ski from the side: a long plank whose front curls up to a rounded tip."""
    L = x1 - x0
    pts = [(x0, y), (x0 + L * 0.5, y), (x1 - tip * 1.4, y - 0.2), (x1 - tip * 0.45, y - tip * 0.45), (x1, y - tip)]
    return brush(pts, [w * 0.85, w, w, w * 0.85, w * 0.6], ("round", "round"))

def outrigger(grip, foot, ski_len=13.0, w=2.6):
    """Outrigger: a short pole from the fist down to a mini ski with an upturned tip."""
    pole = brush([grip, kit.lerp(grip, foot, 0.5), foot], [2.6, 2.4, 2.2], ("round", "round"))
    sk = ski(foot[0] - ski_len * 0.45, foot[0] + ski_len * 0.55, foot[1] + 1.4, w=w, tip=3.2)
    return union(pole, sk)

# the logo's S-leg, folded tight: tail behind the hip, under the seat, thigh forward, shin down, toe forward
LEG = [(-5.5, -27.0), (-6.5, -19.0), (-4.0, -11.5), (3.0, -8.2), (12.0, -9.0), (19.5, -11.5), (24.5, -8.0),
       (27.0, -2.5), (31.0, -0.5)]
LEG_W = [0.0, 5.4, 8.2, 9.0, 8.6, 8.4, 7.6, 5.6, 0.0]

def build(lean=24, slope=17.0, ski_y=9.0, sx=(-18, 40), hand=(31.0, -14.0), rear_hand=(-21.0, -11.0),
          front_foot=(41.0, 7.4), rear_foot=(-28.0, 7.4), dur=2.4):
    ic = Icon("skiing", "Adaptive skiing")
    P = F.Placement(56, 70)
    c = (10.0, ski_y)          # the ski's contact point: the carve pivots here
    S = lambda p: kit.rotate(p, slope, c)
    sh, hd = F.upper(lean)
    R = lambda p: rot(p, F.HIP, lean)
    # the slope
    ic.add(P(S(F.swoosh([(-40, ski_y + 7.6), (-10, ski_y + 8.2), (24, ski_y + 8.0), (58, ski_y + 7.2)], 4.2))))
    # rear outrigger and the rear arm (the logo swoosh, ending in a fist)
    ic.add(P(S(outrigger(rear_hand, rear_foot))), group="sk")
    rear = brush([R((4.0, -34.6)), R((-3.0, -34.6)), R((-10.0, -31.0)), R((-15.0, -24.5)), rear_hand],
                 [8.0, 7.6, 7.0, 5.8, 4.8], ("round", "round"))
    ic.add(P(S(union(rear, circle(*rear_hand, 3.3)))), merge="body", group="sk")
    # the ski, a binding plate, the shock post under the seat
    ic.add(P(S(union(ski(sx[0], sx[1], ski_y), kit.rrect(1.0, ski_y - 3.8, 14.0, 2.6, 1.0)))), group="sk")
    ic.add(P(S(brush([(7.0, -7.0), (7.5, -1.0), (8.0, ski_y - 3.0)], [4.6, 4.2, 3.2], ("round", "flat")))), group="sk")
    ic.add(P(S(F.torso(lean))), merge="body", group="sk")
    ic.add(P(S(brush(LEG, LEG_W, ("point", "point")))), cls="a", group="sk")
    ic.add(P(S(F.head(hd))), group="sk")
    # near arm and the front outrigger
    E = C.elbow(sh, hand, 12.5, 12.0, bend=1)
    up, fo = C.arm2(sh, E, hand)
    ic.add(P(S(outrigger(hand, front_foot))), group="sk")
    ic.add(P(S(up)), merge="body", group="sk")
    ic.add(P(S(fo)), merge="body", group="sk")
    # snow spray kicked up off the edge of the ski
    t0 = (sx[0] + 3.0, ski_y - 1.0)
    sp = union(F.swoosh([t0, (t0[0] - 3.0, t0[1] - 5.0), (t0[0] - 2.0, t0[1] - 11.0)], 2.4),
               F.swoosh([(t0[0] + 3.0, t0[1] - 0.6), (t0[0] + 1.5, t0[1] - 5.0), (t0[0] + 3.0, t0[1] - 9.0)], 2.0),
               circle(t0[0] - 6.0, t0[1] - 7.5, 1.3))
    ic.add(P(S(sp)), group="sp")
    piv = P.pt(c)
    sp_piv = P.pt(S(kit.circle(*t0, 0.1)).bounds[:2])
    # the carve: the skier sinks and tips into the turn (the edge bites and throws snow), then rises out of it
    ic.motion(Motion("sk", [(0, "none"), (32, "translate(.6px,-.3px) rotate(3deg)"), (48, "translate(.6px,-.3px) rotate(3deg)"),
                            (72, "translate(-.4px,-.2px) rotate(-1.5deg)"), (100, "none")], pivot=piv, dur=dur))
    ic.motion(Motion("sp", [(0, "transform:scale(.4);opacity:0"), (26, "transform:scale(.5);opacity:0"),
                            (38, "transform:scale(1);opacity:1"), (60, "transform:translate(-3px,-3px) scale(1.25);opacity:0"),
                            (100, "transform:scale(.4);opacity:0")], pivot=sp_piv, dur=dur))
    return ic.settle()
