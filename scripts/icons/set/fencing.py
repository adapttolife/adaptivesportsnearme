import kit
from kit import Icon, Motion, circle, union, brush, add, sub, mul, polar, rot, dist
import figure as F
from set import _props as B

L0 = 4.0                                   # rest lean (the thrust is the rest pose)


def build():
    ic = Icon("fencing", "Wheelchair fencing")
    P = F.Placement(40, 80)
    lp = lambda p: rot(p, F.HIP, L0)
    # rear arm: the logo's swoosh language, swept back and raised (a fencer's back arm)
    ra_pts = [(4.6, -33.4), (-3.0, -36.8), (-8.8, -40.0), (-13.4, -44.6), (-16.8, -50.6)]
    rear = brush([lp(p) for p in ra_pts], [9.0, 6.8, 5.2, 3.2, 0.0], ("round", "point"))
    ic.add(P(rear), group="ra", merge="body")
    ic.add(P(B.torso(L0)), group="ub", merge="body")
    ic.add(P(F.wheel()))
    ic.add(P(F.leg()), cls="a")
    hd = lp(F.HEAD)
    ic.add(P(F.head(hd)), group="ub")
    # sword arm: rooted a little below the shoulder so it clears the head
    R = lp((8.0, -30.6))
    H0 = add(R, (22.2, -1.4))
    l1, l2 = 11.6, 11.4
    E0 = B.ik(R, H0, l1, l2, 1)
    ic.add(P(brush([R, kit.lerp(R, E0, 0.5), E0], [7.2, 6.6, 6.0], ("round", "round"))), group="ua", merge="body")
    ic.add(P(union(brush([E0, kit.lerp(E0, H0, 0.5), H0], [6.0, 5.3, 4.6], ("round", "round")), circle(*H0, 3.2))),
           group="fa", merge="body")
    # epee: bell guard one gap in front of the fist, thin blade, small button
    bd = -5.0
    g0 = polar(H0, 3.2 + kit.GAP, bd)
    guard = B.dome(g0, bd, 2.9, 4.7)
    base = polar(g0, 2.0, bd)
    tip = polar(base, 36.0, bd)
    blade = union(brush([base, polar(base, 18, bd), tip], [2.0, 1.6, 1.2], ("round", "round")), circle(*tip, 1.0))
    ic.add(P(union(guard, blade)), group="bl")

    # ---- motion: rest (extended) -> draw back to en garde -> thrust -> tip flick -> settle
    dur = 2.4
    lean = [(0, 0), (0.10, 0), (0.36, -7), (0.44, -7), (0.53, 3.0), (0.64, 2.2), (0.86, 0), (1, 0)]
    # hand target relative to the root, in the body's own (leaned) frame
    reach = [(0, 0), (0.10, 0), (0.36, -7.0), (0.44, -7.0), (0.53, 0.9), (0.64, 0.6), (0.86, 0), (1, 0)]
    lift = [(0, 0), (0.10, 0), (0.36, -2.6), (0.44, -2.6), (0.53, 0.0), (0.86, 0), (1, 0)]
    blade_k = [(0, 0), (0.10, 0), (0.36, -13), (0.44, -13), (0.52, 2), (0.555, -5), (0.59, 3), (0.63, -1.5),
               (0.68, 0.5), (0.86, 0), (1, 0)]
    rear_k = [(0, 0), (0.10, 0), (0.36, -8), (0.44, -8), (0.53, 6), (0.70, 4), (0.86, 0), (1, 0)]
    fl, fr, fu, fb, fra = (B.spline(k) for k in (lean, reach, lift, blade_k, rear_k))
    ts = B.times([lean, reach, lift, blade_k, rear_k], 30)
    d0 = sub(H0, R)
    u = (d0[0] / dist(R, H0), d0[1] / dist(R, H0))

    def hand(t):
        return add(add(H0, mul(u, fr(t))), (0.0, -fu(t)))

    def ua(t):
        return B.arm_angles(R, E0, H0, hand(t), 1)[0]

    def fa(t):
        return B.arm_angles(R, E0, H0, hand(t), 1)[1]

    def bl(t):
        # keep the blade's own aim: undo the arm's turns, then add the flick
        a1, a2 = B.arm_angles(R, E0, H0, hand(t), 1)
        return -(a1 + a2) + fb(t) - fl(t) * 0.6

    ic.motion(Motion("ub", B.sampled(lambda t: B.rot_css(fl(t)), ts), pivot=P.pt(F.HIP), dur=dur, ease="linear"))
    ic.motion(Motion("ra", B.sampled(lambda t: B.rot_css(fra(t)), ts), pivot=P.pt(lp((2.0, -34.6))), dur=dur,
                     ease="linear", parent="ub"))
    ic.motion(Motion("ua", B.sampled(lambda t: B.rot_css(ua(t)), ts), pivot=P.pt(R), dur=dur, ease="linear",
                     parent="ub"))
    ic.motion(Motion("fa", B.sampled(lambda t: B.rot_css(fa(t)), ts), pivot=P.pt(E0), dur=dur, ease="linear",
                     parent="ua"))
    ic.motion(Motion("bl", B.sampled(lambda t: B.rot_css(bl(t)), ts), pivot=P.pt(H0), dur=dur, ease="linear",
                     parent="fa"))
    return ic.finish()
