import math
import kit
from kit import Icon, Motion, brush, circle, union, diff
import figure as F
from set import _standing as L

# Beep baseball: a batter in an eyeshade waits on a beeping ball, then swings through it.
# Figure space as the standing figures (hip (0, -15)); a batting stance with the feet planted wide.
# The swing is keyed by joint angles (upper arm, bat) and played by forward kinematics with the
# wrists set, so the bat turns with the forearm. The far arm (the logo swoosh) keeps pointing at
# the hands; the bat passes behind the head, the ball is hit at contact and flies off.
DUR = 2.8
LEAN = 8.0
A1, A2 = 12.0, 11.4                # upper arm, forearm
BAT = 25.0
BALL_R = 5.4
GROUND = 18.0                      # the stance: feet wide, knees bent

# stance, load, slot, contact, follow-through, hold, back to the stance
KEY_T = [0.00, 0.22, 0.30, 0.37, 0.44, 0.50, 0.62, 0.71, 1.00]
KEY_B = [-122.0, -122.0, -134.0, -115.0, 0.0, -60.0, -60.0, -122.0, -122.0]     # bat angle


def key_u(u0):
    """Upper-arm angle keys (the stance and the load are relative to the drawn rest pose)."""
    return [u0, u0, u0 + 6.0, 120.0, 25.0, -10.0, -10.0, u0, u0]


SAMPLES = [22, 27, 30, 33, 35, 37, 39, 40.5, 42, 43, 44, 46, 48, 50, 62, 64.5, 67, 69, 71]


def bat(h, deg):
    """Bat from the hands: thin handle, swelling barrel, round end; a small knob below the grip."""
    d = (math.cos(math.radians(deg)), math.sin(math.radians(deg)))
    return union(brush([kit.add(h, kit.mul(d, -1.8)), kit.add(h, kit.mul(d, BAT * 0.5)), kit.add(h, kit.mul(d, BAT))],
                       [2.3, 3.0, 5.0], ("round", "round")),
                 circle(*kit.add(h, kit.mul(d, -3.2)), 1.9))


def ball(c, r=BALL_R):
    x, y = c
    seams = union(kit.outline(kit.arc_pts((x - r * 1.5, y), r * 1.2, -40, 40), 0.85),
                  kit.outline(kit.arc_pts((x + r * 1.5, y), r * 1.2, 140, 220), 0.85))
    return diff(circle(x, y, r), seams)


def build():
    ic = Icon("beepbaseball", "Beep baseball")
    P = F.Placement(52, 66)
    hip = L.HIP
    sh, hd, torso = L.standing(LEAN)

    h0, b0 = (sh[0] - 10.0, sh[1] - 6.0), KEY_B[0]        # hands at the back shoulder, bat cocked
    e0 = L.ik(sh, h0, A1, A2, -1)
    u0, f0 = L.ang(sh, e0), L.ang(e0, h0)
    u_at, b_at = kit._pchip(KEY_T, key_u(u0)), kit._pchip(KEY_T, KEY_B)

    def pose(t):
        """(upper-arm turn, forearm turn relative to it, hand point) at loop time t."""
        u, b = u_at(t), b_at(t)
        f = f0 + (b - b0)
        e = kit.add(sh, kit.polar((0, 0), A1, u))
        return u - u0, (f - f0) - (u - u0), kit.add(e, kit.polar((0, 0), A2, f))

    # far leg, the far arm (the logo swoosh up to the hands), torso, near (front) leg
    af = (-15.0, GROUND)
    kf = L.ik(hip, af, 19.0, 21.0, -1)
    ic.add(P(union(F.thigh(hip, kf), F.shin(kf, af))), group="body", merge="legB")
    sw = L.swoosh_arm([sh, (sh[0] - 1.6, sh[1] - 4.4), (sh[0] - 5.6, sh[1] - 6.6), (h0[0] + 1.2, h0[1] - 0.4)], w0=7.2)
    ic.add(P(sw), group="sw", merge="body")
    ic.add(P(torso), group="body", merge="body")
    an = (15.0, GROUND)
    kn = L.ik(hip, an, 19.0, 21.0, -1)
    ic.add(P(union(F.thigh(hip, kn), F.shin(kn, an))), cls="a", group="body", merge="legA")
    # near arm and bat (the bat rides with the forearm)
    up, fo = L.arm2(sh, e0, h0, w0=7.2, w1=4.8, fist=3.4)
    ic.add(P(up), group="ua", merge="body")
    ic.add(P(fo), group="fa", merge="body")
    ic.add(P(bat(h0, b0)), group="fa", merge="body")
    # the head with the eyeshade, in front of the swing
    ic.add(P(L.shade_head(hd, tilt=LEAN)))

    # the ball and its beeps
    bc = (45.0, -28.6)
    ic.add(P(ball(bc)), group="ball")
    ic.add(P(union(L.sound_arc(bc, BALL_R + 3.4, -50, 50, 1.9), L.sound_arc(bc, BALL_R + 7.6, -46, 46, 1.9))),
           group="ring", gap=False)

    # ---- motion
    ic.motion(Motion("body", [(0, "none"), (100, "none")], pivot=P.pt(hip), dur=DUR))
    ic.motion(Motion("ua", L.timed(SAMPLES, lambda t: L.tr(r=pose(t)[0])), pivot=P.pt(sh), dur=DUR, ease="linear",
                     parent="body"))
    ic.motion(Motion("fa", L.timed(SAMPLES, lambda t: L.tr(r=pose(t)[1])), pivot=P.pt(e0), dur=DUR, ease="linear",
                     parent="ua"))

    # the far arm turns about the shoulder to keep pointing at the hands. It rides in the forearm's
    # chain (so it joins the grip with no gap); its own motion undoes the chain's turn.
    def far(t):
        a_up, a_fo, h = pose(t)
        want = L.wrap(L.ang(sh, h) - L.ang(sh, h0))
        back = kit.add(e0, kit.rot(kit.sub(sh, e0), (0, 0), -a_fo))       # the shoulder seen from the forearm
        return L.tr(t=kit.sub(back, sh), r=L.wrap(want - a_up - a_fo))
    ic.motion(Motion("sw", L.timed(SAMPLES, far), pivot=P.pt(sh), dur=DUR, ease="linear", parent="fa"))
    # the ball beeps, is hit at contact (44%), flies off and fades; a new one fades in
    ic.motion(Motion("ball", [
        (0, "transform:translate(0px,0px);opacity:1"), (44, "transform:translate(0px,0px);opacity:1;"
                                                             "animation-timing-function:cubic-bezier(.2,.7,.4,1)"),
        (56, "transform:translate(14px,-16px);opacity:0"), (57, "transform:translate(0px,0px);opacity:0"),
        (72, "transform:translate(0px,0px);opacity:0"), (86, "transform:translate(0px,0px);opacity:1"),
        (100, "transform:translate(0px,0px);opacity:1")],
        pivot=P.pt(bc), dur=DUR, ease="cubic-bezier(.45,0,.55,1)"))
    ic.motion(Motion("ring", [
        (0, "transform:scale(1);opacity:1"), (9, "transform:scale(1.14);opacity:.25"),
        (18, "transform:scale(1);opacity:1"), (27, "transform:scale(1.14);opacity:.25"),
        (34, "transform:scale(1);opacity:1"), (41, "transform:scale(1);opacity:0"),
        (76, "transform:scale(1);opacity:0"), (88, "transform:scale(1);opacity:1"),
        (100, "transform:scale(1);opacity:1")], pivot=P.pt(bc), dur=DUR, ease="cubic-bezier(.45,0,.55,1)"))
    return ic.settle()
