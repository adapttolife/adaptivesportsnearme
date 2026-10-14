import kit
from kit import Icon, Motion, circle, union, diff, brush, rrect, outline, add, rot, dist
import figure as F
from set import _props as B

GROUND = 20.0


def stone(cx):
    """Curling stone in profile: a squat granite body with a striking band, a post and a grip bar."""
    g = GROUND
    body = rrect(cx - 7.2, g - 6.9, 14.4, 6.9, 3.3)
    band = outline([(cx - 9, g - 3.5), (cx + 9, g - 3.5)], 1.15, "butt")
    post = rrect(cx - 1.25, g - 10.0, 2.5, 3.6, 0.6)
    bar = rrect(cx - 5.8, g - 12.3, 9.0, 2.5, 1.25)
    return union(diff(body, band), post, bar)


def build():
    ic = Icon("curling", "Wheelchair curling")
    P = F.Placement(40, 80)
    L0 = 9.0
    ic.add(P(F.body(L0)), group="ub", merge="body")
    ic.add(P(F.wheel()))
    ic.add(P(F.leg()), cls="a")
    ic.add(P(F.head(rot(F.HEAD, F.HIP, L0))), group="ub")
    R = rot((8.0, -30.4), F.HIP, L0)
    H0 = add(R, (20.0, 5.6))
    l1, l2 = 12.0, 12.0
    E0 = B.ik(R, H0, l1, l2, 1)
    ic.add(P(brush([R, kit.lerp(R, E0, 0.5), E0], [7.2, 6.6, 6.0], ("round", "round"))), group="ua", merge="body")
    ic.add(P(union(brush([E0, kit.lerp(E0, H0, 0.5), H0], [6.0, 5.3, 4.6], ("round", "round")), circle(*H0, 3.3))),
           group="fa", merge="body")
    sx = 61.6
    grip_end = (sx - 5.2, GROUND - 11.05)
    # delivery stick: from the fist down to the stone's grip bar
    stick = brush([H0, kit.lerp(H0, grip_end, 0.5), grip_end], [2.2, 1.9, 1.7], ("round", "round"))
    ic.add(P(stick), group="st")
    ic.add(P(stone(sx)), group="sn")

    dur = 2.6
    push = B.spline([(0, 0), (0.14, 0), (0.30, -1.0), (0.38, -1.0), (0.47, 3.4), (0.60, 3.4), (0.84, 0), (1, 0)])
    lean = B.spline([(0, 0), (0.14, 0), (0.30, -2.0), (0.38, -2.0), (0.47, 4.0), (0.60, 4.0), (0.84, 0), (1, 0)])
    for t in [i / 100 for i in range(101)]:
        h = rot(add(H0, (push(t), 0.0)), F.HIP, -lean(t))
        assert dist(R, h) < l1 + l2 - 0.05, f"curling: hand out of reach at t={t}"
    ts = B.times([[(0.14,), (0.30,), (0.38,), (0.47,), (0.60,), (0.84,)]], 26)

    def hand(t):
        # the hand target in the leaned body frame: the push moves it along the ice, minus what the lean already gives
        dx = push(t)
        target = add(H0, (dx, 0.0))
        return rot(target, F.HIP, -lean(t))

    ic.motion(Motion("ub", B.sampled(lambda t: B.rot_css(lean(t)), ts), pivot=P.pt(F.HIP), dur=dur, ease="linear"))
    ic.motion(Motion("ua", B.sampled(lambda t: B.rot_css(B.arm_angles(R, E0, H0, hand(t), 1)[0]), ts), pivot=P.pt(R),
                     dur=dur, ease="linear", parent="ub"))
    ic.motion(Motion("fa", B.sampled(lambda t: B.rot_css(B.arm_angles(R, E0, H0, hand(t), 1)[1]), ts), pivot=P.pt(E0),
                     dur=dur, ease="linear", parent="ua"))
    ic.motion(Motion("st", B.sampled(lambda t: f"translate({push(t):.2f}px,0px)", ts), pivot=P.pt(H0), dur=dur,
                     ease="linear"))
    glide = "animation-timing-function:cubic-bezier(.15,.6,.4,1)"
    ic.motion(Motion("sn", [(0, "transform:none;opacity:1"), (38, "transform:translate(-1px,0px);opacity:1"),
                            (47, f"transform:translate(3.4px,0px);opacity:1;{glide}"),
                            (58, "transform:translate(10px,0px);opacity:.9"),
                            (66, "transform:translate(13.5px,0px);opacity:0"), (67, "transform:none;opacity:0"),
                            (84, "transform:none;opacity:0"), (94, "transform:none;opacity:1"),
                            (100, "transform:none;opacity:1")], pivot=P.pt((sx, GROUND)), dur=dur))
    return ic.finish(sweep=True)
