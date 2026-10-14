import math
import kit
from kit import Icon, Motion, circle, union, inter, brush, outline, poly
import figure as F
from set._balls import add_arm, body_zone, fly, settle, rz

DEG = -58.0                     # the stick held up and forward, net high: the cradle
SHAFT = 17.0                    # hand -> throat
BUTT = 6.0                      # shaft below the hand


def stick(hand, deg):
    """(frame, mesh, pocket centre): a shaft through the hand, a rounded-triangle head with a mesh."""
    u = (math.cos(math.radians(deg)), math.sin(math.radians(deg)))
    n = (-u[1], u[0])

    def at(s, t=0.0):
        return (hand[0] + u[0] * s + n[0] * t, hand[1] + u[1] * s + n[1] * t)
    shaft = brush([at(-BUTT), at(SHAFT + 0.6)], [2.0, 1.8], ("round", "round"))
    T = SHAFT
    # head: narrow throat, sidewalls flaring to a wide rounded scoop (pocket length 15, width 11)
    rim = [at(T + 0.3, 0.0), at(T + 3.4, -3.3), at(T + 8.4, -5.8), at(T + 12.8, -5.7), at(T + 15.0, -3.3),
           at(T + 15.6, 0.0), at(T + 15.0, 3.3), at(T + 12.8, 5.7), at(T + 8.4, 5.8), at(T + 3.4, 3.3), at(T + 0.3, 0.0)]
    frame = brush(rim, [1.6] * len(rim), ("round", "round"), samples=12)
    inner = poly(rim[:-1])                         # mesh lines end inside the frame stroke: no slivers at the rim
    lines = []
    for k in range(-6, 7):
        o = k * 2.7
        lines.append(outline([at(T + 8 + o - 10, -10), at(T + 8 + o + 10, 10)], 0.75, "butt"))
        lines.append(outline([at(T + 8 + o - 10, 10), at(T + 8 + o + 10, -10)], 0.75, "butt"))
    mesh = inter(union(*lines), inner)
    return union(shaft), frame, mesh, at(T + 9.6, 0.0)


def build():
    ic = Icon("lacrosse", "Lacrosse")
    P = F.Placement(40, 84)
    sh = F.SHOULDER
    elbow, hand = (18.4, -28.8), (27.4, -37.0)   # the upper arm dips so it clears the head by a full gap
    shaft, frame, mesh, pc = stick(hand, DEG)
    r = 2.7

    ic.add(P(F.body()), merge="body")
    ic.add(P(F.wheel()))
    ic.add(P(F.leg()), cls="a")
    ic.add(P(F.head()))
    add_arm(ic, P(kit.limb([sh, elbow, hand], 7.2, 4.6)), body_zone(P), "arm")
    ic.add(P(union(shaft, circle(*hand, 3.4))), group="st", merge="body")   # the fist and stick: one mass with the arm
    ic.add(P(frame), group="st", merge="body")
    ic.add(P(mesh), group="st", gap=False)
    ic.add(P(circle(*pc, r)), group="pb", gap=False)  # in the pocket (rides the stick), sitting in the mesh
    ic.add(P(circle(*pc, r)), group="fb", gap=False)  # passed

    dur = 3.0
    REL = 64.0
    # cradle: two rocks of the stick; then the pass: a load back, a whip forward, the ball goes out of the net
    st = [(0, 0, None), (10, -9, None), (20, 7, None), (30, -9, None), (40, 6, None), (50, 0, None),
          (57, -30, "cubic-bezier(.6,0,.8,.5)"), (REL, 22, None), (REL + 0.6, 23, None), (72, 30, None), (80, 30, None),
          (94, 0, None), (100, 0, None)]
    am = {0: 0, 10: -2, 20: 2, 30: -2, 40: 2, 50: 0, 57: -6, REL: 8, REL + 0.6: 8, 72: 10, 80: 10, 94: 0, 100: 0}
    ic.motion(Motion("arm", [(p, rz(am[p], e)) for p, a, e in st], pivot=P.pt(sh), dur=dur))
    ic.motion(Motion("st", [(p, rz(a, e)) for p, a, e in st], pivot=P.pt(hand), dur=dur, parent="arm"))
    op = lambda p: 1 if (p <= REL or p >= 94) else 0
    ic.motion(Motion("pb", [(p, rz(a, e) + f";opacity:{op(p)}") for p, a, e in st],
                     pivot=P.pt(hand), dur=dur, parent="arm"))
    s = P.s
    a_rel = math.radians(DEG + 22 + 8)
    v = (math.cos(a_rel), math.sin(a_rel))
    fly(ic, "pb", "fb", P.pt(pc), REL, dur, [(72, 10 * s * v[0], 10 * s * v[1], 0, 1),
                                               (80, 18 * s * v[0] + 2 * s, 18 * s * v[1] + 2 * s, 0, 0)])
    return settle(ic)
