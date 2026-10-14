import math
import kit
from kit import Icon, Motion, circle, union, brush
import figure as F
from set._balls import baseball as ball_shape, tr, rz, body_zone, add_arm, settle


def bat(hand, deg, length=27.0):
    """Bat from the knob (inside the fist) out along screen angle deg: thin handle, swelling barrel, round end."""
    u = (math.cos(math.radians(deg)), math.sin(math.radians(deg)))
    ts = [-1.0, 7.0, 13.0, 19.0, 23.5, length]
    ws = [2.6, 2.2, 2.7, 4.5, 5.4, 5.3]
    return brush([kit.add(hand, kit.mul(u, t)) for t in ts], ws, ("round", "round"))


def build():
    ic = Icon("baseball", "Baseball")
    P = F.Placement(40, 84)
    sh, hd = F.seated(ic, P)
    elbow, hand = (22.6, -29.4), (28.2, -45.6)   # the upper arm dips so it clears the head by a full gap
    a0 = -138.0                              # bat cocked back over the head
    add_arm(ic, P(kit.limb([sh, elbow, hand], 7.2, 4.6)), body_zone(P), "arm")
    ic.add(P(union(bat(hand, a0), circle(*hand, 3.4))), group="bat", merge="body")   # one mass with the arm
    rest = (52.0, -44.6)                     # the pitch, on its way in
    r = 3.8
    ic.add(P(ball_shape(rest, r)), group="ball")

    dur = 2.4
    arm_sw, bat_sw = 20.0, 120.0             # at contact the bat lies level: a0 + 20 + 120 = 0
    h2 = kit.rot(hand, sh, arm_sw)
    contact = (h2[0] + 17.0, h2[1] - (2.0 + r - 1.2))
    cx, cy = (contact[0] - rest[0]) * P.s, (contact[1] - rest[1]) * P.s
    fast = "cubic-bezier(.5,0,.9,.5)"
    ic.motion(Motion("arm", [(0, "none"), (24, rz(0, fast)), (36, rz(arm_sw)), (46, rz(arm_sw + 4)),
                             (58, rz(arm_sw + 4)), (88, "none"), (100, "none")], pivot=P.pt(sh), dur=dur))
    ic.motion(Motion("bat", [(0, "none"), (24, rz(-6, fast)), (36, rz(bat_sw)), (46, rz(bat_sw + 26)),
                             (58, rz(bat_sw + 26)), (88, "none"), (100, "none")], pivot=P.pt(hand), dur=dur, parent="arm"))
    ic.motion(Motion("ball", [(0, tr(0, 0, 0, 1)), (36, tr(cx, cy, 0, 1, "cubic-bezier(.2,.6,.4,1)")),
                              (52, tr(cx + 18, cy - 16, 0, 0)), (60, tr(7, -0.4, 0, 0)), (80, tr(3.5, -0.2, 0, 1)),
                              (100, tr(0, 0, 0, 1))], pivot=P.pt(rest), dur=dur, ease="linear"))
    return settle(ic)
