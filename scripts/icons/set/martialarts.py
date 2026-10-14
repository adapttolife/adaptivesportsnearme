import kit
from kit import Icon, Motion, circle, union, brush, add, rot
import figure as F
from set import _props as B


def build():
    ic = Icon("martialarts", "Martial arts")
    P = F.Placement(40, 80)
    # the logo's own body: its swoosh back is the rear arm, pulled back in guard
    L0 = 3.0                                     # leaning into the punch
    ic.add(P(F.body(L0)), group="ub", merge="body")
    ic.add(P(F.wheel()))
    ic.add(P(F.leg()), cls="a")
    ic.add(P(F.head(rot(F.HEAD, F.HIP, L0))), group="ub")
    # punching arm, rooted just below the shoulder so it clears the head; level
    R = rot((8.0, -30.4), F.HIP, L0)
    H0 = add(R, (25.2, 0.4))
    l1, l2 = 12.4, 12.95
    E0 = B.ik(R, H0, l1, l2, 1)
    fist_r = 4.3
    ic.add(P(brush([R, kit.lerp(R, E0, 0.5), E0], [8.0, 7.3, 6.7], ("round", "round"))), group="ua", merge="body")
    ic.add(P(union(brush([E0, kit.lerp(E0, H0, 0.5), H0], [6.7, 6.1, 5.6], ("round", "round")), circle(*H0, fist_r))),
           group="fa", merge="body")
    # impact: three short swooshes fanned in front of the fist
    burst = B.burst(H0, 0.0, n=3, r0=fist_r + 2.8, r1=fist_r + 12.0, spread=38.0, w=1.9)
    ic.add(P(burst), group="bu")

    dur = 2.2
    reach = [(0, (0.0, 0.0)), (0.12, (0.0, 0.0)), (0.40, (-8.4, -3.6)), (0.47, (-8.4, -3.6)), (0.54, (1.0, 0.0)),
             (0.64, (0.0, 0.0)), (1, (0.0, 0.0))]
    fx = B.spline([(t, v[0]) for t, v in reach])
    fy = B.spline([(t, v[1]) for t, v in reach])
    twist = B.spline([(0, 0), (0.12, 0), (0.40, -3.5), (0.47, -3.5), (0.54, 2.0), (0.66, 0), (1, 0)])
    ts = B.times([reach], 30)

    def hand(t):
        return add(H0, (fx(t), fy(t)))

    ic.motion(Motion("ub", B.sampled(lambda t: B.rot_css(twist(t)), ts), pivot=P.pt(F.HIP), dur=dur, ease="linear"))
    ic.motion(Motion("ua", B.sampled(lambda t: B.rot_css(B.arm_angles(R, E0, H0, hand(t), 1)[0]), ts), pivot=P.pt(R),
                     dur=dur, ease="linear", parent="ub"))
    ic.motion(Motion("fa", B.sampled(lambda t: B.rot_css(B.arm_angles(R, E0, H0, hand(t), 1)[1]), ts), pivot=P.pt(E0),
                     dur=dur, ease="linear", parent="ua"))
    pop = "animation-timing-function:cubic-bezier(.2,.8,.3,1)"
    ic.motion(Motion("bu", [(0, "transform:none;opacity:1"), (12, "transform:none;opacity:1"),
                            (22, "transform:scale(.7);opacity:0"), (53, f"transform:scale(.55);opacity:0;{pop}"),
                            (60, "transform:scale(1.12);opacity:1"), (72, "transform:none;opacity:1"),
                            (100, "transform:none;opacity:1")], pivot=P.pt(H0), dur=dur))
    return ic.finish()
