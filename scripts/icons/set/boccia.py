import math
import kit
from kit import Icon, Motion, circle, union, brush, add, sub, rot, polar
import figure as F
from set import _props as B

GROUND = 20.0


def build():
    ic = Icon("boccia", "Boccia")
    P = F.Placement(40, 80)
    L0 = 10.0                                         # leaning out over the court
    ic.add(P(F.body(L0)), merge="body")
    ic.add(P(F.wheel()))
    ic.add(P(F.leg()), cls="a")
    ic.add(P(F.head(rot(F.HEAD, F.HIP, L0))))
    R = rot((8.0, -30.4), F.HIP, L0)                  # arm root (just under the shoulder)
    a0 = 15.0                                         # arm angle at rest (reaching forward and down)
    La = 23.6
    H0 = polar(R, La, a0)
    E0 = add(polar(R, La * 0.5, a0), polar((0, 0), 0.9, a0 + 90))
    root = polar(R, 8.0, a0)
    # the root merges with the body (no gap ring); the outer arm keeps its gap (it can pass the knee)
    ic.add(P(brush([R, kit.lerp(R, root, 0.5), root], [7.2, 6.9, 6.6], ("round", "round"))), group="arm",
           merge="body", gap=False)
    ic.add(P(union(brush([root, E0, H0], [6.6, 5.9, 4.8], ("round", "round")), circle(*H0, 3.2))), group="arm",
           merge="body")
    br = 3.5
    bc0 = add(H0, polar((0, 0), 3.2 + br + 0.2, a0 + 55))     # held in the palm, in front of the fingers
    ic.add(P(B.boccia_ball(bc0, br)), group="ball")
    gy = GROUND - br
    ic.add(P(B.boccia_ball((72.9, gy), br)))         # an earlier ball, just past the jack
    jr = 2.4
    ic.add(P(B.ring((64.6, GROUND - jr), jr, 1.25)))

    # ---- motion
    dur = 2.8
    swing = B.spline([(0, 0), (0.10, 0), (0.32, 15), (0.41, -2), (0.46, -11), (0.60, -9), (0.78, 0), (1, 0)])
    t_rel = 0.405
    rel_c = rot(bc0, R, swing(t_rel))
    land = (56.8, gy)
    stop = (59.4, gy)
    phase = lambda a, b, n: [a + (b - a) * i / n for i in range(n)]
    ts = sorted(set([round(t, 4) for t in phase(0, 0.10, 1) + phase(0.10, 0.32, 5) + phase(0.32, t_rel, 3)
                     + phase(t_rel, 0.56, 5) + phase(0.56, 0.76, 5) + [0.76, 0.84, 0.95, 1.0]]))
    ta = sorted(set([round(t, 4) for t in phase(0, 0.10, 1) + phase(0.10, 0.32, 5) + phase(0.32, 0.46, 4)
                     + phase(0.46, 0.60, 2) + phase(0.60, 0.78, 4) + [0.78, 1.0]]))

    def ball_state(t):
        """(centre, spin deg, opacity) of the thrown ball."""
        if t <= t_rel:
            return rot(bc0, R, swing(t)), 0.0, 1.0
        if t <= 0.56:                                  # lob: forward and down, a little lift first
            u = (t - t_rel) / (0.56 - t_rel)
            x = rel_c[0] + (land[0] - rel_c[0]) * u
            y = rel_c[1] + (land[1] - rel_c[1]) * u * u - 9.0 * u * (1 - u)
            return (x, y), 40 * u, 1.0
        if t <= 0.76:                                  # roll toward the jack, fading
            u = (t - 0.56) / (0.20)
            e = 1 - (1 - u) ** 2
            x = land[0] + (stop[0] - land[0]) * e
            spin = 40 + (stop[0] - land[0]) * e / br * 180 / math.pi
            op = 1.0 if u < 0.2 else max(0.0, 1 - (u - 0.2) / 0.6)
            return (x, gy), spin, op
        if t < 0.84:
            return bc0, 0.0, 0.0
        if t < 0.95:
            return bc0, 0.0, (t - 0.84) / 0.11
        return bc0, 0.0, 1.0

    def ball_css(t):
        c, s, o = ball_state(t)
        d = sub(c, bc0)
        if t in (0, 1):
            return "transform:none;opacity:1"
        return f"transform:translate({d[0]:.1f}px,{d[1]:.1f}px) rotate({s:.0f}deg);opacity:{o:.2g}"

    ic.motion(Motion("arm", B.sampled(lambda t: B.rot_css(swing(t)), ta), pivot=P.pt(R), dur=dur, ease="linear"))
    ic.motion(Motion("ball", [(round(t * 100, 2), ball_css(t)) for t in ts], pivot=P.pt(bc0), dur=dur, ease="linear"))
    return ic.finish(sweep=True)
