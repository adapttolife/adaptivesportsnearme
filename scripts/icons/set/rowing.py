import math
import kit
from kit import Icon, Motion, union, brush, add, mul
import figure as F
from set import _water as C


def paddle_half(M, deg, s, half=40.0, blade=13.0, bw=6.4, sw=2.6, start=0.0):
    """One half of a double-bladed paddle centred on M (s=+1: the half towards angle deg).
    The shaft starts `start` units out from M, so a half can begin under a fist or behind the hull."""
    d = (math.cos(math.radians(deg)), -math.sin(math.radians(deg)))
    tip = add(M, mul(d, s * half))
    neck = add(M, mul(d, s * (half - blade)))
    a = add(M, mul(d, s * start))
    shaft = brush([a, kit.lerp(a, neck, 0.5), add(neck, mul(d, s * 1.0))], [sw, sw, sw], ("flat", "round"))
    pts = [neck, kit.lerp(neck, tip, 0.35), kit.lerp(neck, tip, 0.72), tip]
    return union(shaft, brush(pts, [sw, bw * 0.8, bw, bw * 0.55], ("round", "round")))


def kayak(x0, x1, deck, depth, bow_up=6.0, stern_up=4.0):
    """Kayak hull: deck line nearly straight, keel curved, both ends sweep up to points."""
    n = 16
    pts, ws = [], []
    for i in range(n + 1):
        u = i / n
        x = x0 + (x1 - x0) * u
        s = math.sin(math.pi * u)
        lift = bow_up * u ** 4 + stern_up * (1 - u) ** 4
        y_top = deck - lift - 0.6 * s
        th = depth * s ** 0.7
        pts.append((x, y_top + th / 2))
        ws.append(th)
    ws[0] = ws[-1] = 0.0
    return brush(pts, ws, ("point", "point"))


LEAN = 6
M = (26.0, -30.0)          # midpoint of the two hands on the shaft: the paddle turns about it
A0, A1 = 45, -45           # paddle angle at rest ("/", far blade in the water) and at the other stroke ("\")
HAND = 6.0                 # near fist, out along the shaft from M
DUR = 2.8
FADE = (0.07, 0.12)        # the far half fades while the hull hides it...
SHOW = (0.29, 0.33)        # ...and comes back as it rises clear of the paddler's back


def build():
    ic = Icon("rowing", "Rowing and paddling")
    P = F.Placement(56, 74)
    N = 12
    ts = [i / N for i in range(N + 1)]
    swing = lambda t: (A1 - A0) * (1 - math.cos(2 * math.pi * t)) / 2      # paddle tilt from rest
    bob = lambda t: 1.2 * (1 - math.cos(4 * math.pi * t)) / 2               # hull bob, once per stroke

    ic.add(P(union(F.wave(-36, 52, -1.0, 2.0, 2.25, 4.6, 0.3), F.wave(-24, 32, 8.0, 1.8, 1.5, 3.8, 2.2))), group="w")
    # far half of the paddle: on the far side of the boat, behind the hull and the paddler
    ic.add(P(paddle_half(M, A0, -1, start=19.0)), group="pf")
    sh, hd = F.upper(LEAN)
    ic.add(P(F.body(LEAN)), merge="body", group="boat")
    ic.add(P(F.head(hd)), group="boat")
    ic.add(P(kayak(-38, 52, -17.0, 7.6)), group="boat")
    # near half in front of everything, starting under the fist
    ic.add(P(paddle_half(M, A0, 1, start=HAND - 2.5)), group="pad")
    d = (math.cos(math.radians(A0)), -math.sin(math.radians(A0)))
    H0 = add(M, mul(d, HAND))
    E0 = C.elbow(sh, H0, 13.0, 11.5)        # long enough that the elbow drops clear of the head
    up, fo = C.arm2(sh, E0, H0)
    ic.add(P(up), group="u1", merge="body")
    ic.add(P(fo), group="f1", merge="body")

    def grip(t):
        a = A0 + swing(t)
        return add(M, mul((math.cos(math.radians(a)), -math.sin(math.radians(a))), HAND))
    upf, fof = C.ik_frames(sh, E0, H0, [(t * 100, grip(t)) for t in ts])

    def pad(t):
        return "none" if t in (0, 1) else f"translateY({bob(t):.2f}px) rotate({-swing(t):.1f}deg)"

    def seen(t):
        u = min(t, 1 - t)
        if u <= FADE[0]:
            return 1.0
        if u < FADE[1]:
            return 1 - (u - FADE[0]) / (FADE[1] - FADE[0])
        if u < SHOW[0]:
            return 0.0
        return min(1.0, (u - SHOW[0]) / (SHOW[1] - SHOW[0]))
    ic.motion(Motion("boat", [(t * 100, "none" if t in (0, 1) else f"translateY({bob(t):.2f}px)") for t in ts],
                     pivot=P.pt((0, -18)), dur=DUR, ease="linear"))
    ic.motion(Motion("pad", [(t * 100, pad(t)) for t in ts], pivot=P.pt(M), dur=DUR, ease="linear"))
    tf = sorted(set(ts) | {FADE[0], FADE[1], 1 - FADE[0], 1 - FADE[1], SHOW[0], SHOW[1], 1 - SHOW[0], 1 - SHOW[1]})
    ic.motion(Motion("pf", [(t * 100, f"transform:{pad(t)};opacity:{seen(t):.2g}") for t in tf],
                     pivot=P.pt(M), dur=DUR, ease="linear"))
    ic.motion(Motion("u1", C.rframes(upf), pivot=P.pt(sh), dur=DUR, ease="linear", parent="boat"))
    ic.motion(Motion("f1", C.rframes(fof), pivot=P.pt(E0), dur=DUR, ease="linear", parent="u1"))
    ic.motion(Motion("w", [(0, "none"), (50, "translate(-1.6px,.5px)"), (100, "none")], pivot=P.pt((0, 0)), dur=DUR))
    return ic.settle()
