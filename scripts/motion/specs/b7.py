import math, sys
import swing3d
SPECS = []
def tl(x, y, extra=""): return f"translate({x:.2f}px,{y:.2f}px)" + extra
def rot(v): return f"rotate({v:.3f}deg)"
def sm(ctrl, fmt, ts): return swing3d.smooth_keys(ctrl, fmt, ts)
T = swing3d.times((0, 100, .5))
H = swing3d._hermite

def burst(dx, dy, beats, dist=9):
    """A ray pops out along its own direction and fades, then is back in place for the next beat."""
    n = math.hypot(dx, dy); ux, uy = dx / n * dist, dy / n * dist
    k = [(0, tl(0, 0, "; opacity: 1"), "lin")]
    for b in beats:
        k += [(b - 1, tl(0, 0, "; opacity: 1"), "out"), (b + 9, tl(ux, uy, "; opacity: 0"), "lin"), (b + 10, tl(-ux * .3, -uy * .3, "; opacity: 0"), "out"), (b + 17, tl(0, 0, "; opacity: 1"), "lin")]
    return sorted(k + [(100, tl(0, 0, "; opacity: 1"), None)], key=lambda r: r[0])

# ---------------------------------------------------------------- grant
GR_DOC = (335, 100)
_pump = [(0, 0), (8, 0), (16, -11), (24, 4), (34, -11), (42, 4), (52, 0), (100, 0)]
SPECS.append({
  "key": "grant", "label": "Grant", "dur": 3000,
  "note": "The win: the grant goes up in one hand and gets a shake, the other fist pumps twice, and the rays burst out around the page on each beat.",
  "tree": [("p", [i for i in sorted(__import__("mv").load("grant")) if i not in (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)]),
           ("g", "up", [("p", [13, 14, 15]), ("g", "head", [("p", [12])]),
                        ("g", "fist", [("p", [9])]),
                        ("g", "doc", [("p", [0, 2, 3, 6, 7, 10, 11])])]),
           ("g", "r1", [("p", [1])]), ("g", "r4", [("p", [4])]), ("g", "r5", [("p", [5])]), ("g", "r8", [("p", [8])])],
  "origins": {"up": (200, 300), "head": (205, 210), "fist": (160, 246), "doc": (251, 240)},
  "keys": {
    "up":   sm([(0, 0), (8, 0), (16, -5), (24, 0), (34, -5), (42, 0), (52, 0), (100, 0)], lambda v: tl(0, v), T),
    "head": sm([(0, 0), (16, -2), (24, 1), (34, -2), (42, 1), (52, 0), (100, 0)], rot, T),
    "fist": sm(_pump, rot, T),
    "doc":  sm([(0, 0), (8, 0), (14, 5), (20, -4), (26, 4), (32, -4), (38, 3), (46, 0), (100, 0)], rot, T),
    "r1": burst(279.1 - GR_DOC[0], 49.2 - GR_DOC[1], (14, 32)), "r4": burst(257.5 - GR_DOC[0], 71.7 - GR_DOC[1], (15, 33)),
    "r5": burst(421.9 - GR_DOC[0], 85.6 - GR_DOC[1], (14, 32)), "r8": burst(426.7 - GR_DOC[0], 121.8 - GR_DOC[1], (15, 33)),
  },
})

# ---------------------------------------------------------------- event
EV_HI = (179, 212)
SPECS.append({
  "key": "event", "label": "Event", "dur": 3400,
  "note": "A good day out: the high five lands twice with a burst, a friend behind waves, and the flag sways by the tent.",
  "also": "The two high-fiving arms are one shape where the hands meet, so they meet and push together.",
  "tree": [("p", [i for i in sorted(__import__("mv").load("event")) if i not in (1, 3, 7, 10, 11, 12, 15, 17, 19)]),
           ("g", "five", [("p", [19])]), ("g", "wave", [("p", [7])]), ("g", "flag", [("p", [1, 3])]),
           ("g", "b10", [("p", [10])]), ("g", "b11", [("p", [11])]), ("g", "b12", [("p", [12])]), ("g", "b15", [("p", [15])]), ("g", "b17", [("p", [17])])],
  "origins": {"five": (180, 300), "wave": (237, 196), "flag": (445, 226)},
  "keys": {
    "five": sm([(0, 0), (10, 4), (16, -3), (22, 0), (40, 4), (46, -3), (52, 0), (100, 0)], lambda v: tl(0, v), T),
    "wave": sm([(0, 0), (20, 0), (28, -14), (36, 6), (44, -12), (52, 5), (62, 0), (100, 0)], rot, T),
    "flag": sm([(0, 0), (12, 2), (32, -2.5), (52, 2), (72, -2), (90, .5), (100, 0)], rot, T),
    "b10": burst(168.6 - EV_HI[0], 183.8 - EV_HI[1], (16, 46)), "b11": burst(190.0 - EV_HI[0], 190.4 - EV_HI[1], (16, 46)),
    "b12": burst(154.3 - EV_HI[0], 194.5 - EV_HI[1], (16, 46)), "b15": burst(202.1 - EV_HI[0], 202.8 - EV_HI[1], (16, 46)),
    "b17": burst(149.8 - EV_HI[0], 211.9 - EV_HI[1], (16, 46)),
  },
})
