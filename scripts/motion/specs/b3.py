import math, sys
import meval
SPECS = []

def merge(*lists):
    """One keyframe list from several; a later list wins where two share a time."""
    seen = {}
    for lst in lists:
        for row in lst: seen[round(float(row[0]), 3)] = row
    return [seen[t] for t in sorted(seen)]

def _op(t, a, b, t0, t1):
    return a if t <= t0 else b if t >= t1 else a + (b - a) * (t - t0) / (t1 - t0)

def tl(x, y, extra=""):
    return f"translate({x:.2f}px,{y:.2f}px)" + extra

# ---------------------------------------------------------------- football
SPECS.append({
  "key": "football", "label": "Football", "dur": 2000,
  "note": "Carrying the ball: two hard pushes on the wheel, the body leaning into each one, the ball tucked in tight.",
  "also": "The pushing arm is part of the back's shape, so it bends at the shoulder.",
  "tree": [("g", "all", [("p", [9, 10, 11, 12, 13]),
                         ("g", "torso", [("p", [6]), ("bend", "arm", 1), ("p", [4]), ("g", "ball", [("p", [7])]), ("g", "head", [("p", [0, 2, 3])])])])],
  "origins": {"torso": (300, 345), "head": (360, 140), "ball": (400, 250)},
  "bends": {"arm": {"pivot": (126.0, 154.0), "cut_a": (106.6, 148.5), "cut_b": (145.9, 159.4), "hand": (110.0, 262.0), "ramp": 40,
                    "keys": [[0, 0], [0.12, 6], [0.3, -12], [0.46, 5], [0.64, -11], [0.8, 2], [1, 0]]}},
  "keys": {
    "all":   [(0, "translate(0,0)", "io"), (12, "translate(-2px,0)", "io"), (34, "translate(9px,0)", "io"), (46, "translate(8px,0)", "io"), (68, "translate(17px,0)", "io"), (100, "translate(0,0)", None)],
    "torso": [(0, "rotate(0deg)", "io"), (12, "rotate(-1deg)", "io"), (30, "rotate(2.4deg)", "io"), (46, "rotate(-.6deg)", "io"), (64, "rotate(2.2deg)", "io"), (82, "rotate(-.3deg)", "io"), (100, "rotate(0deg)", None)],
    "head":  [(0, "rotate(0deg)", "io"), (14, "rotate(-2deg)", "io"), (32, "rotate(2.5deg)", "io"), (48, "rotate(-1.5deg)", "io"), (66, "rotate(2deg)", "io"), (84, "rotate(-.5deg)", "io"), (100, "rotate(0deg)", None)],
    "ball":  [(0, "rotate(0deg)", "io"), (14, "rotate(2deg)", "io"), (32, "rotate(-3deg)", "io"), (48, "rotate(1.5deg)", "io"), (66, "rotate(-2.5deg)", "io"), (84, "rotate(.5deg)", "io"), (100, "rotate(0deg)", None)],
  },
})

# ---------------------------------------------------------------- softball
# The drawing is the follow-through: the ball is already flying off with speed lines.
# So the loop plays out of the drawing and back into it: the ball carries on and is gone,
# the batter resets with the bat up, the next pitch comes in, the bat drops behind and
# comes round through the front (swing3d: the arms shorten as they turn about the spine,
# the bat keeps its thickness), contact, and the ball flies out to exactly where it is
# drawn as the batter lands in the drawn pose.
import swing3d
SB_SPINE, SB_GRIP, SB_REST, SB_PHI0, SB_LEN = (285, 175), (162, 151), (123, 180), math.degrees(math.atan2(-68, -131)), 147.6
SB_CTRL = {
  "a":     [(0, 180), (10, 180), (30, 150), (50, 150), (53, 132), (58, 55), (62, -22), (66.5, -100), (71, -165), (76, -180), (100, -180)],
  "r":     [(0, 123), (10, 120), (30, 80), (50, 80), (53, 84), (58, 74), (62, 100), (66.5, 104), (71, 120), (76, 123), (100, 123)],
  "dy":    [(0, 0), (10, 6), (30, -6), (50, -6), (53, 10), (58, 32), (62, 22), (66.5, 10), (72, -2), (84, 0), (100, 0)],
  "beta":  [(0, 27.43), (10, 20), (30, 76), (40, 70), (50, 76), (53, 10), (58, -4), (61, -14), (64, -6), (66.5, 18), (72, 31), (84, 26.8), (100, 27.43)],
  "gamma": [(0, 180), (10, 180), (30, 180), (40, 172), (50, 180), (53, 182), (58, 58), (61, -20), (64, -75), (66.5, -112), (72, -182), (84, -179.5), (100, -180)],
}
_arms, _bat = swing3d.swing(SB_SPINE, SB_GRIP, SB_REST, SB_PHI0, SB_CTRL, swing3d.times((0, 50, 1), (50, 76, .5), (76, 100, 1)))
sb = {
  "key": "softball", "label": "Softball", "dur": 2400,
  "note": "The hit: the pitch comes in, the bat drops behind and comes round to meet it, and the ball flies off with its speed lines as the batter lands in the follow-through you drew.",
  "also": "The swing turns around the batter's spine: the arms come round through the front and the bat swings flat, then wraps up over the shoulder.",
  "tree": [("p", [18, 19, 20, 21, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
           ("g", "body", [("p", [9, 12, 15, 16, 17]), ("g", "head", [("p", [0, 2, 4, 7])]),
                          ("g", "arms", [("p", [13, 14])]), ("g", "bat", [("p", [1])])]),
           ("g", "ball", [("g", "streaks", [("p", [8, 11])]), ("g", "spin", [("p", [3])])])],
  "origins": {"body": (290, 300), "head": (296, 150), "arms": SB_SPINE, "bat": SB_GRIP, "streaks": (434, 143), "spin": (458.2, 128.8)},
  "keys": {
    "body":  [(0, "rotate(0deg)", "io"), (30, "rotate(-2deg)", "io"), (50, "rotate(-2.5deg)", "in"), (59, "rotate(2deg)", "out"), (76, "rotate(1deg)", "io"), (100, "rotate(0deg)", None)],
    "head":  [(0, "rotate(0deg)", "io"), (30, "rotate(2deg)", "io"), (50, "rotate(2.5deg)", "in"), (59, "rotate(-1.5deg)", "out"), (80, "rotate(-.5deg)", "io"), (100, "rotate(0deg)", None)],
    "arms": _arms, "bat": _bat,
  },
}
_tx, _ty = meval.world({"keys": {"body": sb["keys"]["body"]}, "origins": sb["origins"]}, ["body"], swing3d.tip(SB_SPINE, SB_GRIP, SB_REST, SB_PHI0, SB_CTRL, 58, SB_LEN * .9), 58)
SB_HIT = (_tx + 16 - 458.2, _ty - 6 - 128.8)
sb["keys"]["ball"] = merge(
    meval.path_keys(0, 12, [(0, 0), (24, -9), (46, -14)], "cubic-bezier(.4,0,1,1)", lambda t, x, y: tl(x, y, f"; opacity: {_op(t, 1, 0, 2, 12):.3f}")),
    meval.path_keys(34, 58, [(70, 46), (SB_HIT[0] * .35 + 52, -46), SB_HIT], "lin", lambda t, x, y: tl(x, y, f"; opacity: {_op(t, 0, 1, 34, 38):.3f}")),
    meval.path_keys(58, 86, [SB_HIT, (SB_HIT[0] * .7, SB_HIT[1] - 40), (0, 0)], "cubic-bezier(.1,.8,.25,1)", lambda t, x, y: tl(x, y, "; opacity: 1")),
    [(100, tl(0, 0, "; opacity: 1"), None)])
sb["keys"]["streaks"] = [(0, "scale(1,1); opacity: 1", "lin"), (10, "scale(.4,1); opacity: 0", "lin"), (58, "scale(0,1); opacity: 0", "out"),
                         (62, "scale(.5,1); opacity: 1", "out"), (86, "scale(1,1); opacity: 1", None), (100, "scale(1,1); opacity: 1", None)]
sb["keys"]["spin"] = [(0, "rotate(0deg)", "lin"), (12, "rotate(-90deg)", "lin"), (34, "rotate(-90deg)", "lin"), (58, "rotate(150deg)", "cubic-bezier(.1,.8,.25,1)"), (86, "rotate(-720deg)", None), (100, "rotate(-720deg)", None)]
SPECS.append(sb)

# ---------------------------------------------------------------- beep baseball
# The drawing is the moment before the swing: bat up, the beeping ball on its way in.
BB_SPINE, BB_GRIP, BB_REST, BB_PHI0, BB_LEN = (205, 200), (89.8, 193.2), (115.2, 180), math.degrees(math.atan2(-153.2, 85.2)), 177.0
BB_CTRL = {
  "a":     [(0, 180), (16, 180), (21, 165), (25, 60), (28, -5), (32, -95), (38, -170), (56, -172), (76, -180), (100, -180)],
  "r":     [(0, 115.2), (16, 115.2), (21, 104), (25, 50), (28, 92), (32, 90), (38, 108), (56, 108), (76, 115.2), (100, 115.2)],
  "dy":    [(0, 0), (16, -4), (21, 6), (25, 22), (28, 14), (32, 0), (38, -12), (56, -10), (76, 0), (100, 0)],
  "beta":  [(0, 60.92), (6, 65), (11, 57), (16, 72), (21, 12), (25, -3), (28, 4), (32, 24), (38, 40), (56, 37), (66, 52), (76, 58), (86, 62.4), (100, 60.92)],
  "gamma": [(0, 0), (6, 8), (11, -4), (16, -22), (21, -170), (25, -298), (28, -365), (32, -455), (38, -530), (56, -534), (66, -630), (76, -702), (86, -721), (100, -720)],
}
_arms, _bat = swing3d.swing(BB_SPINE, BB_GRIP, BB_REST, BB_PHI0, BB_CTRL, swing3d.times((0, 14, 1), (14, 42, .5), (42, 100, 1)))
bb = {
  "key": "beepbaseball", "label": "Beep baseball", "dur": 2400,
  "note": "The pitch beeps its way in, the batter swings on the sound and connects, and the next beeping pitch comes in to where you drew it.",
  "also": "The beeps are your two sound waves, pulsing out from the ball. The swing turns around the batter's spine, so the arms come round through the front.",
  "tree": [("p", [10, 11]), ("g", "head", [("p", [1, 2, 3])]),
           ("g", "arms", [("p", [9, 5, 7])]), ("g", "bat", [("p", [0])]),
           ("g", "ball", [("p", [8]), ("g", "w1", [("p", [6])]), ("g", "w2", [("p", [4])])])],
  "origins": {"head": (207, 150), "arms": BB_SPINE, "bat": BB_GRIP, "w1": (372.2, 219), "w2": (372.2, 219)},
  "keys": {
    "head": [(0, "rotate(0deg)", "io"), (18, "rotate(2deg)", "io"), (27, "rotate(-2deg)", "out"), (50, "rotate(-1deg)", "io"), (100, "rotate(0deg)", None)],
    "arms": _arms, "bat": _bat,
  },
}
_tx, _ty = swing3d.tip(BB_SPINE, BB_GRIP, BB_REST, BB_PHI0, BB_CTRL, 25, BB_LEN * .95)
BB_HIT = (_tx + 16 - 372.2, _ty - 2 - 219)
bb["keys"]["ball"] = merge(
    meval.path_keys(0, 25, [(0, 0), (BB_HIT[0] / 2, BB_HIT[1] / 2 - 14), BB_HIT], "lin", lambda t, x, y: tl(x, y, "; opacity: 1")),
    meval.path_keys(25, 40, [BB_HIT, (BB_HIT[0] + 60, BB_HIT[1] - 120), (BB_HIT[0] + 190, BB_HIT[1] - 190)], "out", lambda t, x, y: tl(x, y, f"; opacity: {_op(t, 1, 0, 31, 40):.3f}")),
    meval.path_keys(66, 100, [(70, -10), (35, -18), (0, 0)], "lin", lambda t, x, y: tl(x, y, f"; opacity: {_op(t, 0, 1, 66, 71):.3f}")))
def beeps(lag):
    k = [(0, "scale(1,1); opacity: 1", "out")]
    for t0 in (0, 12):            # two beeps on the way in
        k += [(t0 + lag + 6, "scale(1.25,1.25); opacity: 0", "lin"), (t0 + lag + 6.5, "scale(.7,.7); opacity: 0", "out"), (t0 + lag + 12, "scale(1,1); opacity: 1", "out")]
    k += [(26, "scale(1.3,1.3); opacity: 0", "lin"), (72 + lag, "scale(.7,.7); opacity: 0", "out"), (82 + lag, "scale(1,1); opacity: 1", "out"),
          (91 + lag / 2, "scale(1.08,1.08); opacity: .8", "io"), (100, "scale(1,1); opacity: 1", None)]
    return sorted(k, key=lambda r: r[0])
bb["keys"]["w1"] = beeps(0)
bb["keys"]["w2"] = beeps(2)
SPECS.append(bb)

# ---------------------------------------------------------------- lacrosse
LX_T = swing3d.times((0, 44, 1), (44, 60, .5), (60, 84, 1), (84, 96, .5), (96, 100, 1))
LX_STICK = [(0, 0), (12, 10), (24, -6), (36, 8), (46, -16), (50.5, 40), (53.5, 70), (58, 80), (64, 77), (78, 0), (86, 1.5), (88, 0), (92, -9), (100, 0)]
LX_ARM = [(0, 0), (12, 2), (24, -1.5), (36, 1.5), (46, -6), (50.5, 8), (53.5, 13), (58, 15), (64, 14), (78, 0), (86, .5), (88, 0), (92, -2.5), (100, 0)]
lx = {
  "key": "lacrosse", "label": "Lacrosse", "dur": 2600,
  "note": "Cradle, shoot, catch: the stick rocks the ball in its pocket, whips forward and lets it fly, then reaches for a pass and cushions it back into the net.",
  "also": "The stick turns in the fist; the ball rides in the pocket until it is thrown.",
  "tree": [("p", [26, 29, 31, 32, 33, 34, 36, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]),
           ("g", "head", [("p", [11, 22])]),
           ("g", "arm", [("p", [23, 27]), ("g", "stick", [("p", [0, 4, 30])])]),
           ("g", "ball", [("p", [8])])],
  "origins": {"head": (360, 190), "arm": (290, 172), "stick": (163.9, 173.5)},
  "keys": {
    "arm":   swing3d.smooth_keys(LX_ARM, lambda v: f"rotate({v:.3f}deg)", LX_T),
    "stick": swing3d.smooth_keys(LX_STICK, lambda v: f"rotate({v:.3f}deg)", LX_T),
    "head":  [(0, "rotate(0deg)", "io"), (44, "rotate(-1.5deg)", "io"), (54, "rotate(2deg)", "io"), (76, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
  },
}
LX_BALL = (100.1, 80.5)
REL = 50.5
rx, ry = meval.world(lx, ["arm", "stick"], LX_BALL, REL)
p0 = meval.world(lx, ["arm", "stick"], LX_BALL, REL - .25); p1 = meval.world(lx, ["arm", "stick"], LX_BALL, REL + .25)
vx, vy = (p1[0] - p0[0]) / .5, (p1[1] - p0[1]) / .5           # pocket speed at release, px per percent
R0 = (rx - LX_BALL[0], ry - LX_BALL[1]); T = 11.0
k = [(t, tf + "; opacity: 1", e) for t, tf, e in meval.follow(lx, ["arm", "stick"], LX_BALL, 0, REL, .5)]
k = merge(k, meval.path_keys(REL, REL + T, [R0, (R0[0] + vx * T / 3, R0[1] + vy * T / 3), (R0[0] + 300, R0[1] - 120), (R0[0] + 470, R0[1] - 150)], "lin",
                             lambda t, x, y: tl(x, y, f"; opacity: {_op(t, 1, 0, REL + 6, REL + T):.3f}"), .5),
          meval.path_keys(75, 88, [(450, -40), (300, -190), (90, -150), (0, 0)], "cubic-bezier(.35,0,.9,.6)", lambda t, x, y: tl(x, y, f"; opacity: {_op(t, 0, 1, 75, 78):.3f}"), .5),
          [(t, tf + "; opacity: 1", e) for t, tf, e in meval.follow(lx, ["arm", "stick"], LX_BALL, 88, 100, .5)])
lx["keys"]["ball"] = k
SPECS.append(lx)

# ---------------------------------------------------------------- handball
HB_S = (186, 166)
HB_BALL = (92.33, 64.23, 35.2)
arm = [(0, "rotate(0deg)", "io"), (20, "rotate(-14deg)", "whip"), (29, "rotate(50deg)", "lin"), (33, "rotate(62deg)", "out"), (48, "rotate(58deg)", "io"),
       (70, "rotate(0deg)", "io"), (88, "rotate(0deg)", "io"), (92, "rotate(-5deg)", "io"), (100, "rotate(0deg)", None)]
hb = {
  "key": "handball", "label": "Handball", "dur": 2200,
  "note": "The throw: the arm cocks back and whips over the top, the ball flies toward the goal, and a pass comes back into the same hand.",
  "also": "The ball is drawn into the hand, so it comes away along its own round edge.",
  "tree": [("p", [9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]),
           ("g", "body", [("p", [6, 7]), ("g", "head", [("p", [5])]), ("g", "other", [("p", [8])])]),
           ("g", "arm", [("cut", 0, HB_BALL, "out")]),
           ("g", "ball", [("g", "spin", [("cut", 0, (HB_BALL[0], HB_BALL[1], HB_BALL[2] + .4), "in"), ("p", [1, 2, 3, 4])])])],
  "origins": {"arm": HB_S, "ball": HB_S, "spin": HB_BALL[:2], "body": (236, 300), "head": (264, 140), "other": (290, 195)},
  "keys": {
    "arm": arm,
    "spin": [(0, "rotate(0deg)", "lin"), (29, "rotate(0deg)", "lin"), (47, "rotate(420deg)", "lin"), (72, "rotate(420deg)", "lin"), (88, "rotate(720deg)", "lin"), (100, "rotate(720deg)", None)],
    "body":  [(0, "rotate(0deg)", "io"), (20, "rotate(-1.5deg)", "whip"), (30, "rotate(2deg)", "out"), (50, "rotate(1.5deg)", "io"), (72, "rotate(0deg)", "io"), (100, "rotate(0deg)", None)],
    "head":  [(0, "rotate(0deg)", "io"), (20, "rotate(-3deg)", "io"), (32, "rotate(3deg)", "io"), (60, "rotate(1deg)", "io"), (80, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "other": [(0, "rotate(0deg)", "io"), (20, "rotate(-6deg)", "io"), (31, "rotate(10deg)", "out"), (50, "rotate(7deg)", "io"), (74, "rotate(0deg)", "io"), (100, "rotate(0deg)", None)],
  },
}
hb["keys"]["ball"] = merge(
    [(0, "translate(0px,0px) rotate(0deg); opacity: 1", "io"), (20, "translate(0px,0px) rotate(-14deg); opacity: 1", "whip")],
    meval.path_keys(29, 47, [(0, 0), (180, -26), (370, 30)], "lin", lambda t, x, y: f"translate({x:.2f}px,{y:.2f}px) rotate(50deg); opacity: {_op(t, 1, 0, 40, 47):.3f}"),
    meval.path_keys(74, 88, [(440, -50), (200, -150), (0, 0)], "cubic-bezier(.3,0,.7,1)", lambda t, x, y: f"translate({x:.2f}px,{y:.2f}px) rotate(0deg); opacity: {_op(t, 0, 1, 74, 77):.3f}"),
    [(88, "translate(0px,0px) rotate(0deg); opacity: 1", "io"), (92, "translate(0px,0px) rotate(-5deg); opacity: 1", "io"), (100, "translate(0px,0px) rotate(0deg); opacity: 1", None)])
SPECS.append(hb)

# ---------------------------------------------------------------- goalball
GB_C = (445.2, 304.6)
SPECS.append({
  "key": "goalball", "label": "Goalball", "dur": 2400,
  "note": "The block: the last ball rebounds away, the player resets, and the next throw rolls in jingling until a full-length dive stops it at the hand.",
  "also": "The swoosh behind the ball travels with it; the ball rolls along the floor as it comes.",
  "tree": [("g", "body", [("p", [2, 5, 6]), ("g", "head", [("p", [0, 1, 3])]), ("g", "arm", [("p", [4])])]),
           ("g", "ball", [("g", "spin", [("p", [7, 10, 12])]), ("g", "swoosh", [("p", [8])])])],
  "origins": {"body": (180, 300), "head": (327, 200), "arm": (290, 252), "spin": GB_C, "swoosh": (470, 297), "ball": GB_C},
  "keys": {
    "body":  [(0, "translate(0,0)", "io"), (14, "translate(-4px,0)", "io"), (42, "translate(-12px,1px)", "io"), (54, "translate(-13px,1px)", "in"), (62, "translate(3px,0)", "out"),
              (70, "translate(-1px,0)", "io"), (84, "translate(0,0)", None), (100, "translate(0,0)", None)],
    "arm":   [(0, "rotate(0deg)", "io"), (14, "rotate(-4deg)", "io"), (42, "rotate(-8deg)", "io"), (54, "rotate(-8deg)", "in"), (62, "rotate(2deg)", "out"), (70, "rotate(-1.5deg)", "io"), (84, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "head":  [(0, "rotate(0deg)", "io"), (42, "rotate(-3deg)", "io"), (56, "rotate(-3deg)", "in"), (62, "rotate(2deg)", "out"), (78, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "ball":  [(0, "translate(0,0) scale(1,1); opacity: 1", "out"), (14, "translate(34px,-4px) scale(1,1); opacity: 0", "lin"), (40, "translate(120px,0) scale(1,1); opacity: 0", "lin"),
              (44, "translate(100px,0) scale(1,1); opacity: 1", "lin"), (61, "translate(-2px,0) scale(1,1); opacity: 1", "lin"), (62, "translate(-3px,0) scale(.93,1.04); opacity: 1", "out"),
              (68, "translate(4px,0) scale(1,1); opacity: 1", "io"), (80, "translate(0,0) scale(1,1); opacity: 1", None), (100, "translate(0,0) scale(1,1); opacity: 1", None)],
    "spin":  [(0, "rotate(0deg)", "out"), (14, "rotate(64deg)", "lin"), (40, "rotate(230deg)", "lin"), (61, "rotate(-4deg)", "lin"), (62, "rotate(-5deg)", "out"), (68, "rotate(8deg)", "io"), (80, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "swoosh": [(0, "scale(1,1); opacity: 1", "lin"), (8, "scale(1,1); opacity: 0", "lin"), (44, "scale(.6,1); opacity: 0", "out"), (50, "scale(1,1); opacity: 1", "io"),
               (55, "scale(1,1); opacity: .45", "io"), (60, "scale(1,1); opacity: 1", "io"), (100, "scale(1,1); opacity: 1", None)],
  },
})
