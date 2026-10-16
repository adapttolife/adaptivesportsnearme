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

def tl(x, y, extra=""):
    return f"translate({x:.2f}px,{y:.2f}px)" + extra

def rot(v): return f"rotate({v:.3f}deg)"

BIG = "M-900 -900H1400V1400H-900Z"

# ---------------------------------------------------------------- archery
# The bow, upper string, arrow and drawing arm are ONE shape in the drawing, and the
# bow arm, lower limb and lower string another. They are cut along the drawing's own
# lines (clip paths, nothing redrawn): the arrow off the string and limb, the strings
# off the bow tips, the arm off the limb. At rest the pieces are the original shapes.
xu = lambda y: 345.97 - 0.6136 * y            # upper string centreline (fitted)
xl = lambda y: 263.2 + 0.764 * (y - 276)      # lower string centreline (fitted)
def quad(f, y0, y1, hw):
    return f"M{f(y0) - hw:.2f} {y0}L{f(y0) + hw:.2f} {y0}L{f(y1) + hw:.2f} {y1}L{f(y1) - hw:.2f} {y1}Z"
AR_A = "M231.2 194L381 194L381 200.4L414 200.4L414 190L462 190L462 216L219 216Z"
AR_S = quad(xu, 60, 193.6, 5)
AR_S2 = quad(xl, 266, 357.5, 3.8)
# the moving pieces reach 0.4 units past the cut, so at rest the seam is covered twice
AR_A_OUT = "M230.75 193.6L380.6 193.6L380.6 200L414.4 200L414.4 189.6L462.4 189.6L462.4 216.4L218.55 216.4Z"
AR_S_OUT = quad(xu, 59.6, 194.0, 5)
AR_S2_OUT = quad(xl, 265.6, 357.9, 3.8)
AR_TOP, AR_BOT = (315.3, 50), (328.5, 361.5)          # where each string meets its bow tip
AR_E0, AR_F0 = (227.2, 193.6), (xl(266), 266)         # drawn string ends
AR_NB = (321.66, 200)                                  # the string's nock point at brace (straight)
AR_T = swing3d.times((0, 22, 1), (22, 40, .25), (40, 56, 1), (56, 94, .5), (94, 100, 1))
osc = [(28, 10), (29.5, -6), (31, 3.5), (32.5, -2), (34, 1), (36, 0)]        # the twang
ex = [(0, AR_E0[0]), (20, AR_E0[0]), (24, AR_E0[0] - 1.6), (26.5, AR_E0[0] - 1.6)] + [(t, AR_NB[0] + d) for t, d in osc] + [(60, AR_NB[0]), (86, AR_E0[0]), (100, AR_E0[0])]
ey = [(0, AR_E0[1]), (20, AR_E0[1]), (24, AR_E0[1] - .1), (26.5, AR_E0[1] - .1), (28, AR_NB[1]), (60, AR_NB[1]), (86, AR_E0[1]), (100, AR_E0[1])]
fx = [(0, AR_F0[0]), (26.5, AR_F0[0])] + [(t, AR_NB[0] + d) for t, d in osc] + [(60, AR_NB[0]), (86, AR_F0[0]), (100, AR_F0[0])]
fy = [(0, AR_F0[1]), (26.5, AR_F0[1]), (28, AR_NB[1]), (60, AR_NB[1]), (86, AR_F0[1]), (100, AR_F0[1])]
_str, AR_END = swing3d.segment_keys(AR_TOP, AR_E0, ex, ey, AR_T)
_str2, _ = swing3d.segment_keys(AR_BOT, AR_F0, fx, fy, AR_T)
def _arrow_draw(t):
    x, y = AR_END(t); return tl(x - AR_E0[0], y - AR_E0[1], f"; opacity: {min(1, max(0, (306 - x) / 20)):.3f}")
# the nock rides the string until the string is straight, then the arrow flies on at that speed
AR_REL = next(t / 100 for t in range(2650, 2801) if AR_END(t / 100)[0] >= AR_NB[0])
_p1, _p0 = AR_END(AR_REL), AR_END(AR_REL - .05)
_v = ((_p1[0] - _p0[0]) / .05, (_p1[1] - _p0[1]) / .05)
def _fly(t):
    dt = t - AR_REL; return tl(_p1[0] - AR_E0[0] + _v[0] * dt, _p1[1] - AR_E0[1] + _v[1] * dt * .2, f"; opacity: {_op(t, 1, 0, 30, 32.5):.3f}")
_arrow = merge(
    [(0, tl(0, 0, "; opacity: 1"), "io"), (20, tl(0, 0, "; opacity: 1"), "io"), (24, tl(-1.6, -.1, "; opacity: 1"), "lin")],
    [(t, _arrow_draw(t).split(";")[0] + "; opacity: 1", "lin") for t in AR_T if 26.5 <= t < AR_REL],
    [(round(AR_REL + k * .25, 3), _fly(AR_REL + k * .25), "lin") for k in range(int((33 - AR_REL) / .25) + 1)],
    [(t, _arrow_draw(t), "lin") for t in AR_T if 58 <= t <= 100])
SPECS.append({
  "key": "archery", "label": "Archery", "dur": 2600,
  "note": "The release: the arrow leaves the string, the string snaps straight and twangs, the drawing hand flicks back; then a fresh arrow is drawn back to the anchor.",
  "also": "Bow, string, arrow and arm are joined in the drawing, so they are cut apart along its own lines. At rest the pieces are your shapes exactly.",
  "tree": [("p", [2, 4, 5]),
           ("clip", 3, [(BIG + AR_S2, "evenodd")]),
           ("clip", 0, [("M290 -900H1400V1400H290Z", "nonzero"), (BIG + AR_A + AR_S, "evenodd")]),
           ("g", "arm", [("clip", 0, [("M-900 -900H290V1400H-900Z", "nonzero"), (BIG + AR_A + AR_S, "evenodd")])]),
           ("g", "str", [("clip", 0, [(AR_S_OUT, "nonzero")])]),
           ("g", "str2", [("clip", 3, [(AR_S2_OUT, "nonzero")])]),
           ("g", "arrow", [("clip", 0, [(AR_A_OUT, "nonzero")])])],
  "origins": {"arm": (180, 285), "str": AR_TOP, "str2": AR_BOT},
  "keys": {
    "str": _str, "str2": _str2, "arrow": _arrow,
    "arm": swing3d.smooth_keys([(0, 0), (20, 0), (24, -.8), (26.5, -.8), (29, -6.5), (34, -7), (60, -6), (86, 0), (100, 0)], rot, AR_T),
  },
})

# ---------------------------------------------------------------- shooting
def kick(t0):
    return [(t0, "translate(0,0) rotate(0deg)", "cubic-bezier(.15,.8,.3,1)"), (t0 + 1.6, "translate(-7px,1.2px) rotate(-3.4deg)", "settle")]
SPECS.append({
  "key": "shooting", "label": "Shooting", "dur": 2400,
  "note": "Two shots: the aim settles, the rifle kicks back into the shoulder and the muzzle lifts, then everything comes back on target for the next one.",
  "tree": [("p", [5, 6]),
           ("g", "upper", [("p", [0, 2, 4]), ("g", "support", [("p", [3])]), ("g", "rifle", [("p", [1])])])],
  "origins": {"upper": (140, 280), "support": (215, 212), "rifle": (162, 150)},
  "keys": {
    "rifle":   merge([(0, "translate(0,0) rotate(0deg)", "io"), (12, "translate(0,0) rotate(-.4deg)", "io"), (22, "translate(0,0) rotate(.2deg)", "io")], kick(29),
                     [(47, "translate(0,0) rotate(.25deg)", "io"), (57, "translate(0,0) rotate(-.25deg)", "io")], kick(65), [(84, "translate(0,0) rotate(0deg)", "io"), (100, "translate(0,0) rotate(0deg)", None)]),
    "support": [(0, "rotate(0deg)", "io"), (29, "rotate(0deg)", "cubic-bezier(.15,.8,.3,1)"), (30.6, "rotate(-2.6deg)", "settle"), (47, "rotate(0deg)", "io"),
                (65, "rotate(0deg)", "cubic-bezier(.15,.8,.3,1)"), (66.6, "rotate(-2.6deg)", "settle"), (84, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "upper":   [(0, "rotate(0deg)", "io"), (29, "rotate(0deg)", "cubic-bezier(.15,.8,.3,1)"), (31, "rotate(-1.3deg)", "settle"), (48, "rotate(0deg)", "io"),
                (65, "rotate(0deg)", "cubic-bezier(.15,.8,.3,1)"), (67, "rotate(-1.3deg)", "settle"), (85, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
  },
})

# ---------------------------------------------------------------- fencing
FN_T = swing3d.times((0, 100, .5))
FN_AX = (0.985, -0.17)                                  # along the sword arm
FN_EXT = [(0, 0), (10, -2), (22, 10), (30, 0), (44, -3), (52, 19), (66, 20), (84, 0), (100, 0)]
_ext = swing3d._hermite(FN_EXT); _tip = swing3d._hermite([(0, 0), (44, 0), (52, 2.2), (66, 2.5), (84, 0), (100, 0)])
SPECS.append({
  "key": "fencing", "label": "Fencing", "dur": 2200,
  "note": "A feint, then the lunge: the blade flicks forward and back, then the body drives in behind a full extension, holds the touch, and recovers to guard.",
  "tree": [("p", [5, 6]),
           ("g", "upper", [("p", [3]), ("g", "head", [("p", [0])]), ("g", "arm", [("p", [4, 2, 1])])])],
  "origins": {"upper": (175, 300), "head": (195, 140), "arm": (190, 203)},
  "keys": {
    "upper": swing3d.smooth_keys([(0, 0), (10, -1.5), (22, 1.5), (30, -.6), (44, -1.5), (52, 5), (66, 5.5), (84, 0), (100, 0)], rot, FN_T),
    "head":  swing3d.smooth_keys([(0, 0), (22, -1), (52, -3.5), (66, -3.5), (84, 0), (100, 0)], rot, FN_T),
    "arm":   [(t, f"translate({_ext(t) * FN_AX[0]:.2f}px,{_ext(t) * FN_AX[1]:.2f}px) rotate({_tip(t):.3f}deg)", "lin") for t in FN_T],
  },
})

# ---------------------------------------------------------------- martial arts
MA_T = swing3d.times((0, 100, .5))
MA_AX = (0.976, -0.217)
MA_PULL = [(0, 0), (8, 0), (20, -58), (27, 5), (34, 0), (50, 0), (58, -52), (64, 5), (72, 0), (100, 0)]
_pull = swing3d._hermite(MA_PULL); _drop = swing3d._hermite([(0, 0), (8, 0), (20, 6), (27, -.6), (34, 0), (50, 0), (58, 5), (64, -.6), (72, 0), (100, 0)])
SPECS.append({
  "key": "martialarts", "label": "Martial arts", "dur": 2000,
  "note": "Two punches: the fist pulls back to the chamber and snaps out to full extension, twice, the body turning into each strike.",
  "also": "The punching arm slides back along its own line, so it pulls in behind the shoulder and fires out again.",
  "tree": [("p", [3, 4]), ("g", "upper", [("p", [0]), ("g", "guard", [("p", [1])]), ("g", "punch", [("p", [2])])])],
  "origins": {"upper": (190, 320), "guard": (200, 210), "punch": (235, 190)},
  "keys": {
    "punch": [(t, f"translate({_pull(t) * MA_AX[0]:.2f}px,{_pull(t) * MA_AX[1]:.2f}px) rotate({_drop(t):.3f}deg)", "lin") for t in MA_T],
    "upper": swing3d.smooth_keys([(0, 0), (8, 0), (20, -2.2), (27, 2.2), (36, 0), (50, 0), (58, -2), (64, 2), (74, 0), (100, 0)], rot, MA_T),
    "guard": swing3d.smooth_keys([(0, 0), (8, 0), (20, 3), (27, -4), (36, 0), (50, 0), (58, 3), (64, -4), (74, 0), (100, 0)], rot, MA_T),
  },
})

# ---------------------------------------------------------------- boccia
# The ball in the hand and the ball on the floor look alike. The floor ball is cleared
# while the arm swings back, the thrown ball lands and rolls into exactly its place, and
# near the end the two swap in place (turned so their seams line up best) while the next
# ball appears in the hand.
BC_T = swing3d.times((0, 100, .5))
BC_HAND, BC_FLOOR, BC_R = (393.98, 301.63), (420.25, 391.18), 24.5
BC_ARM = [(0, 0), (8, 0), (24, 20), (34, -6), (38, -12), (46, -10), (68, 0), (100, 0)]
bc = {
  "key": "boccia", "label": "Boccia", "dur": 2600,
  "note": "The throw: a pendulum swing back and through, the ball lands and rolls in beside the jack, and the next ball is in the hand as the arm settles.",
  "also": "Both balls are your two balls; the one on the floor steps aside while the throw is in the air.",
  "tree": [("p", [3, 4, 11]),
           ("g", "upper", [("p", [0, 1]), ("g", "arm", [("p", [2])])]),
           ("g", "gball", [("p", [8, 9, 10])]),
           ("g", "ball", [("g", "bspin", [("p", [5, 6, 7])])])],
  "origins": {"upper": (180, 270), "arm": (240, 195), "bspin": BC_HAND},
  "keys": {
    "arm":   swing3d.smooth_keys(BC_ARM, rot, BC_T),
    "upper": swing3d.smooth_keys([(0, 0), (8, 0), (24, -1.5), (36, 2.5), (50, 1.5), (70, 0), (100, 0)], rot, BC_T),
    "gball": [(0, "none; opacity: 1", "io"), (6, "none; opacity: 1", "io"), (18, "none; opacity: 0", "lin"), (71, "none; opacity: 0", "lin"), (77, "none; opacity: 1", "lin"), (100, "none; opacity: 1", None)],
  },
}
REL = 34.0
rx, ry = meval.world(bc, ["upper", "arm"], BC_HAND, REL)
r0 = (rx - BC_HAND[0], ry - BC_HAND[1])
land = (404 - BC_HAND[0], 392 - BC_HAND[1]); rest = (BC_FLOOR[0] - BC_HAND[0], BC_FLOOR[1] - BC_HAND[1])
bc["keys"]["ball"] = merge(
    [(t, tf + "; opacity: 1", e) for t, tf, e in meval.follow(bc, ["upper", "arm"], BC_HAND, 0, REL, .5)],
    meval.path_keys(REL, 44, [r0, (r0[0] + 16, r0[1] - 22), (land[0] - 2, land[1] - 40), land], "cubic-bezier(.3,0,.8,.6)", lambda t, x, y: tl(x, y, "; opacity: 1"), .5),
    meval.path_keys(44, 49, [land, (land[0] + 4, land[1] - 14), (land[0] + 7, land[1])], "lin", lambda t, x, y: tl(x, y, "; opacity: 1"), .5),
    meval.path_keys(49, 62, [(land[0] + 7, land[1]), rest], "out", lambda t, x, y: tl(x, y, "; opacity: 1"), .5),
    [(71, tl(*rest, "; opacity: 1"), "lin"), (77, tl(*rest, "; opacity: 0"), "lin"), (78, tl(0, 0, "; opacity: 0"), "lin"), (80, tl(0, 0, "; opacity: 0"), "out"), (92, tl(0, 0, "; opacity: 1"), None), (100, tl(0, 0, "; opacity: 1"), None)])
bc["keys"]["bspin"] = [(0, "rotate(0deg)", "lin"), (REL, "rotate(0deg)", "lin"), (44, "rotate(160deg)", "lin"), (49, "rotate(190deg)", "out"), (62, "rotate(300deg)", "lin"), (77, "rotate(300deg)", "lin"), (78, "rotate(0deg)", "lin"), (100, "rotate(0deg)", None)]
SPECS.append(bc)

# ---------------------------------------------------------------- curling
# A push needs the hand to travel along the ice: the body leans (about the hips) while
# the arm and stick turn back the other way (about the shoulder), so the stick slides
# forward at the same angle and the stone goes with it. Solved, not eyeballed.
CU_H, CU_S, CU_TIP = (165, 265), (225, 205), (402, 340)
def _r(p, c, a):
    a = math.radians(a); x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))
def _solve(dx):
    best = None
    for i in range(-160, 161):
        tb = i / 10
        Sw = _r(CU_S, CU_H, tb); Tw = _r(CU_TIP, CU_H, tb)
        lo, hi = -25.0, 25.0
        for _ in range(60):                       # arm angle that puts the tip back on the ice line
            m = (lo + hi) / 2; y = _r(Tw, Sw, m)[1]
            lo, hi = (lo, m) if (y - CU_TIP[1]) * (_r(Tw, Sw, hi)[1] - CU_TIP[1]) > 0 else (m, hi)
        ta = (lo + hi) / 2; x = _r(Tw, Sw, ta)[0]
        if best is None or abs(x - CU_TIP[0] - dx) < best[0]: best = (abs(x - CU_TIP[0] - dx), tb, ta)
    return best[1], best[2]
CU_BACK, CU_PUSH = _solve(-14), _solve(24)
CU_T = swing3d.times((0, 100, .5))
cu = {
  "key": "curling", "label": "Curling", "dur": 2400,
  "note": "The delivery: the stone eases back on the stick, the body leans in and pushes it away, it glides off down the sheet, and the next stone is set at the stick.",
  "tree": [("p", [3, 4]),
           ("g", "body", [("p", [0, 1]), ("g", "arm", [("p", [2])])]),
           ("g", "stone", [("p", [5, 6])])],
  "origins": {"body": CU_H, "arm": CU_S},
  "keys": {
    "body": swing3d.smooth_keys([(0, 0), (6, 0), (18, CU_BACK[0]), (34, CU_PUSH[0]), (48, CU_PUSH[0] * 1.05), (84, 0), (100, 0)], rot, CU_T),
    "arm":  swing3d.smooth_keys([(0, 0), (6, 0), (18, CU_BACK[1]), (34, CU_PUSH[1]), (48, CU_PUSH[1] - 4), (84, 0), (100, 0)], rot, CU_T),
  },
}
_fol = meval.follow(cu, ["body", "arm"], CU_TIP, 0, 34, .5)
def _xonly(tf):
    x = float(tf.split("(")[1].split("px")[0]); return x
pushx = _xonly(_fol[-1][1])
cu["keys"]["stone"] = merge(
    [(t, tl(_xonly(tf), 0, "; opacity: 1"), "lin") for t, tf, e in _fol],
    meval.path_keys(34, 70, [(pushx, 0), (pushx + 40, 0), (pushx + 96, 0)], "cubic-bezier(.2,.6,.4,1)", lambda t, x, y: tl(x, 0, f"; opacity: {_op(t, 1, 0, 54, 70):.3f}"), .5),
    [(72, tl(-12, 0, "; opacity: 0"), "out"), (90, tl(0, 0, "; opacity: 1"), None), (100, tl(0, 0, "; opacity: 1"), None)])
SPECS.append(cu)
