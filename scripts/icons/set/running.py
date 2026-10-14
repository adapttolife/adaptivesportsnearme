import math
import kit
from kit import Icon, Motion, brush
import figure as F

# one stride, as (thigh swing forward deg, knee bend deg) for the near leg; far leg runs half a cycle behind
STRIDE = [(0.0, 56, 78), (0.2, 26, 14), (0.5, -26, 16), (0.75, -6, 108)]


def pose(t):
    """Smooth (cosine) blend between the stride key poses."""
    t %= 1.0
    keys = STRIDE + [(1.0,) + STRIDE[0][1:]]
    for (t0, a0, b0), (t1, a1, b1) in zip(keys, keys[1:]):
        if t0 <= t <= t1:
            u = (t - t0) / (t1 - t0)
            u = (1 - math.cos(math.pi * u)) / 2
            return a0 + (a1 - a0) * u, b0 + (b1 - b0) * u


def build():
    ic = Icon("running", "Running")
    P = F.Placement(52, 66)
    hip = (0.0, -15.0)
    lean = 14
    sh = F.rot((3.0, -34.5), hip, lean)
    hd = F.rot((5.4, -46.8), hip, lean)
    # far leg (behind), body, near leg, arms
    th0, ph0 = pose(0.5)
    k2, a2 = F.leg_points(hip, th0, ph0)
    ic.add(P(F.thigh(hip, k2)), group="t2", merge="legB")
    ic.add(P(F.shin(k2, a2)), group="c2", merge="legB")
    torso = kit.rotate(kit.brush([(3.0, -34.0), (1.4, -25.0), (0.2, -16.5)], [12.4, 10.0, 9.0], ("round", "round")), lean, hip)
    ic.add(P(torso), group="body", merge="body")
    # far arm: the logo swoosh, swinging
    sw = brush([sh, F.rot((-4.0, -33.0), hip, lean), F.rot((-11.0, -28.0), hip, lean), F.rot((-15.0, -21.0), hip, lean),
                F.rot((-16.6, -14.6), hip, lean)], [7.4, 7.0, 6.2, 4.2, 0.0], ("round", "point"))
    ic.add(P(sw), group="a2", merge="body")
    ic.add(P(F.head(hd)), group="body")
    th1, ph1 = pose(0.0)
    k1, a1 = F.leg_points(hip, th1, ph1)
    ic.add(P(F.thigh(hip, k1)), cls="a", group="t1", merge="legA")
    ic.add(P(F.blade(k1, a1)), cls="a", group="c1", merge="legA")
    el = F.rot((9.6, -24.0), hip, lean)
    fist = F.rot((20.0, -27.5), hip, lean)
    ic.add(P(F.arm([sh, el, fist], w0=7.0, w1=4.8, fist=3.3)), group="a1", merge="body")

    N = 8
    dur = 0.84
    ts = [i / N for i in range(N + 1)]
    def frames(fn):
        return [(t * 100, fn(t)) for t in ts]
    # body bob: high in flight (t=0, .5), low on contact (.25, .75)
    ic.motion(Motion("body", frames(lambda t: f"translate(0px,{-1.6 * math.cos(4 * math.pi * t) * P.s:.2f}px)" if t not in (0, 1) else "none"),
                     pivot=P.pt(hip), dur=dur, ease="linear"))
    for leg, off in (("1", 0.0), ("2", 0.5)):
        t0, p0 = pose(off)
        ic.motion(Motion("t" + leg, frames(lambda t, off=off, t0=t0: f"rotate({-(pose(t + off)[0] - t0):.1f}deg)" if t not in (0, 1) else "none"),
                         pivot=P.pt(hip), dur=dur, ease="linear", parent="body"))
        k, _ = F.leg_points(hip, t0, p0)
        ic.motion(Motion("c" + leg, frames(lambda t, off=off, p0=p0: f"rotate({pose(t + off)[1] - p0:.1f}deg)" if t not in (0, 1) else "none"),
                         pivot=P.pt(k), dur=dur, ease="linear", parent="t" + leg))
    # arms swing opposite the legs
    ic.motion(Motion("a1", frames(lambda t: f"rotate({-26 * (math.cos(2 * math.pi * t) - 1):.1f}deg)" if t not in (0, 1) else "none"),
                     pivot=P.pt(sh), dur=dur, ease="linear", parent="body"))
    ic.motion(Motion("a2", frames(lambda t: f"rotate({8 * (math.cos(2 * math.pi * t) - 1):.1f}deg)" if t not in (0, 1) else "none"),
                     pivot=P.pt(sh), dur=dur, ease="linear", parent="body"))
    return ic.finish()
