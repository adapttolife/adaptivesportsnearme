import math
import kit
from kit import Icon, Motion, union, brush
import figure as F
from set import _standing as L

# Guided running (blind sports): the athlete (eyeshade, nearer, a stride ahead) and the guide one
# step further away, trailing, joined hand to hand by a short tether: the guide's forward hand holds
# one end, the athlete's trailing hand (the logo swoosh, ending in a fist) the other. Both bodies, the
# tethered arms and the tether bob as one group, so their overlaps get fixed white gaps; the free
# arms swing. Figures are the running figure of set/running.py at 0.86 (two people).
S = 0.86
GUIDE = (-41.0, -4.0)    # the guide's offset from the athlete (figure units)
REACH = 14.0             # the guide's forward arm lowered to the tether (deg)
TRAIL = 10.0             # the athlete's trailing arm carried up to meet it (deg)
DUR = 1.68               # two strides
N = 16
SWING = 22.0             # free-arm swing (deg)
BOB = 1.5


def build():
    ic = Icon("blindsports", "Blind sports")
    PA = F.Placement(64, 64, S)
    PG = F.Placement(64 + GUIDE[0] * S, 64 + GUIDE[1] * S, S)
    A = L.runner(shade=True)
    G = L.runner()
    g_arm = kit.rotate(G["arm"], REACH, G["sh"])
    g_fist = PG.pt(kit.rot(G["fist"], G["sh"], REACH))
    hip, lean = A["hip"], 14.0
    sw = [A["sh"]] + [kit.rot((hip[0] + x, hip[1] + y), hip, lean) for x, y in ((-4.0, -18.0), (-10.4, -13.6), (-14.0, -7.6))]
    sw = [kit.rot(p, A["sh"], -TRAIL) for p in sw]
    a_tip = PA.pt(sw[-1])

    # the guide (further away): its swoosh swings; body, legs, head and tethered arm ride the bob
    ic.add(PG(G["swoosh"]), group="gs", merge="gbody")
    ic.add(PG(G["far_leg"]), group="bod", merge="glegB")
    ic.add(PG(G["torso"]), group="bod", merge="gbody")
    ic.add(PG(G["head"]), group="bod")
    ic.add(PG(union(G["near_thigh"], G["near_shin"])), group="bod", merge="glegA")
    ic.add(PG(g_arm), group="bod", merge="gbody")
    # the athlete (nearer); the near leg carries the accent
    ic.add(PA(L.swoosh_arm(sw, w0=7.4, fist=3.3)), group="bod", merge="abody")
    ic.add(PA(A["far_leg"]), group="bod", merge="alegB")
    ic.add(PA(A["torso"]), group="bod", merge="abody")
    ic.add(PA(A["head"]), group="bod")
    ic.add(PA(union(A["near_thigh"], A["near_shin"])), cls="a", group="bod", merge="alegA")
    # the tether, sagging a little between the two fists
    mid = kit.add(kit.lerp(g_fist, a_tip, 0.5), (0, 1.4))
    ic.add(brush([g_fist, mid, a_tip], [1.1, 1.1, 1.1], ("round", "round")), group="bod", gap=False)
    ic.add(PA(A["arm"]), group="aa", merge="abody")

    # ---- motion: the pair bobs once a stride; the free arms swing against each other
    ic.motion(Motion("bod", L.sampled(N, lambda t: L.tr(t=(0, BOB - BOB * math.cos(4 * math.pi * t)))),
                     pivot=PA.pt(hip), dur=DUR, ease="linear"))
    ic.motion(Motion("aa", L.sampled(N, lambda t: L.tr(r=SWING * math.sin(2 * math.pi * t))), pivot=PA.pt(A["sh"]),
                     dur=DUR, ease="linear", parent="bod"))
    ic.motion(Motion("gs", L.sampled(N, lambda t: L.tr(r=-0.5 * SWING * math.sin(2 * math.pi * t))),
                     pivot=PG.pt(G["sh"]), dur=DUR, ease="linear", parent="bod"))
    return ic.settle()
