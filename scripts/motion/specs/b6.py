import math, sys
import meval, swing3d
SPECS = []

def tl(x, y, extra=""): return f"translate({x:.2f}px,{y:.2f}px)" + extra
def rot(v): return f"rotate({v:.3f}deg)"
def sm(ctrl, fmt, ts): return swing3d.smooth_keys(ctrl, fmt, ts)
def T(step=.5): return swing3d.times((0, 100, step))
H = swing3d._hermite

# ---------------------------------------------------------------- dance
DN_T = T()
SPECS.append({
  "key": "dance", "label": "Dance", "dur": 2600,
  "note": "Two beats of a wheelchair dance: the body sways side to side, the raised arm sweeps overhead, and the open arm flows out and back like a ribbon.",
  "also": "The open arm is part of the body's shape, so it bends at the shoulder.",
  "tree": [("g", "all", [("p", [3, 4]), ("g", "upper", [("p", [1]), ("bend", "arm", 2), ("g", "raised", [("p", [0])])])])],
  "origins": {"all": (230, 470), "upper": (265, 300), "raised": (298, 232)},
  "bends": {"arm": {"pivot": (232, 212), "cut_a": (227.0, 191.6), "cut_b": (234.0, 238.7), "hand": (50, 260), "ramp": 45,
                    "keys": [[0, 0], [.12, 7], [.3, -9], [.5, 7], [.7, -8], [.88, 2], [1, 0]]}},
  "keys": {
    "all":    sm([(0, 0), (25, -1.5), (50, 1.5), (75, -1.2), (100, 0)], rot, DN_T),
    "upper":  sm([(0, 0), (14, -3), (34, 3.5), (54, -3), (74, 3), (90, -.5), (100, 0)], rot, DN_T),
    "raised": sm([(0, 0), (14, 9), (34, -7), (54, 9), (74, -6), (90, 1), (100, 0)], rot, DN_T),
  },
})

# ---------------------------------------------------------------- powerlifting
# The bar and both arms are one shape: as the bar comes down, the arms slide into the
# chest and bench (same ink), which reads as the elbows bending. The plates ride the bar
# with a small lag, so they settle a beat after each lockout.
PL_T = T()
_bar = H([(0, 0), (6, 0), (30, 30), (34, 30), (44, -2), (48, 0), (56, 0), (78, 30), (82, 30), (92, -2), (96, 0), (100, 0)])
_lag = H([(0, 0), (6, 0), (30, 31.5), (34, 31), (44, -3.5), (47, 1), (50, -.5), (56, 0), (78, 31.5), (82, 31), (92, -3.5), (95, 1), (98, -.3), (100, 0)])
SPECS.append({
  "key": "powerlifting", "label": "Powerlifting", "dur": 2800,
  "note": "Two reps on the bench: the bar comes down slow and controlled to the chest, then drives up to lockout, the plates settling a beat after.",
  "also": "Bar and arms are one shape in the drawing; as the bar lowers, the arms tuck into the chest.",
  "tree": [("p", [11, 12, 13, 14, 15]),
           ("g", "bar", [("p", [6, 9, 10])]),
           ("g", "plates", [("p", [0, 1, 2, 3, 4, 5, 7, 8])])],
  "origins": {},
  "keys": {
    "bar":    [(t, tl(0, _bar(t)), "lin") for t in PL_T],
    "plates": [(t, tl(0, _lag(t)), "lin") for t in PL_T],
  },
})

# ---------------------------------------------------------------- amputee sports
AM_T = T()
_bob = H([(0, 0), (12, 4), (25, -6), (37, 0), (50, 4), (62, -6), (75, 0), (88, 2), (100, 0)])
SPECS.append({
  "key": "amputeesports", "label": "Amputee sports", "dur": 2400,
  "note": "Two strides on crutches: the crutches swing ahead and plant, the body vaults through between them, and the leg swings forward for the next step.",
  "tree": [("g", "body", [("p", [0, 1, 2, 3]), ("g", "leg", [("p", [6])]),
                          ("g", "cl", [("p", [4])]), ("g", "cr", [("p", [5])])])],
  "origins": {"body": (300, 300), "leg": (246, 272), "cl": (161, 188), "cr": (390, 211)},
  "keys": {
    "body": [(t, f"translate({H([(0, 0), (25, 4), (37, 1), (62, 4), (75, 1), (100, 0)])(t):.2f}px,{_bob(t):.2f}px) rotate({H([(0, 0), (12, -1.5), (25, 2), (37, 0), (50, -1.5), (62, 2), (75, 0), (100, 0)])(t):.3f}deg)", "lin") for t in AM_T],
    "leg":  sm([(0, 0), (12, 6), (25, -14), (37, -4), (50, 6), (62, -14), (75, -4), (90, 1), (100, 0)], rot, AM_T),
    "cl":   sm([(0, 0), (12, -9), (25, 4), (37, 2), (50, -9), (62, 4), (75, 2), (90, 0), (100, 0)], rot, AM_T),
    "cr":   sm([(0, 0), (12, -8), (25, 4), (37, 2), (50, -8), (62, 4), (75, 2), (90, 0), (100, 0)], rot, AM_T),
  },
})

# ---------------------------------------------------------------- multi-sport
# Three athletes, one move each, in turn: the shot, the overhead smash, the swing.
MU_T = T()
SPECS.append({
  "key": "multi", "label": "Multi-sport", "dur": 3600,
  "note": "Three athletes, one move each in turn: the basketball player shoots, the tennis player swings up and over, and the batter swings through.",
  "tree": [("p", [8, 75, 76, 74, 73, 7]),
           ("g", "bb", [("p", [5, 6]), ("g", "shoot", [("p", [4, 0, 1, 2, 3])])]),
           ("g", "tn", [("p", [60, 71]), ("g", "smash", [("p", [9])])]),
           ("g", "bt", [("p", [56, 72]), ("g", "swing", [("p", [14])])])],
  "origins": {"bb": (215, 250), "shoot": (281, 172), "tn": (215, 360), "smash": (176, 336), "bt": (322, 360), "swing": (360, 332)},
  "keys": {
    "shoot": sm([(0, 0), (6, 10), (15, -14), (22, -12), (32, 0), (100, 0)], rot, MU_T),
    "bb":    sm([(0, 0), (6, 2), (15, -3), (24, -2), (32, 0), (100, 0)], rot, MU_T),
    "smash": sm([(0, 0), (33, 0), (40, -12), (49, 38), (56, 35), (66, 0), (100, 0)], rot, MU_T),
    "tn":    sm([(0, 0), (33, 0), (40, -2), (49, 3), (58, 2), (66, 0), (100, 0)], rot, MU_T),
    "swing": sm([(0, 0), (66, 0), (73, -22), (81, 48), (88, 44), (98, 0), (100, 0)], rot, MU_T),
    "bt":    sm([(0, 0), (66, 0), (73, -2), (81, 3), (90, 2), (98, 0), (100, 0)], rot, MU_T),
  },
})

# ---------------------------------------------------------------- art therapy
AT_T = T(1)
SPECS.append({
  "key": "art-therapy", "label": "Art therapy", "dur": 4200,
  "note": "At the easel: the brush lays down three soft strokes, and the heart on the canvas beats twice.",
  "tree": [("p", [0, 2, 6] + [i for i in (7, 8, 9, 12, 16, 19, 20, 21, 22, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36)]),
           ("g", "head", [("p", [1])]),
           ("g", "palette", [("p", [10, 11])]),
           ("g", "brush", [("p", [5, 4])]),
           ("g", "heart", [("p", [3])])],
  "origins": {"brush": (226, 206), "heart": (433.2, 134.7), "palette": (140, 240), "head": (177, 160)},
  "keys": {
    "brush":   sm([(0, 0), (10, -3.5), (18, 1.5), (26, -3), (34, 2), (42, -2.5), (50, 1), (58, 0), (100, 0)], rot, AT_T),
    "head":    sm([(0, 0), (12, -1), (40, 1.5), (60, 0), (100, 0)], lambda v: tl(v, v * .4), AT_T),
    "palette": sm([(0, 0), (20, -2), (50, 1.5), (80, 0), (100, 0)], rot, AT_T),
    "heart":   [(0, "scale(1,1)", "lin"), (60, "scale(1,1)", "out"), (64, "scale(1.14,1.14)", "io"), (68, "scale(1,1)", "out"), (72, "scale(1.18,1.18)", "io"), (80, "scale(1,1)", None), (100, "scale(1,1)", None)],
  },
})

# ---------------------------------------------------------------- veteran meetup
VM_T = T(1)
def steam(t0):
    k = [(0, tl(0, 0, "; opacity: 1"), "lin")]
    for c in (t0, t0 + 34, t0 + 68):
        if c + 30 > 100: break
        k += [(c, tl(0, 0, "; opacity: 1"), "out"), (c + 24, tl(0, -14, "; opacity: 0"), "lin"), (c + 25, tl(0, 6, "; opacity: 0"), "out"), (c + 31, tl(0, 0, "; opacity: 1"), "lin")]
    return k + [(100, tl(0, 0, "; opacity: 1"), None)]
SPECS.append({
  "key": "veteran-meetup", "label": "Veteran meetup", "dur": 4600,
  "note": "Coffee and conversation: one talks with his hands, the one in the middle nods along, and the third lifts his mug as the steam drifts up.",
  "tree": [("p", sorted(set(__import__("mv").load("veteran-meetup")) - {0, 1, 4, 10, 11, 14, 26, 29})),
           ("g", "talk", [("p", [0])]), ("g", "hand", [("p", [11])]),
           ("g", "nod", [("p", [1, 4])]),
           ("g", "mug", [("p", [26, 29]), ("g", "s1", [("p", [10])]), ("g", "s2", [("p", [14])])])],
  "origins": {"talk": (113, 170), "hand": (146, 234), "nod": (267, 176), "mug": (408, 252)},
  "keys": {
    "hand": sm([(0, 0), (8, -12), (16, 4), (24, -10), (32, 2), (44, 0), (56, -9), (64, 5), (74, 0), (100, 0)], rot, VM_T),
    "talk": sm([(0, 0), (10, -2), (24, 1), (36, 0), (58, -2), (70, 0), (100, 0)], rot, VM_T),
    "nod":  sm([(0, 0), (20, 0), (26, 5), (32, -1), (38, 4), (46, 0), (100, 0)], rot, VM_T),
    "mug":  sm([(0, 0), (40, 0), (50, -9), (66, -9), (78, 0), (100, 0)], rot, VM_T),
    "s1":   steam(4),
    "s2":   steam(14),
  },
})
