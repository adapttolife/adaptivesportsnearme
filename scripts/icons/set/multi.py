import kit
from kit import Icon, Motion, circle, union, brush, polar
import figure as F
from set import _props as B


def build():
    ic = Icon("multi", "Multi-sport")
    P = F.Placement(40, 80)
    sh, hd = F.seated(ic, P)
    # raised arm: forward to the elbow, up to the hand (clear of the head)
    R = (8.0, -30.4)
    E = (25.0, -30.8)
    H = (29.4, -45.6)
    ic.add(P(union(brush([R, kit.lerp(R, E, 0.5), E], [7.2, 6.6, 6.0], ("round", "round")),
                   brush([E, kit.lerp(E, H, 0.5), H], [6.0, 5.3, 4.6], ("round", "round")), circle(*H, 3.4))),
           group="arm", merge="body", gap=False)      # one mass with the body; crosses nothing
    # three balls orbiting a point above the hand
    Rb = 7.7
    C = (H[0] + 0.8, H[1] - 3.4 - kit.GAP - 5.5 - Rb)
    balls = [("b1", -90.0, 5.2, B.basketball), ("b2", 30.0, 3.9, B.tennis_ball), ("b3", 150.0, 5.0, B.soccer_ball)]
    for name, a, r, draw in balls:
        c = polar(C, Rb, a)
        ic.add(P(draw(c, r)), group=name)
    dur = 3.2
    pump = [(0, "none"), (25, "rotate(2.5deg)"), (50, "none"), (75, "rotate(2.5deg)"), (100, "none")]
    ic.motion(Motion("arm", pump, pivot=P.pt(R), dur=dur))
    ic.motion(Motion("orb", [(0, "none"), (100, "rotate(360deg)")], pivot=P.pt(C), dur=dur, ease="linear",
                     parent="arm"))
    for name, a, r, draw in balls:
        ic.motion(Motion(name, [(0, "none"), (100, "rotate(-360deg)")], pivot=P.pt(polar(C, Rb, a)), dur=dur,
                         ease="linear", parent="orb"))
    return ic.finish()
