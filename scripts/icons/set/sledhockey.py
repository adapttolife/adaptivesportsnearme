import kit
from kit import Icon, Motion, union, brush, circle, add, mul, sub, rot, rrect
import figure as F
from set import _water as C


def stick(top, heel, toe_len=8.0, w=2.4, picks=False):
    """Sled hockey stick: a short shaft from the grip to the heel, then a curved blade along the ice.
    picks=True draws the other end instead: the butt with three short picks that dig into the ice."""
    d = kit.norm(sub(heel, top))
    shaft = brush([add(top, mul(d, -3.0)), kit.lerp(top, heel, 0.5), heel], [w, w, w * 1.05], ("round", "round"))
    fwd = (1.0 if heel[0] >= top[0] else -1.0)
    if picks:
        n = (-d[1], d[0])
        teeth = union(*[brush([add(heel, mul(n, k * 1.6)), add(add(heel, mul(n, k * 1.9)), mul(d, 2.6))], [1.2, 0.0],
                              ("round", "point")) for k in (-1, 0, 1)])
        return union(shaft, teeth)
    toe = (heel[0] + fwd * toe_len, heel[1] + 0.2)
    blade = brush([heel, (heel[0] + fwd * toe_len * 0.55, heel[1] + 0.9), toe, (toe[0] + fwd * 1.2, toe[1] - 1.8)],
                  [w * 1.2, 2.8, 2.6, 1.8], ("round", "round"))
    return union(shaft, blade)


# legs stretched forward on the sled: tail behind the hip, thigh forward, knee a little up, shin down to the toe
LEG = [(-4.5, -25.0), (-5.5, -18.0), (-2.5, -12.0), (6.0, -10.6), (16.0, -12.6), (25.0, -12.0), (34.0, -7.6),
       (42.0, -5.2), (49.5, -5.4)]
LEG_W = [0.0, 5.0, 8.2, 9.0, 8.6, 8.0, 6.6, 4.8, 0.0]


def build(lean=18, ice=10.0, hand=(34.0, -19.0), heel=(42.5, 6.6), rear_hand=(-20.0, -10.0), rear_end=(-29.0, 7.4),
          puck=(58.5, 7.6), dur=1.6, L1=13.0, L2=12.5):
    ic = Icon("sledhockey", "Sled hockey")
    P = F.Placement(50, 70)
    sh, hd = F.upper(lean)
    R = lambda p: rot(p, F.HIP, lean)
    # ice
    ic.add(P(F.swoosh([(-40, ice + 1.0), (-6, ice + 1.4), (30, ice + 1.2), (66, ice + 0.6)], 3.6)))
    # rear stick (picks into the ice) held by the rear arm: the logo swoosh ending in a fist
    ic.add(P(stick(rear_hand, rear_end, picks=True)))
    rear = brush([R((4.0, -34.6)), R((-3.0, -34.6)), R((-10.0, -31.0)), R((-15.0, -24.5)), rear_hand],
                 [8.0, 7.6, 7.0, 5.8, 4.8], ("round", "round"))
    ic.add(P(union(rear, circle(*rear_hand, 3.3))), merge="body")
    # sled: a blade on two short struts under the seat
    ic.add(P(union(brush([(-10.0, ice - 3.4), (10.0, ice - 3.2), (26.0, ice - 3.4)], [2.2, 2.4, 2.2], ("round", "round")),
                   brush([(-4.0, -3.0), (-4.5, ice - 3.6)], [2.6, 2.6], ("round", "round")),
                   brush([(18.0, -2.0), (18.5, ice - 3.6)], [2.6, 2.6], ("round", "round")))))
    ic.add(P(F.torso(lean)), merge="body")
    ic.add(P(brush(LEG, LEG_W, ("point", "point"))), cls="a")
    # sled frame: a low seat shell and a tube forward to a hoop in front of the feet
    frame = brush([(-10.0, -12.0), (-8.0, -5.0), (0.0, -2.2), (20.0, -1.4), (46.0, -1.0), (53.0, -2.4), (55.0, -6.8),
                   (53.0, -10.8), (50.5, -11.6)], [2.4, 3.2, 3.4, 3.2, 3.2, 3.0, 2.8, 2.6, 2.2], ("round", "round"))
    ic.add(P(frame))
    ic.add(P(F.head(hd)))
    # near arm and the front stick (they sweep), puck
    E = C.elbow(sh, hand, L1, L2, bend=1)
    up, fo = C.arm2(sh, E, hand)
    ic.add(P(up), merge="body")
    ic.add(P(fo), merge="body")
    ic.add(P(stick(hand, heel)), group="st")
    ic.add(P(rrect(puck[0] - 3.6, puck[1] - 1.5, 7.2, 3.0, 1.3)), group="pk")
    # stick handling: the wrists sweep the blade forward with the puck, then draw it back
    ic.motion(Motion("st", [(0, "none"), (35, "rotate(-11deg)"), (70, "rotate(7deg)"), (100, "none")], pivot=P.pt(hand), dur=dur))
    ic.motion(Motion("pk", [(0, "none"), (35, "translate(5.5px,0px)"), (70, "translate(-.8px,0px)"), (100, "none")],
                     pivot=P.pt(puck), dur=dur))
    return ic.settle()
