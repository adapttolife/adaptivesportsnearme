import math, sys
import meval, swing3d
SPECS = []

def merge(*lists):
    seen = {}
    for lst in lists:
        for row in lst: seen[round(float(row[0]), 3)] = row
    return [seen[t] for t in sorted(seen)]

def _op(t, a, b, t0, t1):
    return a if t <= t0 else b if t >= t1 else a + (b - a) * (t - t0) / (t1 - t0)

def tl(x, y, extra=""): return f"translate({x:.2f}px,{y:.2f}px)" + extra
def rot(v): return f"rotate({v:.3f}deg)"
def sm(ctrl, fmt, ts): return swing3d.smooth_keys(ctrl, fmt, ts)
def T(step=.5): return swing3d.times((0, 100, step))

def _R(p, c, a):
    a = math.radians(a); x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))

# ---------------------------------------------------------------- paddling (the "rowing" drawing is a kayak)
RW_T = T()
SPECS.append({
  "key": "rowing", "label": "Paddling", "dur": 2200,
  "note": "Two strokes: the paddle plants, the blade pulls back through the water and lifts out as the other end drops, and the kayak surges forward on each pull.",
  "also": "The paddle turns with the arms, so the hands never leave the shaft.",
  "tree": [("g", "wave", [("p", [7])]),
           ("g", "boat", [("p", [6, 4]), ("g", "body", [("p", [1, 3]), ("g", "paddle", [("p", [0, 5, 2])])])])],
  "origins": {"boat": (293, 342), "body": (215, 300), "paddle": (250, 232), "wave": (250, 391)},
  "keys": {
    "paddle": sm([(0, 0), (8, -8), (30, 16), (50, -8), (72, 16), (92, 0), (100, 0)], rot, RW_T),
    "body":   sm([(0, 0), (8, -1.5), (30, 2.5), (50, -1.5), (72, 2.5), (92, 0), (100, 0)], rot, RW_T),
    "boat":   [(t, f"translate({x:.2f}px,{y:.2f}px) rotate({a:.3f}deg)", "lin") for t, x, y, a in
               [(t, swing3d._hermite([(0, 0), (10, 0), (30, 6), (52, 2), (74, 8), (100, 0)])(t), swing3d._hermite([(0, 0), (20, -2), (40, 1), (62, -2), (82, 1), (100, 0)])(t),
                 swing3d._hermite([(0, 0), (20, -.8), (40, .6), (62, -.8), (82, .5), (100, 0)])(t)) for t in RW_T]],
    "wave":   sm([(0, 0), (30, -14), (52, -8), (74, -20), (100, 0)], lambda v: tl(v, 0), RW_T),
  },
})

# ---------------------------------------------------------------- sailing
SL_T = T()
SPECS.append({
  "key": "sailing", "label": "Sailing", "dur": 3200,
  "note": "A gust: the boat rides the swell, heels as the wind fills the sail, the sailor leans out against it, and she settles back level.",
  "also": "The mast, the mainsheet and the sailor's arm are one shape, so they move with the boat together.",
  "tree": [("g", "water", [("p", [8])]),
           ("g", "boat", [("p", [0, 5, 6, 7]), ("g", "sail", [("p", [1])]), ("g", "sailor", [("p", [2, 3, 4])])])],
  "origins": {"boat": (270, 420), "sail": (316, 360), "sailor": (205, 372), "water": (244, 450)},
  "keys": {
    "boat":   [(t, f"translate(0px,{swing3d._hermite([(0, 0), (14, -5), (30, 2), (46, -6), (62, 2), (80, -4), (100, 0)])(t):.2f}px) rotate({swing3d._hermite([(0, 0), (14, -1.2), (32, 4.5), (52, 5), (72, -.8), (88, .4), (100, 0)])(t):.3f}deg)", "lin") for t in SL_T],
    "sail":   sm([(0, 1), (24, 1), (34, 1.06), (54, 1.07), (70, 1), (100, 1)], lambda v: f"scale({v:.4f},1)", SL_T),
    "sailor": sm([(0, 0), (24, 0), (36, -4), (56, -4.5), (74, 0), (100, 0)], rot, SL_T),
    "water":  sm([(0, 0), (16, -10), (34, 6), (52, -12), (70, 5), (86, -6), (100, 0)], lambda v: tl(v, 0), SL_T),
  },
})

# ---------------------------------------------------------------- waterskiing
WS_T = T()
_bob = swing3d._hermite([(0, 0), (14, -3), (28, 1), (40, 2), (50, -9), (58, -10), (66, 2), (74, -1), (86, .5), (100, 0)])
_tilt = swing3d._hermite([(0, 0), (14, .8), (28, -.6), (40, .8), (50, -4), (60, -4.4), (68, 1), (80, -.4), (100, 0)])
SPECS.append({
  "key": "waterskiing", "label": "Waterskiing", "dur": 2400,
  "note": "Cutting the wake: the ski rides the chop on a taut rope, leans back into a cut, lifts over the wake throwing spray, and lands smooth.",
  "tree": [("g", "wave", [("p", [7])]), ("g", "spray", [("p", [6])]),
           ("g", "rider", [("p", [0, 1, 2, 3, 4, 5])])],
  "origins": {"rider": (360, 335), "spray": (246, 356), "wave": (208, 371)},
  "keys": {
    "rider": [(t, f"translate(0px,{_bob(t):.2f}px) rotate({_tilt(t):.3f}deg)", "lin") for t in WS_T],
    "spray": sm([(0, 1), (14, .92), (28, 1.04), (40, .96), (54, 1.3), (66, 1.08), (80, .97), (100, 1)], lambda v: f"scale({v:.4f},{1 + (v - 1) * .6:.4f})", WS_T),
    "wave":  sm([(0, 0), (20, -10), (44, 4), (66, -12), (100, 0)], lambda v: tl(v, 0), WS_T),
  },
})

# ---------------------------------------------------------------- nordic skiing
# The push: both arms drive back while each pole turns at the hand so its basket stays on
# the snow (solved per frame), then the poles lift and the arms swing forward to plant again.
NS_T = swing3d.times((0, 100, .5))
NS_HIP, NS_SR, NS_HR, NS_BR, NS_SL, NS_HL, NS_BL, NS_SNOW = (270, 250), (325, 172), (400, 147), (355, 377), (254, 150), (142, 256), (51, 377), 377
_body = swing3d._hermite([(0, 0), (8, -.8), (36, 4), (46, 4.5), (82, 0), (100, 0)])
_armR = swing3d._hermite([(0, 0), (8, -4), (36, 30), (46, 32), (82, 0), (100, 0)])
_armL = swing3d._hermite([(0, 0), (8, -1), (36, 8), (46, 9), (82, 0), (100, 0)])
def _poles(arm, S, H, B, ts):
    """Per frame, the pole turn (about the hand, in the arm's frame) that keeps the basket on
    the snow: the root nearest the last frame's, or the closest reach if the snow is out of reach."""
    out, prev = {}, 0.0
    for t in ts:
        def y(tp):
            b = _R(B, H, tp); b = _R(b, S, arm(t)); return _R(b, NS_HIP, _body(t))[1] - NS_SNOW
        grid = [prev + k * .05 for k in range(-600, 601)]
        vals = [y(g) for g in grid]
        roots = [(abs(g0 - prev), g0, g1) for g0, g1, v0, v1 in zip(grid, grid[1:], vals, vals[1:]) if v0 == 0 or v0 * v1 < 0]
        if roots:
            _, lo, hi = min(roots)
            for _ in range(40):
                m = (lo + hi) / 2
                lo, hi = (m, hi) if y(lo) * y(m) > 0 else (lo, m)
            prev = (lo + hi) / 2
        else:
            prev = min(zip((abs(v) for v in vals), grid))[1]
        out[t] = prev
    return out
_pr = _poles(_armR, NS_SR, NS_HR, NS_BR, [t for t in NS_T if t <= 40])
_plift = swing3d._hermite([(0, 0), (8, 0), (36, 4), (46, 5), (82, 0), (100, 0)])   # the back pole is finishing its push: it lifts off behind
_pl = {t: _plift(t) for t in NS_T if t <= 40}
_liftR = swing3d._hermite([(40, _pr[40]), (48, _pr[40] * .7 - 6), (82, 0), (100, 0)])
_liftL = _plift
SPECS.append({
  "key": "nordicskiing", "label": "Nordic skiing", "dur": 2200,
  "note": "A pole push: the front pole drives back along the snow as the body crunches, the back pole lifts free behind, and both arms swing forward to plant again.",
  "also": "The pushing pole turns at the hand as it goes, so its basket stays on the snow.",
  "tree": [("p", [7, 8, 9, 11, 12, 13, 15, 16, 17]),
           ("g", "body", [("p", [0, 4]),
                          ("g", "armL", [("p", [2]), ("g", "poleL", [("p", [10, 6])])]),
                          ("g", "armR", [("p", [3]), ("g", "poleR", [("p", [5, 1])])])])],
  "origins": {"body": NS_HIP, "armR": NS_SR, "poleR": NS_HR, "armL": NS_SL, "poleL": NS_HL},
  "keys": {
    "body":  [(t, rot(_body(t)), "lin") for t in NS_T],
    "armR":  [(t, rot(_armR(t)), "lin") for t in NS_T],
    "armL":  [(t, rot(_armL(t)), "lin") for t in NS_T],
    "poleR": [(t, rot(_pr[t] if t <= 40 else _liftR(t)), "lin") for t in NS_T],
    "poleL": [(t, rot(_pl[t] if t <= 40 else _liftL(t)), "lin") for t in NS_T],
  },
})

# ---------------------------------------------------------------- climbing
# The reaching arm is drawn into the torso. The body leans out (to look up) and in (to
# pull) about the hips while the arm bends at the shoulder by exactly the opposite turn,
# so the hand never leaves its hold. The free hand reaches for the hold below it.
CL_T = swing3d.times((0, 100, 1))
CL_H, CL_P = (200, 314), (241, 235)
_lean = swing3d._hermite([(0, 0), (14, -3), (34, -3.5), (52, 5), (70, 5.5), (90, 0), (100, 0)])
def _anchor(t):
    a = _lean(t); hx, hy = CL_H[0] - CL_P[0], CL_H[1] - CL_P[1]
    rx, ry = _R((hx, hy), (0, 0), -a)
    return [round(t / 100, 4), round(-a, 4), round(hx - rx, 4), round(hy - ry, 4)]
SPECS.append({
  "key": "climbing", "label": "Climbing", "dur": 2600,
  "note": "Working the wall: leaning out to look up, then pulling in close while the free hand reaches for the next hold; the top hand never lets go.",
  "also": "The reaching arm is part of the body's shape, so it bends at the shoulder, just enough to keep the hand on its hold.",
  "tree": [("p", [0, 2, 3, 6, 8, 9, 10, 11]),
           ("g", "rope", [("p", [1])]),
           ("g", "lean", [("bend", "arm", 4), ("p", [5]), ("g", "free", [("p", [7])])])],
  "origins": {"lean": CL_H, "free": (248, 264), "rope": (217, 38)},
  "bends": {"arm": {"pivot": CL_P, "cut_a": (215.8, 229.3), "cut_b": (266.3, 240.3), "hand": (333, 128), "ramp": 35, "lin": True,
                    "keys": [_anchor(t) for t in CL_T]}},
  "keys": {
    "lean": [(t, rot(_lean(t)), "lin") for t in CL_T],
    "free": sm([(0, 0), (14, -10), (34, -14), (52, -70), (70, -74), (90, 0), (100, 0)], rot, CL_T),
    "rope": sm([(0, 0), (14, 1), (34, 1.2), (52, -1.4), (70, -1.5), (90, 0), (100, 0)], rot, CL_T),
  },
})

# ---------------------------------------------------------------- triathlon
# Swim, bike, run, in turn: each athlete takes its moment while the others hold.
TR_T = swing3d.times((0, 100, .5))
SPECS.append({
  "key": "triathlon", "label": "Triathlon", "dur": 3600,
  "note": "Swim, bike, run, in turn: a freestyle stroke through the waves, the handcycle's front wheel spinning up, then the runner's stride on a blade.",
  "also": "The swimmer's arm is part of the body's shape, so it bends at the shoulder. The front wheel spins one full turn and lands where it started.",
  "tree": [("g", "w1", [("p", [5])]), ("g", "w2", [("p", [8])]), ("g", "swim", [("bend", "arm", 0), ("p", [2])]),
           ("g", "bike", [("p", [7, 9, 10, 12]), ("g", "wheel", [("p", [13])])]),
           ("g", "run", [("p", [1, 3]), ("g", "rarm", [("p", [4])]), ("g", "rleg", [("p", [6])]), ("g", "blade", [("p", [11])])])],
  "origins": {"swim": (170, 180), "wheel": (398.44, 346.02), "bike": (260, 340), "run": (400, 260), "rarm": (436, 192), "rleg": (388, 216), "blade": (432, 253), "w1": (154, 198), "w2": (106, 230)},
  "bends": {"arm": {"pivot": (146, 151), "cut_a": (130.0, 141.4), "cut_b": (148.4, 159.9), "hand": (236, 143), "ramp": 30,
                    "keys": [[0, 0], [.04, -7], [.13, 26], [.22, -9], [.31, 5], [.36, 0], [1, 0]]}},
  "keys": {
    "swim":  sm([(0, 0), (4, -1), (13, 2), (22, -1.5), (31, .5), (36, 0), (100, 0)], lambda v: tl(v * 1.5, v * -.6), TR_T),
    "w1":    sm([(0, 0), (10, -8), (22, 6), (34, -4), (44, 0), (100, 0)], lambda v: tl(v, 0), TR_T),
    "w2":    sm([(0, 0), (12, 7), (24, -6), (36, 4), (46, 0), (100, 0)], lambda v: tl(v, 0), TR_T),
    "wheel": sm([(0, 0), (32, 0), (66, 360), (100, 360)], rot, TR_T),
    "bike":  sm([(0, 0), (32, 0), (40, -2), (48, 1), (56, -2), (64, 1), (70, 0), (100, 0)], lambda v: tl(-v * 1.5, v), TR_T),
    "run":   sm([(0, 0), (64, 0), (70, -6), (76, 0), (82, -6), (88, 0), (94, -3), (100, 0)], lambda v: tl(0, v), TR_T),
    "rarm":  sm([(0, 0), (64, 0), (70, 16), (76, -12), (82, 16), (88, -10), (95, 2), (100, 0)], rot, TR_T),
    "rleg":  sm([(0, 0), (64, 0), (70, -10), (76, 8), (82, -10), (88, 6), (95, -1), (100, 0)], rot, TR_T),
    "blade": sm([(0, 0), (64, 0), (70, 12), (76, -10), (82, 12), (88, -8), (95, 1), (100, 0)], rot, TR_T),
  },
})
