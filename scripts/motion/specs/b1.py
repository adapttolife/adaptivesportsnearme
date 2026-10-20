# Batch 1: the rest of the home page's sport tiles, plus cycling from the banner.
SPECS = []

SPECS.append({
  "key": "soccer", "label": "Soccer", "dur": 2000,
  "note": "Power soccer: the chair backs up, drives in, and the guard strikes the ball, which rolls out and comes back to the guard.",
  "tree": [("g", "chair", [("p", [7, 5, 9, 15, 1, 8, 6, 10, 3]), ("g", "head", [("p", [0])]), ("g", "arm", [("p", [2])]), ("g", "stick", [("p", [4])])]),
           ("g", "ball", [("g", "roll", [("p", [11])])])],
  "origins": {"head": (202, 142), "arm": (190, 163), "stick": (275, 247), "roll": (437.6, 380.6)},
  "keys": {
    "chair": [(0, "translate(0,0)", "io"), (18, "translate(-10px,0)", "in"), (30, "translate(1px,0)", "out"), (40, "translate(12px,0)", "io"), (72, "translate(0,0)", "io"), (100, "translate(0,0)", None)],
    "ball":  [("0%, 30%", "translate(0,0)", "out"), (58, "translate(78px,0)", "io"), (100, "translate(0,0)", None)],
    "roll":  [("0%, 30%", "rotate(0deg)", "out"), (58, "rotate(101deg)", "io"), (100, "rotate(0deg)", None)],
    "head":  [(0, "rotate(0deg)", "io"), (18, "rotate(2deg)", "io"), (32, "rotate(-3deg)", "io"), (44, "rotate(3deg)", "io"), (64, "rotate(-1deg)", "io"), (100, "rotate(0deg)", None)],
    "arm":   [(0, "rotate(0deg)", "io"), (16, "rotate(-4deg)", "io"), (30, "rotate(5deg)", "io"), (60, "rotate(0deg)", "io"), (100, "rotate(0deg)", None)],
    "stick": [(0, "rotate(0deg)", "io"), (16, "rotate(-14deg)", "io"), (30, "rotate(16deg)", "io"), (60, "rotate(0deg)", "io"), (100, "rotate(0deg)", None)],
  },
})

SPECS.append({
  "key": "baseball", "label": "Baseball", "dur": 2100,
  "note": "The swing: the bat loads back, whips around the hands and meets the ball, which flies off; the next pitch comes in as the bat resets.",
  "also": "In the drawing the arm and bat are one shape. The fist is a round knob, so the bat turns on it like a ball joint and stays rigid.",
  "tree": [("p", [6]), ("g", "wheel", [("p", [7])]),
           ("g", "body", [("p", [5]), ("p", [3]), ("g", "arm", [("joint", "bat", 0, {"pivot": (358.9, 190.1), "r": 17.6, "a0": -140, "a1": -76, "cap": True})])]),
           ("g", "ball", [("g", "spin", [("p", [1, 2, 4])])])],
  "origins": {"body": (175, 300), "arm": (249.5, 235.6), "wheel": (179.5, 381.4), "spin": (416, 146.5), "bat": (358.9, 190.1)},
  "keys": {
    "bat-cap": [(0, "none; opacity: 0", "lin"), (4, "none; opacity: 1", "lin"), (95, "none; opacity: 1", "lin"), (100, "none; opacity: 0", None)],
    "bat":   [(0, "rotate(0deg)", "io"), (18, "rotate(-12deg)", "whip"), (28, "rotate(80deg)", "lin"), (31, "rotate(108deg)", "out"), (40, "rotate(126deg)", "io"), (50, "rotate(128deg)", "io"), (82, "rotate(-3deg)", "io"), (100, "rotate(0deg)", None)],
    "arm":   [(0, "rotate(0deg)", "io"), (18, "rotate(-4deg)", "in"), (30, "rotate(8deg)", "out"), (48, "rotate(9deg)", "io"), (80, "rotate(0deg)", "io"), (100, "rotate(0deg)", None)],
    "body":  [(0, "rotate(0deg)", "io"), (18, "rotate(2deg)", "in"), (30, "rotate(-4deg)", "out"), (50, "rotate(-4deg)", "io"), (82, "rotate(.5deg)", "io"), (100, "rotate(0deg)", None)],
    "wheel": [(0, "rotate(0deg)", "io"), (18, "rotate(-3deg)", "io"), (32, "rotate(3deg)", "io"), (60, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "ball":  [("0%, 28%", "translate(0,0); opacity: 1", "rise"), (46, "translate(130px,-95px); opacity: 0", "lin"), (70, "translate(150px,18px); opacity: 0", "lin"),
              (73, "translate(132px,15px); opacity: 1", "out"), (100, "translate(0,0); opacity: 1", None)],
    "spin":  [("0%, 28%", "rotate(0deg)", "rise"), (46, "rotate(-540deg)", "lin"), (73, "rotate(-560deg)", "out"), (100, "rotate(-720deg)", None)],
  },
})

SPECS.append({
  "key": "equestrian", "label": "Horseback riding", "dur": 2400,
  "note": "The walk: the horse nods twice, its head turning at the bit so the reins stay in hand, and the whole figure moves in a gentle rhythm.",
  "also": "Same drawing for equestrian vaulting and equine therapy.",
  "tree": [("g", "all", [("p", [3, 5]), ("g", "wheel", [("p", [8])]), ("g", "rider", [("p", [0, 1])]),
                         ("g", "neck", [("p", [4])]), ("g", "head", [("p", [2, 6, 7])])])],
  "origins": {"head": (426, 283), "neck": (300, 300), "wheel": (142.6, 378.4), "rider": (170, 150)},
  "keys": {
    "all":   [(0, "translate(0,0)", "io"), (25, "translate(0,-3px)", "io"), (50, "translate(0,0)", "io"), (75, "translate(0,-3px)", "io"), (100, "translate(0,0)", None)],
    "head":  [(0, "rotate(0deg)", "io"), (20, "rotate(8deg)", "io"), (45, "rotate(-3deg)", "io"), (70, "rotate(8deg)", "io"), (92, "rotate(-1.5deg)", "io"), (100, "rotate(0deg)", None)],
    "neck":  [(0, "rotate(0deg)", "io"), (20, "rotate(1.6deg)", "io"), (45, "rotate(-.8deg)", "io"), (70, "rotate(1.6deg)", "io"), (100, "rotate(0deg)", None)],
    "rider": [(0, "translate(0,0)", "io"), (28, "translate(0,-2px)", "io"), (53, "translate(0,0)", "io"), (78, "translate(0,-2px)", "io"), (100, "translate(0,0)", None)],
    "wheel": [(0, "rotate(0deg)", "io"), (50, "rotate(5deg)", "io"), (100, "rotate(0deg)", None)],
  },
})

SPECS.append({
  "key": "skiing", "label": "Skiing", "dur": 2000,
  "note": "A carved turn: the skier leans and glides down the slope while the right outrigger lifts, reaches and plants.",
  "tree": [("g", "skier", [("p", [3, 5, 6, 7, 9, 10]), ("g", "head", [("p", [0, 1, 2])]), ("g", "rarm", [("p", [4, 11])])])],
  "origins": {"skier": (263, 400), "head": (300, 165), "rarm": (310, 184)},
  "keys": {
    "skier": [(0, "translate(0,0) rotate(0deg)", "io"), (25, "translate(-4px,-1px) rotate(-3deg)", "io"), (55, "translate(8px,3px) rotate(3deg)", "io"), (80, "translate(1px,0) rotate(-.5deg)", "io"), (100, "translate(0,0) rotate(0deg)", None)],
    "rarm":  [(0, "rotate(0deg)", "io"), (20, "rotate(-12deg)", "io"), (40, "rotate(4deg)", "out"), (62, "rotate(0deg)", "io"), (100, "rotate(0deg)", None)],
    "head":  [(0, "rotate(0deg)", "io"), (25, "rotate(-2deg)", "io"), (55, "rotate(2deg)", "io"), (100, "rotate(0deg)", None)],
  },
})

SPECS.append({
  "key": "sledhockey", "label": "Sled hockey", "dur": 1900, "viewBox": "16 92 480 330",
  "note": "The shot: the stick winds back and swings through the puck, which slides out and rebounds back as the sled glides.",
  "tree": [("g", "sled", [("p", [2, 5, 6]), ("g", "head", [("p", [0, 1, 3])]), ("g", "rarm", [("p", [4])])]),
           ("g", "puck", [("p", [10])])],
  "origins": {"rarm": (318.6, 223.1), "head": (310, 205)},
  "keys": {
    "rarm": [(0, "rotate(0deg)", "io"), (20, "rotate(-14deg)", "whip"), (31, "rotate(6deg)", "snap"), (46, "rotate(8deg)", "io"), (80, "rotate(0deg)", "io"), (100, "rotate(0deg)", None)],
    "puck": [("0%, 28%", "translate(0,0)", "out"), (56, "translate(90px,0)", "io"), (100, "translate(0,0)", None)],
    "sled": [(0, "translate(0,0)", "io"), (20, "translate(-4px,0)", "io"), (36, "translate(6px,0)", "io"), (70, "translate(0,0)", None), (100, "translate(0,0)", None)],
    "head": [(0, "rotate(0deg)", "io"), (20, "rotate(-2deg)", "io"), (34, "rotate(2deg)", "io"), (70, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
  },
})

# Cycling: the orange crank piece runs from the handle ring to the front hub. It rocks at
# the hub (two strokes) while the handle circles inside the ring; the arm follows the ring.
HUB = (411, 291)
def _stroke_keys(amp):
    rows = []
    for k in range(0, 17):
        f = k / 16
        rows.append((round(f * 100, 2), f"rotate({amp * math.sin(2 * math.tau * f):.2f}deg)", "lin" if k < 16 else None))
    return rows
import math
import meval, swing3d
# Redone (Alec 10/16: "The hands and the wheel should be the only things that end up moving").
# The crank hub is where the pointer's bulb and the ring's inner circle meet. The hand turns
# the crank twice and the front wheel spins with it; head, body, legs and frame hold still.
# The arm is drawn reaching all the way to the crank, so the hand rides a smaller copy of
# the crank circle (same direction, same timing) that its arm can follow without stretching.
CY_C, CY_W, CY_H, CY_K = (304.15, 233.4), (411.09, 290.69), (288.7, 206.5), .3
CY_T = swing3d.times((0, 100, .5))
_cy = swing3d._hermite([(0, 0), (14, 48), (80, 620), (100, 720)])
def _cy_hand(t):
    a = math.radians(_cy(t)); vx, vy = CY_H[0] - CY_C[0], CY_H[1] - CY_C[1]
    rx, ry = vx * math.cos(a) - vy * math.sin(a), vx * math.sin(a) + vy * math.cos(a)
    return [round(t / 100, 4), 0, round(CY_K * (rx - vx), 3), round(CY_K * (ry - vy), 3)]
SPECS.append({
  "key": "cycling", "label": "Cycling", "dur": 2400, "viewBox": "16 122 480 262",
  "note": "Handcycling: the hands turn the crank two full turns and the front wheel spins with them, while the rider holds still.",
  "also": "Same drawing for handcycling. The arm is drawn reaching all the way to the crank, so the hand turns a smaller circle in time with it.",
  "tree": [("p", [0, 2, 3, 6, 7, 8]), ("bend", "arm", 1), ("g", "pointer", [("p", [4])]), ("g", "wheel", [("p", [5])])],
  "origins": {"pointer": CY_C, "wheel": CY_W},
  "bends": {"arm": {"pivot": (190, 232), "cut_a": (198.5, 212.1), "cut_b": (185.1, 251.6), "hand": (287, 207), "ramp": 100, "lin": True,
                    "keys": [_cy_hand(t) for t in CY_T]}},
  "keys": {
    "pointer": [(t, f"rotate({_cy(t):.3f}deg)", "lin") for t in CY_T],
    "wheel":   [(t, f"rotate({1.5 * _cy(t):.3f}deg)", "lin") for t in CY_T],
  },
})
