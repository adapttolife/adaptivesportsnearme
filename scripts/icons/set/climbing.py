import kit
from kit import Icon, Motion, brush, circle, union, poly
import figure as F
from set import _standing as L

# Adaptive climbing. Figure space as the standing figures (hip (0, -15), feet near y = 25). The
# climber faces the wall on the right, leans back on the rope and looks up; the near hand grips a
# hold, the near leg (a prosthetic) stands on the low hold. Motion: pull up and settle while the
# hand and foot stay put (arm and leg solved as two bones); the rope follows the climber.
DUR = 2.8
LEAN = -10.0
WALL_X = 26.6                      # the wall's face
A1, A2 = 12.4, 11.6                # upper arm, forearm
T1, T2 = 15.0, 20.0                # near thigh (foreshortened: the knee turns out), shin
LIFT = 5.0                         # how far the body rises
SWAY = 1.2                         # and how far the hips come in to the wall
N = 8                              # motion samples


def hold(y):
    """A climbing hold: a rounded wedge set on the wall face, one gap off it (y is its top)."""
    x = WALL_X - kit.GAP - 1.8
    return kit.grow(poly([(x, y + 1.8), (x - 4.2, y + 3.6), (x, y + 6.9)]), 1.8)


def build():
    ic = Icon("climbing", "Adaptive climbing")
    P = F.Placement(56, 70)
    hip = L.HIP
    sh, _, torso = L.standing(LEAN)
    hd = (sh[0] - 6.2, sh[1] - 11.0)          # head tipped back, looking up at the hold

    # the wall and three holds: the next hold up, the hand hold, the foot hold
    ic.add(P(brush([(WALL_X + 3.2, -68.0), (WALL_X + 3.2, 26.0)], [6.2, 6.2], ("flat", "flat"))), merge="wall")
    top_hand = (sh[0] + 23.4 * 0.616, sh[1] - 23.4 * 0.788)    # nearly straight arm, clear of the head
    top_y, low_y = top_hand[1] - 3.4, 2.8                      # the fist grips the hand hold's tip
    for y in (top_y - 15.0, top_y, low_y):
        ic.add(P(hold(y)), merge="wall")

    # far leg (hangs free), back swoosh, torso, head
    kf, af = F.leg_points(hip, 8, 14)
    ic.add(P(union(F.thigh(hip, kf), F.shin(kf, af))), group="body", merge="legB")
    sw = L.swoosh_arm([sh, F.rot((-6.0, -32.0), hip, LEAN), F.rot((-11.0, -27.0), hip, LEAN),
                       F.rot((-14.0, -21.0), hip, LEAN), F.rot((-15.0, -15.6), hip, LEAN)], w0=7.4)
    ic.add(P(sw), group="body", merge="body")
    ic.add(P(torso), group="body", merge="body")
    ic.add(P(F.head(hd)), group="body")

    # rope: from the anchor above down to the climber's back (it runs on behind to the harness)
    anchor = (-26.0, -70.0)
    tie = (-12.4, -40.6)
    ic.add(P(kit.line(anchor, tie, 1.15)), group="rope", gap=False)

    # near leg (accent): thigh and a prosthetic lower leg whose foot stands on the low hold
    foot = (WALL_X - 9.4, low_y - 1.0)
    kn = L.ik(hip, foot, T1, T2, -1)
    ic.add(P(F.thigh(hip, kn)), cls="a", group="th", merge="legA")
    ic.add(P(L.pylon(kn, foot)), cls="a", group="sh", merge="legA")

    # near arm: the fist stays on the hold while the arm bends
    el = L.ik(sh, top_hand, A1, A2, 1)
    up, fo = L.arm2(sh, el, top_hand, w0=7.2, w1=4.8, fist=0.01)
    ic.add(P(up), group="ua", merge="body")
    ic.add(P(fo), group="fa", merge="body")
    ic.add(P(circle(*top_hand, 3.4)), merge="body")

    # ---- motion
    def lift(t):
        return LIFT * L.bump(t, 0.08, 0.46, 0.6, 0.94)

    def sway(t):
        return SWAY * L.bump(t, 0.2, 0.5, 0.56, 0.9)

    def limb(s0, e0, t0, l1, l2, bend):
        """Rotations (upper bone about its root, lower bone about the joint) that keep the end on t0."""
        def angles(t):
            s1 = (s0[0] + sway(t), s0[1] - lift(t))
            e1 = L.ik(s1, t0, l1, l2, bend)
            a_up = L.wrap(L.ang(s1, e1) - L.ang(s0, e0))
            return a_up, L.wrap(L.ang(e1, t0) - L.ang(e0, t0) - a_up)
        return angles
    arm = limb(sh, el, top_hand, A1, A2, 1)
    leg = limb(hip, kn, foot, T1, T2, -1)

    def m(name, fn, pivot, parent=None, rest="none"):
        ic.motion(Motion(name, L.sampled(N, fn, rest), pivot=P.pt(pivot), dur=DUR, ease="linear", parent=parent))
    m("body", lambda t: L.tr(t=(sway(t), -lift(t))), hip)
    m("ua", lambda t: L.tr(r=arm(t)[0]), sh, "body")
    m("fa", lambda t: L.tr(r=arm(t)[1]), el, "ua")
    m("th", lambda t: L.tr(r=leg(t)[0]), hip, "body")
    m("sh", lambda t: L.tr(r=leg(t)[1]), kn, "th")
    m("rope", lambda t: L.stretch(anchor, tie, (tie[0] + sway(t), tie[1] - lift(t))), anchor,
      rest=L.stretch(anchor, tie, tie, True))
    return ic.settle()
