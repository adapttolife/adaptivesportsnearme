"""Power soccer: the athlete in a power wheelchair (drive wheel, small front
caster, a foot guard cage at the front, hand on the joystick) with the ball at
the guard. The chair backs off, then drives forward and tips into the strike;
the guard knocks the ball, which rolls away spinning and rolls back."""
import math
import kit
from kit import Icon, Motion, brush, union, diff, outline, polar, lerp
import figure as F
from set import _wheels as D

GROUND = 19.6
DW, DR = (-1.0, 8.0), 11.6          # drive wheel
CW, CRr = (25.0, 15.4), 4.2         # front caster
BALL_R = 7.4
DUR = 2.6


def ball(c, r=BALL_R):
    """Solid ball with the seams cut as gaps: a pentagon in the middle and five seams to the rim."""
    pent = [polar(c, r * 0.42, -90 + 72 * i) for i in range(5)]
    seams = [outline(pent + [pent[0]], 1.1)]
    for i, p in enumerate(pent):
        seams.append(outline([p, polar(c, r + 1.0, -90 + 72 * i)], 1.1, "butt"))
    return diff(D.disc(c, r), union(*seams))


def build():
    ic = Icon("soccer", "Power soccer")
    P = F.Placement(40, 70)
    sh, hd = F.upper(0.0)
    # athlete: the logo's body (torso with the swoosh back)
    ic.add(P(F.body()), group="ch", merge="body")
    # chair: seat base with the caster fork, drive wheel (five-spoke hub), caster
    base = union(kit.rrect(-9.0, -0.6, 32.4, 6.4, 2.6), brush([(19.0, 4.0), (CW[0], CW[1] - CRr - 0.6)], [2.8, 2.4], ("round", "round")))
    ic.add(P(base), group="ch", merge="chair")
    ic.add(P(D.ring(DW, DR, DR - 3.8)), group="ch")
    ic.add(P(D.spokes(DW, DR - 3.8, 5, w=1.5, hub=2.6, a0=-63)), group="dw", gap=False)
    ic.add(P(D.ring(CW, CRr, CRr - 1.7)), group="ch")
    # leg: the logo's thigh, a shin down to the footplate
    knee, ankle = (27.4, -9.4), (34.4, 5.6)
    shin = brush([knee, lerp(knee, ankle, 0.5), ankle, (40.2, 7.6)], [8.6, 7.0, 5.0, 0.0], ("round", "point"))
    ic.add(P(union(D.thigh_of_logo(), shin)), group="ch", cls="a")
    # footplate and the guard cage in front of the feet
    guard = union(
        brush([(30.0, 11.4), (42.0, 11.4)], [2.6, 2.6], ("round", "round")),
        diff(kit.rrect(41.8, 1.6, 15.4, 16.4, 4.0), kit.rrect(44.4, 4.2, 10.2, 11.2, 1.8)),
        brush([(47.8, 3.0), (47.8, 16.6)], [1.8, 1.8], ("butt", "butt")),
        brush([(51.4, 3.0), (51.4, 16.6)], [1.8, 1.8], ("butt", "butt")),
    )
    ic.add(P(guard), group="ch", merge="guard")
    ic.add(P(F.head(hd)), group="ch")
    # joystick: the control box at the end of the armrest, its stick under the fist
    stick = union(kit.rrect(17.6, -19.8, 9.2, 3.8, 1.8), brush([(22.2, -19.6), (22.2, -22.4)], [1.4, 1.4], ("round", "round")))
    ic.add(P(stick), group="ch", merge="stick")
    ic.add(P(F.arm([sh, (8.2, -22.8), (21.4, -25.4)], w0=7.2, w1=4.8, fist=3.2)), group="ch", merge="body")
    bc = (57.2 + BALL_R + kit.GAP - 0.6, GROUND - BALL_R)
    ic.add(P(ball(bc)), group="bl")

    piv = P.pt((DW[0], GROUND))
    ch = [(0, "none"), (16, "translate(-1.6px,0px) rotate(-1.2deg)"),
          (27, "transform:translate(2.6px,0px) rotate(1.6deg);animation-timing-function:cubic-bezier(.3,0,.5,1)"),
          (40, "translate(1.4px,0px) rotate(0.4deg)"), (58, "none"), (100, "none")]
    ic.motion(Motion("ch", ch, pivot=piv, dur=DUR))
    deg = lambda dx: math.degrees(dx / DR)
    ic.motion(Motion("dw", [(0, "none"), (16, f"rotate({deg(-1.6):.1f}deg)"), (27, f"rotate({deg(2.6):.1f}deg)"),
                            (40, f"rotate({deg(1.4):.1f}deg)"), (58, "none"), (100, "none")], pivot=P.pt(DW), dur=DUR, parent="ch"))
    roll = lambda dx: f"translate({dx:.1f}px,0px) rotate({math.degrees(dx / BALL_R):.1f}deg)"
    bl = [(0, "none"), (26, "none"), (27, f"transform:{roll(0.4)};animation-timing-function:cubic-bezier(.2,.7,.4,1)"),
          (55, roll(9.0)), (63, f"transform:{roll(9.0)};animation-timing-function:cubic-bezier(.45,0,.55,1)"),
          (92, "none"), (100, "none")]
    ic.motion(Motion("bl", bl, pivot=P.pt(bc), dur=DUR))
    return D.finish(ic)
