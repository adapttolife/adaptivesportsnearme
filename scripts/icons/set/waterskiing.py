import kit
from kit import Icon, Motion, union, brush, circle
import figure as F
from set import _water as C


def ski(x0, x1, y, w=3.6, tip=7.0):
    """Water ski seen from the side: a long plank whose front end curls up to a rounded tip."""
    L = x1 - x0
    pts = [(x0, y), (x0 + L * 0.5, y), (x1 - tip * 1.3, y - 0.3), (x1 - tip * 0.4, y - tip * 0.5), (x1, y - tip)]
    return brush(pts, [w * 0.85, w, w, w * 0.85, w * 0.6], ("round", "round"))


LEAN = -10                 # leaning back against the pull of the rope
SKI_Y, SKI = 12.4, (-12, 66)
HAND = (28.0, -28.0)
ROPE_END = 74.0            # the rope tapers away to a point well inside the frame
DUR = 2.4


def build():
    ic = Icon("waterskiing", "Water skiing")
    P = F.Placement(40, 80)
    # water under the ski
    ic.add(P(union(F.wave(SKI[0] - 6, SKI[1] + 4, SKI_Y + 9.5, amp=1.8, crests=2.25, w=4.6, phase=0.2),
                   F.wave(SKI[0] + 8, SKI[1] - 12, SKI_Y + 18.5, amp=1.6, crests=1.75, w=3.8, phase=2.0))), group="w")
    # sit-ski: a seat post and a front strut on one ski; the logo athlete sits on it, legs out to the ski tip
    sh, hd = F.upper(LEAN)
    ic.add(P(union(brush([(2.0, -4.0), (3.5, 10.5)], [3.2, 3.2], ("round", "round")),
                   brush([(3.0, -3.0), (16.0, 10.5)], [2.6, 2.6], ("round", "round")))), group="sk")
    ic.add(P(ski(SKI[0], SKI[1], SKI_Y)), group="sk")
    ic.add(P(F.body(LEAN)), merge="body", group="sk")
    ic.add(P(kit.rotate(F.leg(), -14, F.HIP)), cls="a", group="sk")      # the logo's leg, raised to rest on the ski
    ic.add(P(F.head(hd)), group="sk")
    up, fo = C.arm2(sh, C.elbow(sh, HAND, 11.5, 11.0), HAND)
    ic.add(P(up), merge="body", group="sk")
    ic.add(P(fo), merge="body", group="sk")
    # tow handle: a V bridle out of the fist, then the rope tapering away to the right
    hx, hy = HAND
    apex = (hx + 10.0, hy)
    bridle = union(kit.outline([(hx + 0.8, hy - 2.6), (hx + 3.2, hy - 4.2), apex], 1.0),
                   kit.outline([(hx + 0.8, hy + 2.6), (hx + 3.2, hy + 4.2), apex], 1.0))
    rope = brush([apex, ((apex[0] + ROPE_END) / 2, hy + 0.3), (ROPE_END, hy + 0.5)], [1.2, 1.0, 0.0], ("round", "point"))
    ic.add(P(union(bridle, rope)), group="sk", gap=False)
    # spray kicked up behind the ski
    tx = SKI[0]
    sp = union(F.swoosh([(tx - 4.6, SKI_Y - 1.8), (tx - 8.2, SKI_Y - 5.6), (tx - 11.0, SKI_Y - 12.5)], 3.0),
               F.swoosh([(tx - 5.0, SKI_Y + 1.6), (tx - 10.0, SKI_Y + 0.0), (tx - 16.0, SKI_Y - 5.0)], 2.5),
               circle(tx - 14.5, SKI_Y - 12.5, 1.5), circle(tx - 18.5, SKI_Y - 7.5, 1.2))
    ic.add(P(sp), group="sp")
    # over the wake: the nose lifts, a short hop, a landing that throws the spray again
    lift = "animation-timing-function:cubic-bezier(.3,0,.5,1)"
    ic.motion(Motion("sk", [(0, f"transform:none;{lift}"), (30, "transform:translateY(-2.6px) rotate(-3deg)"),
                            (50, "transform:translateY(-2.2px) rotate(-.5deg);animation-timing-function:cubic-bezier(.5,0,.8,.6)"),
                            (60, "transform:translateY(.6px) rotate(1.2deg)"), (74, "transform:translateY(-.3px) rotate(-.4deg)"),
                            (100, "transform:none")], pivot=P.pt((26, SKI_Y + 2)), dur=DUR))
    ic.motion(Motion("sp", [(0, "transform:none;opacity:1"), (22, "transform:translate(-2px,1px);opacity:0"),
                            (58, "transform:translate(3px,3px) scale(.6);opacity:0"),
                            (70, "transform:translate(-1px,-1px);opacity:1"), (100, "transform:none;opacity:1")],
                     pivot=P.pt((SKI[0] + 2, SKI_Y)), dur=DUR))
    ic.motion(Motion("w", [(0, "none"), (50, "translate(-2.4px,0px)"), (100, "none")], pivot=P.pt((0, SKI_Y + 9)), dur=DUR))
    return ic.settle()
