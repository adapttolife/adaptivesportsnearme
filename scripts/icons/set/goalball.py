import kit
from kit import Icon, Motion, brush, circle, union, diff
import figure as F
from set import _standing as L

# Goalball. Figure space: floor at y = 0. The blocker is down on the floor facing right, eyeshade
# on, the near arm stretched along the floor; the rest pose is the block, ball one gap off the fist.
# Motion: the ball bounces off and fades, rolls back in from the right ringing, the blocker
# stretches to meet it and draws it back to the block.
DUR = 2.8
BALL_R = 6.4                 # a goalball is about the size of a head
FAR_X, REACH = 13.0, 1.6     # where the ball rolls in from; how far the blocker stretches


def ball(c, r=BALL_R):
    """Goalball: two seams, and the bell holes down the band between them."""
    x, y = c
    seams = union(kit.outline(kit.arc_pts((x - r * 1.5, y), r * 1.25, -44, 44), 0.95),
                  kit.outline(kit.arc_pts((x + r * 1.5, y), r * 1.25, 136, 224), 0.95))
    holes = union(circle(x, y - 3.2, 1.0), circle(x, y, 1.0), circle(x, y + 3.2, 1.0))
    return diff(circle(x, y, r), union(seams, holes))


def build():
    ic = Icon("goalball", "Goalball")
    P = F.Placement(58, 80)

    # the far arm swept back over the shoulders (the logo's swoosh), torso
    sw = L.swoosh_arm([(7.6, -20.2), (0.0, -25.4), (-8.0, -27.0), (-15.4, -26.0), (-21.0, -23.2)], w0=7.4)
    ic.add(P(sw), group="body", merge="body")
    ic.add(P(brush([(9.4, -17.4), (0.0, -14.8), (-9.6, -11.8)], [11.4, 9.8, 8.4], ("round", "round"))),
           group="body", merge="body")
    # the leg (accent): the running figure's thigh, knee down on the floor, the shin rising a little
    # to a pointed foot
    kn, an, toe = (-25.6, -5.0), (-39.6, -8.2), (-45.2, -9.4)
    shin = brush([kn, kit.lerp(kn, an, 0.55), an, toe], [7.8, 6.2, 4.6, 0.0], ("round", "point"))
    ic.add(P(union(F.thigh((-9.4, -11.0), kn, 9.2, 7.8), shin)), cls="a", group="body")
    ic.add(P(L.shade_head((17.2, -26.6), tilt=-6)), group="body")
    sh, el, fist = (10.0, -15.8), (19.6, -9.6), (28.4, -3.6)
    ic.add(P(F.arm([sh, el, fist], w0=7.2, w1=4.8, fist=3.4)), group="body", merge="body")

    # the ball, blocked one gap off the fist; its bells ring
    bc = (fist[0] + 3.4 + 2.6 + BALL_R, -BALL_R)
    ic.add(P(ball(bc)), group="ball")
    arcs = union(L.sound_arc(bc, BALL_R + 3.2, -80, -16, 1.7), L.sound_arc(bc, BALL_R + 7.0, -78, -18, 1.7))
    ic.add(P(arcs), group="ring", gap=False)

    # ---- motion
    def roll(x):           # rolling: turn by distance over radius (leftward travel turns it anticlockwise)
        return f"translate({x:.2f}px,0px) rotate({x / BALL_R * 57.2958:.1f}deg)"

    def ring(x, s=1.0):
        return f"translate({x:.2f}px,0px) scale({s:.2f})"
    ease_out = "animation-timing-function:cubic-bezier(.25,.6,.35,1)"
    ic.motion(Motion("ball", [
        (0, f"transform:{roll(0)};opacity:1"), (14, f"transform:{roll(0)};opacity:1"),
        (28, f"transform:{roll(1.6)};opacity:0"), (29, f"transform:{roll(FAR_X)};opacity:0;{ease_out}"),
        (66, f"transform:{roll(REACH)};opacity:1"), (74, f"transform:{roll(REACH)};opacity:1"),
        (100, f"transform:{roll(0)};opacity:1")],
        pivot=P.pt(bc), dur=DUR, ease="cubic-bezier(.45,0,.55,1)"))
    ic.motion(Motion("ring", [
        (0, f"transform:{ring(0)};opacity:1"), (7, f"transform:{ring(0, 1.1)};opacity:.35"),
        (14, f"transform:{ring(0)};opacity:0"), (29, f"transform:{ring(FAR_X)};opacity:0;{ease_out}"),
        (42, f"transform:{ring(FAR_X * 0.42)};opacity:1"), (54, f"transform:{ring(FAR_X * 0.14, 1.1)};opacity:.35"),
        (66, f"transform:{ring(REACH)};opacity:1"), (74, f"transform:{ring(REACH)};opacity:1"),
        (100, f"transform:{ring(0)};opacity:1")],
        pivot=P.pt(bc), dur=DUR, ease="linear"))
    ic.motion(Motion("body", [(0, "none"), (48, "none"), (66, f"translate({REACH:.2f}px,0px)"),
                              (74, f"translate({REACH:.2f}px,0px)"), (100, "none")], pivot=P.pt(sh), dur=DUR))
    return ic.settle()
