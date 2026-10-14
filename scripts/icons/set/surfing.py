import kit
from kit import Icon, Motion, union, brush, circle
import figure as F
from set import _water as C

def board(x0, x1, y, t=4.0):
    """Surfboard from the side: rounded tail, flat deck, a nose that lifts to a point."""
    L = x1 - x0
    pts = [(x0, y), (x0 + L * 0.3, y + 0.3), (x0 + L * 0.7, y + 0.2), (x1 - L * 0.1, y - 1.0), (x1, y - 3.0)]
    return brush(pts, [t * 0.8, t, t, t * 0.7, 0.0], ("round", "point"))

# the wave, one calligraphic stroke: the face runs under the board, climbs the back of the wave on the
# left, arches over and hooks down into a curl
WAVE = [(14, 4.6), (2, 7.0), (-8, 8.4), (-21, 8.4), (-34, 2.0), (-44, -16), (-47, -36), (-40, -54), (-26, -63), (-12, -61),
        (-4, -53), (-5, -45), (-11, -42)]
WAVE_W = [0, 3.0, 5.6, 7.4, 8.4, 9.4, 9.6, 9.2, 8.0, 6.4, 4.6, 2.6, 0]

def build(lean=22, tilt=-10, bx=(-20, 40), by=-2.0, knee=(13.5, -9.4), ankle=(-8.0, -9.0), hand=(31.0, -21.0),
          L1=12.0, L2=11.0, dur=2.6, glide=(-6.0, -1.6, 8.0)):
    ic = Icon("surfing", "Adaptive surfing")
    P = F.Placement(56, 76)
    ic.add(P(brush(WAVE, WAVE_W, ("point", "point"))))
    grp = "rider"
    c = ((bx[0] + bx[1]) / 2, by)
    T = lambda p: kit.rotate(p, tilt, c)
    # kneeling rider on the board
    ic.add(P(T(board(bx[0], bx[1], by))), group=grp)
    sh, hd = F.upper(lean)
    th = brush([F.HIP, kit.lerp(F.HIP, knee, 0.5), knee], [8.8, 8.0, 7.0], ("round", "round"))
    sn = brush([knee, kit.lerp(knee, ankle, 0.45), ankle, (ankle[0] - 6.0, ankle[1] + 0.2)], [6.6, 5.4, 3.8, 0.0], ("round", "point"))
    ic.add(P(T(F.body(lean))), merge="body", group=grp)
    ic.add(P(T(sn)), cls="a", merge="leg", group=grp)
    ic.add(P(T(th)), cls="a", merge="leg", group=grp)
    ic.add(P(T(F.head(hd))), group=grp)
    E = C.elbow(sh, hand, L1, L2, bend=1)
    up, fo = C.arm2(sh, E, hand)
    ic.add(P(T(up)), merge="body", group=grp)
    ic.add(P(T(fo)), merge="body", group=grp)
    # spray thrown off the tail as it climbs the face (unseen at rest)
    tx, ty = bx[0] + 1.0, by - 4.4
    sp = union(F.swoosh([(tx + 2.0, ty), (tx - 3.0, ty - 5.0), (tx - 3.0, ty - 12.0)], 2.6),
               F.swoosh([(tx + 5.5, ty - 0.6), (tx + 3.0, ty - 5.0), (tx + 4.5, ty - 10.0)], 2.2),
               circle(tx - 7.0, ty - 8.5, 1.4))
    ic.add(P(T(sp)), group="sp")
    piv = P.pt(c)
    g0, g1, g2 = glide
    # the board is carried back up the face (tail first), then runs down and out again
    ic.motion(Motion(grp, [(0, "none"), (45, f"translate({g0}px,{g1}px) rotate({g2}deg)"),
                           (55, f"translate({g0}px,{g1}px) rotate({g2}deg)"), (100, "none")], pivot=piv, dur=dur))
    sp_piv = P.pt(T(kit.circle(tx, ty, .1)).bounds[:2])
    ic.motion(Motion("sp", [(0, "transform:scale(.4);opacity:0"), (30, "transform:scale(.6);opacity:0"),
                            (45, "transform:scale(1);opacity:1"), (62, "transform:translate(-2px,-3px) scale(1.15);opacity:0"),
                            (100, "transform:scale(.4);opacity:0")], pivot=sp_piv, dur=dur, parent=grp))
    return ic.settle()
