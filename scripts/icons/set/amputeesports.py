import math
import kit
from kit import Icon, Motion, brush, union
import figure as F
from set import _standing as L

# Amputee football: one leg, two forearm crutches splayed front and back (the A-frame that reads at
# any size), body leaning into the run. Figure space as the standing figures (hip (0, -15)); the
# ground is y = GROUND. The loop is two strides of a swing-through crutch gait, run in place.
DUR = 2.2                 # two strides
LEAN = 30.0
GROUND = 23.0
N = 16
CRUTCH, SWING, FOLD, BOB = 13.0, 38.0, 22.0, 2.2     # crutch rock, leg swing, knee fold (deg); vault (units)


def build():
    ic = Icon("amputeesports", "Amputee sports")
    P = F.Placement(56, 62)
    hip = L.HIP
    sh, hd, torso = L.standing(LEAN)

    # rear crutch, held by the far arm: the logo's swoosh sweeping back and down to a fist
    hr = (-13.6, -16.4)
    ic.add(P(L.crutch(hr, (-27.6, GROUND))), group="cf")
    sw = [sh, (sh[0] - 8.0, sh[1] - 2.6), (sh[0] - 16.0, sh[1] - 1.2), (-9.6, -26.4), (-12.8, -21.0), hr]
    ic.add(P(L.swoosh_arm(sw, w0=7.4, fist=3.3)), group="cf", merge="body")
    # the one full leg, planted behind and pushing off
    foot = (-18.6, GROUND - 3.8)
    kn = L.ik(hip, foot, 19.0, 21.0, 1)
    ic.add(P(F.thigh(hip, kn)), group="th", merge="legB")
    ic.add(P(F.shin(kn, foot)), group="sn", merge="legB")
    # body
    ic.add(P(torso), group="body", merge="body")
    ic.add(P(F.head(hd)), group="body")
    # the residual limb (near leg, accent): thigh and a short shin that ends round below the knee
    sk, sa = F.leg_points(hip, 58, 70, lt=16.0, ls=8.0)
    ic.add(P(union(F.thigh(hip, sk, 9.4, 7.8), brush([sk, sa], [7.8, 7.0], ("round", "round")))), cls="a",
           group="stump")
    # front crutch, held by the near arm: the upper arm reaches forward to the elbow, the forearm drops
    # along the crutch to the handle, and the fist grips in front of the shaft
    el = (sh[0] + 12.4, sh[1] + 2.0)
    tf = (40.0, GROUND)
    hf = kit.add(el, kit.mul(kit.norm(kit.sub(tf, el)), 11.6))
    ic.add(P(L.crutch(hf, tf)), group="cn")
    ic.add(P(F.arm([sh, el, hf], w0=7.2, w1=4.8, fist=3.3)), group="cn", merge="body")

    # ---- motion. Crutches planted: they close under the vaulting body while the leg swings
    # through. Leg planted: it sweeps back while the crutches open and swing forward again.
    def cyc(t):
        p = (2 * t) % 1.0
        return p, (1 - math.cos(2 * math.pi * p)) / 2

    def crutch(t):
        return CRUTCH * cyc(t)[1]

    def thigh(t):
        return -SWING * cyc(t)[1]

    def knee(t):
        p, _ = cyc(t)
        return FOLD * math.sin(2 * math.pi * p) if p < 0.5 else 0.0

    def bob(t):
        return -BOB * abs(math.sin(2 * math.pi * cyc(t)[0]))

    def m(name, fn, pivot, parent=None):
        ic.motion(Motion(name, L.sampled(N, fn), pivot=P.pt(pivot), dur=DUR, ease="linear", parent=parent))
    m("body", lambda t: L.tr(t=(0, bob(t))), hip)
    m("cn", lambda t: L.tr(r=crutch(t)), sh, "body")
    m("cf", lambda t: L.tr(r=-crutch(t)), sh, "body")
    m("th", lambda t: L.tr(r=thigh(t)), hip, "body")
    m("sn", lambda t: L.tr(r=knee(t)), kn, "th")
    m("stump", lambda t: L.tr(r=0.25 * thigh(t)), hip, "body")
    return ic.settle()
