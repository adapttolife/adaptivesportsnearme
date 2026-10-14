import kit
from kit import Icon, Motion, brush, circle, union, rrect
import figure as F
from set import _standing as L

# Powerlifting (bench press). Figure space as in the logo: the lifter lies on the bench face up,
# head to the left; the leg follows the logo's S-curve (thigh along the bench, shin sweeping off its
# end). The bar is drawn across the picture with a plate pair on each end (the pictogram cheat), so
# the two arms rise in a narrow V and their elbows flare out as the bar comes down to the chest.
# Each arm is a chain hung from the bar (bar -> forearm -> upper arm), solved so the shoulder stays put.
L1, L2 = 12.0, 12.0              # upper arm, forearm
SH_N = (-19.0, -13.4)            # near arm root (at the shoulder)
SH_F = (-9.6, -13.0)             # far arm root (the frontal cheat spreads the shoulders)
BAR_Y = -36.2
G_N, G_F = (-19.0, BAR_Y), (-9.6, BAR_Y)    # grips straight above: elbows flare out as the bar comes down
DROP = 5.0                       # bar travel toward the chest
DUR = 2.6
BENCH_TOP = -4.6


def plates(x, side):
    """Big plate, small plate (side -1 left, +1 right); x is the big plate's centre."""
    small = x + side * (2.8 + kit.GAP + 0.4 + 2.2)          # one clean gap between the plates, no bite
    return [rrect(x - 2.8, BAR_Y - 10.0, 5.6, 20.0, 2.8),
            rrect(small - 2.2, BAR_Y - 7.0, 4.4, 14.0, 2.2)]


def build():
    ic = Icon("powerlifting", "Powerlifting")
    P = F.Placement(60, 78)

    # arms first, behind the torso and merged into it: chains bar -> forearm -> upper arm
    arms = []
    for name, s, g, bend in (("n", SH_N, G_N, -1), ("f", SH_F, G_F, 1)):
        e = L.ik(s, g, L1, L2, bend)
        up, fo = L.arm2(s, e, g, w0=7.2, w1=4.8, fist=0.01)
        ic.add(P(fo), group="f" + name, merge="body")
        ic.add(P(up), group="u" + name, merge="body")
        arms.append((name, s, g, e, bend))

    torso = brush([(-25.6, -10.8), (-14.6, -10.6), (-3.6, -10.4)], [11.4, 9.8, 8.4], ("round", "round"))
    ic.add(P(torso), merge="body")
    leg = brush([(-1.4, -10.4), (8.0, -11.2), (15.0, -12.6), (20.6, -12.8), (25.0, -9.4), (28.8, -3.4), (32.8, 3.8),
                 (37.0, 10.2), (41.6, 15.0), (46.4, 18.0), (51.4, 19.6)],
                [8.6, 9.0, 9.4, 9.2, 8.6, 8.0, 7.6, 6.8, 5.4, 3.4, 0.0], ("round", "point"))
    ic.add(P(leg), cls="a")
    ic.add(P(F.head((-33.6, -13.4))))

    # bench in front: it trims the lifter flat where they lie on it
    bench = union(rrect(-36.0, BENCH_TOP, 57.0, 5.2, 2.6),
                  rrect(-29.6, BENCH_TOP + 3.0, 4.6, 18.2, 1.2), rrect(10.0, BENCH_TOP + 3.0, 4.6, 18.2, 1.2),
                  rrect(-33.4, 17.0, 12.2, 3.6, 1.8), rrect(6.2, 17.0, 12.2, 3.6, 1.8))
    ic.add(P(bench))

    # bar, plates and fists move together. One merge tag for the bar, fists and arms makes the grip
    # one mass (the bar never meets the torso)
    cx = (G_N[0] + G_F[0]) / 2
    half = 40.2
    ic.add(P(brush([(cx - half, BAR_Y), (cx + half, BAR_Y)], [2.4, 2.4], ("round", "round"))), group="bar", merge="body")
    for p in plates(cx - half + 8.0, -1) + plates(cx + half - 8.0, 1):
        ic.add(P(p), group="bar")
    for g in (G_N, G_F):
        ic.add(P(circle(*g, 3.4)), group="bar", merge="body")

    # motion: lower to the chest, a short pause, press
    def d_at(t):
        return DROP * L.bump(t, 0.06, 0.42, 0.5, 0.86)
    N = 12
    ic.motion(Motion("bar", L.sampled(N, lambda t: L.tr(t=(0, d_at(t) * P.s))), pivot=P.pt(G_N), dur=DUR, ease="linear"))
    for name, s, g, e0, bend in arms:
        def fo_r(t, s=s, g=g, e0=e0, bend=bend):
            g1 = (g[0], g[1] + d_at(t))
            e1 = L.ik(s, g1, L1, L2, bend)
            return L.wrap(L.ang(g1, e1) - L.ang(g, e0))

        def up_r(t, s=s, g=g, e0=e0, bend=bend):
            g1 = (g[0], g[1] + d_at(t))
            e1 = L.ik(s, g1, L1, L2, bend)
            a_fo = L.ang(g1, e1) - L.ang(g, e0)
            return L.wrap(L.ang(e1, s) - L.ang(e0, s) - a_fo)
        ic.motion(Motion("f" + name, L.sampled(N, lambda t, f=fo_r: L.tr(r=f(t))), pivot=P.pt(g), dur=DUR, ease="linear",
                         parent="bar"))
        ic.motion(Motion("u" + name, L.sampled(N, lambda t, f=up_r: L.tr(r=f(t))), pivot=P.pt(e0), dur=DUR, ease="linear",
                         parent="f" + name))
    return ic.settle()
