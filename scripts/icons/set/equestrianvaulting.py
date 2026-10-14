import math
import kit
from kit import Icon, Motion, brush, union, diff, add, sub, mul, rot
import figure as F
from set import _horse as H

K = 1.2                   # horse units -> figure units
KNEE = (3.0, -50.6)       # the vaulter's knee on the horse's back (horse space)
LEAN = -14                # kneeling tall


def vaulter_leg(knee, hip, toe):
    """Kneeling leg in the logo leg's character: thigh down to the knee, shin back along the horse to a point."""
    thigh = brush([hip, kit.lerp(hip, knee, .5), knee], [9.4, 9.2, 8.6], ("round", "round"))
    shin = brush([knee, kit.lerp(knee, toe, .45), toe], [8.4, 7.0, 0.0], ("round", "point"))
    return union(thigh, shin)


def build():
    ic = Icon("equestrianvaulting", "Equestrian vaulting")
    s = 0.88
    org = (60.0, 104.0)
    P = F.Placement(org[0], org[1], s)
    knee_f = mul(KNEE, K)                                  # figure units, horse origin
    hip_f = add(knee_f, (-3.4, -13.6))
    off = sub(hip_f, F.HIP)                                # vaulter's figure space -> horse-origin figure space
    vz = lambda p: P(kit.move(p, *off))
    vp = lambda q: P.pt(add(q, off))
    loc = lambda q: sub(q, off)                            # horse-origin figure point -> vaulter figure space
    leg = vaulter_leg(loc(knee_f), F.HIP, loc(add(knee_f, (-18.5, 0.4))))
    sh = rot(F.SHOULDER, F.HIP, LEAN)
    hd = rot(F.HEAD, F.HIP, LEAN)
    torso = F.torso(LEAN)
    # arms spread wide: the near arm reaches forward and up, the logo swoosh is the far arm sweeping back
    front = F.arm([sh, add(sh, (9.4, -0.4)), add(sh, (19.0, -0.8))], w0=7.0, w1=4.6, fist=3.2)
    back = brush([add(sh, (-2.6, -2.2)), add(sh, (-9.0, -3.0)), add(sh, (-15.6, -2.6)), add(sh, (-21.6, -0.8)),
                  add(sh, (-26.4, 2.2))], [8.0, 7.4, 6.4, 4.4, 0.0], ("round", "point"))
    gapleg = kit.grow(leg, kit.GAP)

    def kneel(add_):
        add_(vz(leg), cls="a")

    c = H.canter(ic, (s * K, org), t0=0.3, rider=kneel)
    # upper body: hangs on the horse's body and stays upright, swaying to balance
    ic.add(vz(diff(H.smooth(union(torso, back), 1.6), gapleg)), group="vu", merge="body")
    ic.add(vz(F.head(hd)), group="vu")
    ic.add(vz(front), group="vu", merge="body")
    hip_icon = vp(F.HIP)
    ic.motion(Motion("vu", c.frames(lambda t: f"rotate({H._fmt(-0.85 * c.body_at(t)[0] + 3.2 * math.sin(2 * math.pi * t), 1)}deg)"),
                     pivot=hip_icon, dur=c.dur, ease="linear", parent="hb"))
    return ic.settle()
