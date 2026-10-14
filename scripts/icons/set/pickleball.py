import math
import kit
from kit import Icon, Motion, circle, union, brush, rrect
import figure as F
from set._balls import wiffle, arc_frames, rz, body_zone, add_arm, fmt, settle


def paddle(hand, deg, face_w=10.4, face_h=12.6, neck=4.4):
    """Solid paddle: a short handle out of the fist, then a rounded-rectangle face, along screen angle deg."""
    u = (math.cos(math.radians(deg)), math.sin(math.radians(deg)))
    base = kit.add(hand, kit.mul(u, neck))
    handle = brush([kit.add(hand, kit.mul(u, -1.5)), base], [2.8, 2.6], ("round", "flat"))
    c = kit.add(base, kit.mul(u, face_h / 2))
    face = rrect(c[0] - face_h / 2, c[1] - face_w / 2, face_h, face_w, 3.6)   # long axis along +x, then turn
    face = kit.rotate(face, deg, c)
    return union(handle, face)


def build():
    ic = Icon("pickleball", "Pickleball")
    P = F.Placement(40, 82)
    sh, hd = F.seated(ic, P)
    elbow, hand = (18.8, -29.6), (28.6, -32.0)
    add_arm(ic, P(kit.limb([sh, elbow, hand], 7.2, 4.6)), body_zone(P), "arm")
    ic.add(P(union(paddle(hand, -62), circle(*hand, 3.4))), group="pad", merge="body")   # wrist: one mass with the arm
    dur = 2.8
    T_HIT, T_FAR, T_BACK = 14.0, 50.0, 58.0
    ic.motion(Motion("arm", [(0, "none"), (8, rz(5)), (T_HIT, rz(-6)), (34, "none"), (100, "none")],
                     pivot=P.pt(sh), dur=dur))
    # the wrist: the face cocks back, then pushes up and through under the ball (a soft lift)
    ic.motion(Motion("pad", [(0, "none"), (8, rz(-10)), (T_HIT, rz(8)), (22, rz(10)), (40, "none"), (100, "none")],
                     pivot=P.pt(hand), dur=dur, parent="arm"))
    # the ball's loop: dinked away at T_HIT in a soft arc (receding: smaller), returned in an arc that
    # lands on the paddle at 100 + T_HIT; the rest pose is the return arc at 100% (full size from there on)
    hit, far = (44.4, -44.4), (68.0, -43.0)
    u0 = (100 - T_BACK) / (100 + T_HIT - T_BACK)
    out = arc_frames(hit, far, 15.0, 6, T_HIT, T_FAR)
    back = arc_frames(far, hit, 9.0, 10, T_BACK, 100 + T_HIT)
    rest = (far[0] + (hit[0] - far[0]) * u0, far[1] + (hit[1] - far[1]) * u0 - 4 * 9.0 * u0 * (1 - u0))
    ic.add(P(wiffle(rest, 3.6)), group="ball")
    small = 0.6

    def at(pct, x, y, sc):
        return (pct, f"translate({fmt((x - rest[0]) * P.s)}px,{fmt((y - rest[1]) * P.s)}px) scale({fmt(sc)})")
    fr = [at(0, *rest, 1.0)]
    fr += [at(pct - 100, x, y, 1.0) for pct, (x, y) in back if pct > 100]
    fr += [at(pct, x, y, 1 - (1 - small) * (pct - T_HIT) / (T_FAR - T_HIT)) for pct, (x, y) in out[1:]]
    fr += [at(pct, x, y, min(1.0, small + (1 - small) * (pct - T_BACK) / (100 - T_BACK))) for pct, (x, y) in back if pct < 100]
    fr.append(at(100, *rest, 1.0))
    ic.motion(Motion("ball", fr, pivot=P.pt(rest), dur=dur, ease="linear"))
    return settle(ic)
