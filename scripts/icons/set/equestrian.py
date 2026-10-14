import kit
from kit import Icon, add, mul
import figure as F
from set import _horse as H

K = 1.2                 # horse units -> figure units (a horse is big)
SEAT = (-2.0, -50.5)    # the rider's hip on the horse's back (horse space)
LEAN = -10              # riders sit tall: the logo torso, a little more upright


def build():
    ic = Icon("equestrian", "Horseback riding")
    s = 0.96                                           # whole drawing (figure scale)
    org = (60.0, 100.0)
    P = F.Placement(org[0], org[1], s)
    hip = mul(SEAT, K)
    off = (hip[0] - F.HIP[0], hip[1] - F.HIP[1])
    rz = lambda p: P(kit.move(p, *off))               # rider (figure space) -> icon
    rp = lambda q: P.pt(add(q, off))
    hp = lambda q: P.pt(mul(q, K))
    sh = kit.rot(F.SHOULDER, F.HIP, LEAN)
    hand = (19.5, -22.0)
    rein = kit.line(rp(hand), hp(H._head_at(6.0, 5.0)), 1.1)

    def rider(add_):
        add_(rein, gap=False)
        add_(rz(H.rider_body(LEAN)), merge="body")
        add_(rz(H.rider_leg()), cls="a")
        add_(rz(F.head(kit.rot(F.HEAD, F.HIP, LEAN))))
        add_(rz(F.arm([sh, (11.0, -19.0), hand], w0=7.0, w1=4.6, fist=3.2)), merge="body")

    H.canter(ic, (s * K, org), t0=0.3, dur=1.6, rider=rider, knock=kit.grow(rein, 0.8))
    return ic.settle()
