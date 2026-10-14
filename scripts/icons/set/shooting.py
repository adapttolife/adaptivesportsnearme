import kit
from kit import Icon, Motion, circle, union, brush, rrect, poly, add
import figure as F
from set import _props as B

YT = -34.0          # top line of the rifle, one gap under the head


def rifle():
    """Target rifle, butt at the shoulder: wedge stock, forend, barrel, aperture sight at the eye, front sight."""
    stock = brush([(16.9, -30.6), (19.6, -31.5), (22.4, -32.2)], [6.4, 4.8, 3.6], ("round", "flat"))
    fore = rrect(21.4, YT, 16.0, 3.4, 1.0)
    barrel = rrect(36.6, YT + 0.35, 23.0, 1.7, 0.6)
    rear = rrect(23.6, YT - 6.8, 3.0, 7.2, 0.8)
    front = rrect(56.8, YT - 2.2, 2.6, 2.6, 0.5)
    return union(stock, fore, barrel, rear, front)


def build():
    ic = Icon("shooting", "Shooting sports")
    P = F.Placement(40, 80)
    ic.add(P(F.body()), group="ub", merge="body")
    ic.add(P(F.wheel()))
    ic.add(P(F.leg()), cls="a")
    ic.add(P(F.head(F.HEAD)), group="ub")
    # support arm: down to the elbow, up under the forend
    R = (8.6, -29.4)
    E0 = (17.6, -22.4)
    H0 = (29.0, -27.4)
    ic.add(P(union(brush([R, kit.lerp(R, E0, 0.5), E0], [7.0, 6.4, 5.8], ("round", "round")),
                   brush([E0, kit.lerp(E0, H0, 0.5), H0], [5.8, 5.2, 4.6], ("round", "round")), circle(*H0, 3.2))),
           group="arm", merge="body")
    ic.add(P(rifle()), group="rf")
    muzzle = (60.6, YT + 1.2)
    lines = B.burst(add(muzzle, (-7.6, 0.0)), 0.0, n=3, r0=1.0, r1=7.4, spread=40.0, w=1.8)
    ic.add(P(lines), group="mz", gap=False)
    clip = poly([P.pt((muzzle[0] + 1.6, -80)), P.pt((120, -80)), P.pt((120, 40)), P.pt((muzzle[0] + 1.6, 40))])

    dur = 2.6
    # steady aim with a slow breath, the shot, the kick, settle
    breath = B.spline([(0, 0), (0.22, -0.6), (0.44, 0.4), (0.58, 0), (0.60, 0), (0.70, -1.4), (0.88, 0.2), (1, 0)])
    kick_r = B.spline([(0, 0), (0.60, 0), (0.615, -5.0), (0.66, -3.8), (0.78, -0.7), (0.90, 0), (1, 0)])
    kick_x = B.spline([(0, 0), (0.60, 0), (0.615, -0.7), (0.66, -0.55), (0.78, -0.1), (0.90, 0), (1, 0)])
    ts = B.times([[(0.22,), (0.44,), (0.58,), (0.60,), (0.615,), (0.66,), (0.70,), (0.78,), (0.88,), (0.90,)]], 24)
    ic.motion(Motion("ub", B.sampled(lambda t: B.rot_css(breath(t)), ts), pivot=P.pt(F.HIP), dur=dur, ease="linear"))
    ic.motion(Motion("arm", B.sampled(lambda t: B.rot_css(kick_r(t) * 0.5), ts), pivot=P.pt(R), dur=dur, ease="linear",
                     parent="ub"))
    ic.motion(Motion("rf", B.sampled(lambda t: f"translate({kick_x(t):.2f}px,0px) rotate({kick_r(t):.2f}deg)", ts),
                     pivot=P.pt((16.9, -30.6)), dur=dur, ease="linear", parent="ub"))
    ic.motion(Motion("mz", [(0, "transform:none;opacity:1"), (60, "transform:none;opacity:1"),
                            (62, "transform:translate(7.2px,0px);opacity:1"), (68, "transform:translate(9.6px,0px);opacity:.9"),
                            (76, "transform:translate(12px,0px);opacity:0"),
                            (77, "transform:none;opacity:0"), (100, "transform:none;opacity:1")],
                     pivot=P.pt(muzzle), dur=dur, ease="linear", clip=clip))
    return ic.finish()
