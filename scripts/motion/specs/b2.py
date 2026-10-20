import math
SPECS = []

SPECS.append({
  "key": "pickleball", "label": "Pickleball", "dur": 1800,
  "note": "A dink at the kitchen line: a short backswing, a soft tap, and the ball floats over in a gentle arc, then comes back.",
  "tree": [("p", [12]), ("g", "wheel", [("p", [13])]),
           ("g", "body", [("p", [10]), ("p", [1]), ("g", "arm", [("p", [11]), ("g", "paddle", [("p", [0])])])]),
           ("g", "ball", [("g", "spin", [("p", [2])])])],
  "origins": {"body": (150, 285), "arm": (212, 203), "paddle": (346, 197), "wheel": (138, 350), "spin": (456.2, 126.8)},
  "keys": {
    "arm":    [(0, "rotate(0deg)", "io"), (20, "rotate(-8deg)", "in"), (31, "rotate(4deg)", "out"), (46, "rotate(5deg)", "io"), (78, "rotate(-.5deg)", "io"), (100, "rotate(0deg)", None)],
    "paddle": [(0, "rotate(0deg)", "io"), (20, "rotate(-12deg)", "whip"), (31, "rotate(14deg)", "out"), (46, "rotate(18deg)", "io"), (78, "rotate(-1deg)", "io"), (100, "rotate(0deg)", None)],
    "body":   [(0, "rotate(0deg)", "io"), (20, "rotate(1.2deg)", "in"), (32, "rotate(-1.8deg)", "out"), (50, "rotate(-1.6deg)", "io"), (80, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "wheel":  [(0, "rotate(0deg)", "io"), (20, "rotate(-2deg)", "io"), (34, "rotate(3deg)", "io"), (70, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "ball":   [("0%, 30%", "translate(0,0)", "rise"), (46, "translate(30px,-46px)", "fall"), (60, "translate(58px,-8px)", "rise"), (66, "translate(62px,-14px)", "io"), (100, "translate(0,0)", None)],
    "spin":   [("0%, 30%", "rotate(0deg)", "out"), (66, "rotate(220deg)", "io"), (100, "rotate(360deg)", None)],
  },
})

SPECS.append({
  "key": "volleyball", "label": "Volleyball", "dur": 2000,
  "note": "Sitting volleyball: the arm draws back and swings through, the ball sails over the net, and it comes back over to the same spot.",
  "also": "The hitting arm is part of the body's shape, so it bends at the shoulder.",
  "tree": [("p", [7, 8, 25, 47, 48, 49, 50]), ("g", "head", [("p", [9])]), ("g", "body", [("bend", "arm", 5)]),
           ("g", "ball", [("g", "spin", [("p", [0, 1, 2, 3, 4, 6])])])],
  "origins": {"head": (185, 245), "body": (220, 330), "spin": (347.5, 116)},
  "bends": {"arm": {"pivot": (254.5, 221.9), "cut_a": (247.1, 212.8), "cut_b": (262.0, 231.0), "hand": (290.1, 119.3), "ramp": 35,
                    "keys": [[0, 0], [0.2, -16], [0.31, 14], [0.42, 16], [0.75, -1], [1, 0]]}},
  "keys": {
    "body": [(0, "rotate(0deg)", "io"), (20, "rotate(-1.5deg)", "in"), (32, "rotate(2deg)", "out"), (50, "rotate(1.5deg)", "io"), (80, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "head": [(0, "rotate(0deg)", "io"), (20, "rotate(-4deg)", "io"), (40, "rotate(3deg)", "io"), (75, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "ball": [("0%, 29%", "translate(0,0)", "rise"), (47, "translate(70px,-44px)", "fall"), (60, "translate(112px,8px)", "io"), (100, "translate(0,0)", None)],
    "spin": [("0%, 29%", "rotate(0deg)", "out"), (60, "rotate(300deg)", "io"), (100, "rotate(360deg)", None)],
  },
})

SPECS.append({
  "key": "trackfield", "label": "Track and field", "dur": 2000, "viewBox": "16 104 480 304",
  "note": "Wheelchair racing: two hard strokes on the push rim, the arm driving down and forward along the wheel and the body rocking with each one.",
  "also": "Same drawing for wheelchair racing. The pushing arm is part of the back's shape, so it bends at the shoulder.",
  "tree": [("p", [3, 6]), ("g", "rear", [("p", [4])]),
           ("g", "torso", [("bend", "arm", 1), ("p", [5]), ("g", "fore", [("p", [2])]), ("g", "head", [("p", [0])])])],
  "origins": {"rear": (116.2, 298.2), "torso": (205, 285), "fore": (215, 195), "head": (270, 160)},
  "bends": {"arm": {"pivot": (132.8, 152.2), "cut_a": (125.1, 142.7), "cut_b": (140.5, 161.7), "hand": (76.0, 243.3), "ramp": 40,
                    "keys": [[0, 0], [0.14, 6], [0.32, -20], [0.5, 5], [0.66, -18], [0.84, 3], [1, 0]]}},
  "keys": {
    "rear":  [(0, "rotate(0deg)", "io"), (14, "rotate(-2deg)", "io"), (32, "rotate(6deg)", "io"), (50, "rotate(-1deg)", "io"), (66, "rotate(5deg)", "io"), (84, "rotate(-1deg)", "io"), (100, "rotate(0deg)", None)],
    "torso": [(0, "rotate(0deg)", "io"), (14, "rotate(-1deg)", "io"), (32, "rotate(1.6deg)", "io"), (50, "rotate(-.8deg)", "io"), (66, "rotate(1.4deg)", "io"), (84, "rotate(-.5deg)", "io"), (100, "rotate(0deg)", None)],
    "fore":  [(0, "rotate(0deg)", "io"), (32, "rotate(-6deg)", "io"), (50, "rotate(2deg)", "io"), (66, "rotate(-5deg)", "io"), (100, "rotate(0deg)", None)],
    "head":  [(0, "translate(0,0)", "io"), (32, "translate(2px,2px)", "io"), (50, "translate(0,0)", "io"), (66, "translate(2px,2px)", "io"), (100, "translate(0,0)", None)],
  },
})

SPECS.append({
  "key": "running", "label": "Running", "dur": 1600,
  "note": "A stride on a running blade: the arms swing against each other, the blade leg swings through, and the body bounces with each step.",
  "also": "The back arm is part of the torso's shape, so it bends at the shoulder.",
  "tree": [("g", "all", [("p", [3]), ("g", "blade", [("p", [4, 5])]), ("g", "torso", [("bend", "back", 1), ("g", "front", [("p", [2])]), ("g", "head", [("p", [0])])])])],
  "origins": {"blade": (225, 265), "front": (333, 150), "torso": (240, 260), "head": (360, 100)},
  "bends": {"back": {"pivot": (164.6, 136.9), "cut_a": (162.5, 120.6), "cut_b": (166.7, 153.2), "hand": (122.4, 214.1), "ramp": 35,
                     "keys": [[0, 0], [0.25, 14], [0.5, 0], [0.75, -10], [1, 0]]}},
  "keys": {
    "all":   [(0, "translate(0,0)", "io"), (12.5, "translate(0,-6px)", "io"), (25, "translate(0,0)", "io"), (37.5, "translate(0,-5px)", "io"), (50, "translate(0,0)", "io"), (62.5, "translate(0,-6px)", "io"), (75, "translate(0,0)", "io"), (87.5, "translate(0,-5px)", "io"), (100, "translate(0,0)", None)],
    "front": [(0, "rotate(0deg)", "io"), (25, "rotate(-16deg)", "io"), (50, "rotate(0deg)", "io"), (75, "rotate(12deg)", "io"), (100, "rotate(0deg)", None)],
    "blade": [(0, "rotate(0deg)", "io"), (25, "rotate(10deg)", "io"), (50, "rotate(0deg)", "io"), (75, "rotate(-8deg)", "io"), (100, "rotate(0deg)", None)],
    "torso": [(0, "rotate(0deg)", "io"), (25, "rotate(1.5deg)", "io"), (50, "rotate(0deg)", "io"), (75, "rotate(1.5deg)", "io"), (100, "rotate(0deg)", None)],
    "head":  [(0, "rotate(0deg)", "io"), (25, "rotate(-2deg)", "io"), (50, "rotate(0deg)", "io"), (75, "rotate(-2deg)", "io"), (100, "rotate(0deg)", None)],
  },
})

SPECS.append({
  "key": "golf", "label": "Golf", "dur": 2100,
  "note": "The drive: the body coils, then uncoils into the shot, the club whips through and the ball leaves the tee; a new ball sits on the tee as it settles.",
  "also": "The club sits just above the head, so the swing comes from the body turning, with only a little turn of the club itself.",
  "tree": [("p", [4, 7]), ("g", "wheel", [("p", [5])]),
           ("g", "upper", [("p", [1, 3]), ("g", "head", [("p", [2])]), ("g", "club", [("p", [0])])]),
           ("g", "ball", [("p", [6])])],
  "origins": {"upper": (240, 292), "club": (129.5, 117), "head": (272, 180), "wheel": (173, 378)},
  "keys": {
    "upper": [(0, "rotate(0deg)", "io"), (22, "rotate(-5deg)", "in"), (33, "rotate(7deg)", "out"), (48, "rotate(8deg)", "io"), (82, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "club":  [(0, "rotate(0deg)", "io"), (22, "rotate(-10deg)", "whip"), (33, "rotate(5deg)", "out"), (48, "rotate(6deg)", "io"), (82, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "head":  [(0, "rotate(0deg)", "io"), (22, "rotate(3deg)", "io"), (33, "rotate(-3deg)", "io"), (60, "rotate(-2deg)", "io"), (85, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "wheel": [(0, "rotate(0deg)", "io"), (22, "rotate(-2deg)", "io"), (36, "rotate(3deg)", "io"), (70, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "ball":  [("0%, 32%", "translate(0,0); opacity: 1", "rise"), (52, "translate(60px,-170px); opacity: 0", "lin"), (80, "translate(0,0); opacity: 0", "lin"), (90, "translate(0,0); opacity: 1", None), (100, "translate(0,0); opacity: 1", None)],
  },
})

SPECS.append({
  "key": "rugby", "label": "Rugby", "dur": 2000,
  "note": "Wheelchair rugby: the chair drives in and hits, the body jolts with the stop, the ball goes up in the arm, then everything settles back.",
  "also": "The ball is part of the arm's shape in the drawing, so it stays in hand.",
  "tree": [("g", "chair", [("p", [3, 5, 6, 7, 8]), ("g", "torso", [("p", [1]), ("g", "head", [("p", [0])]), ("g", "arm", [("p", [2])])])])],
  "origins": {"torso": (250, 290), "head": (268, 140), "arm": (232.8, 203.2)},
  "keys": {
    "chair": [(0, "translate(0,0)", "in"), (28, "translate(16px,0)", "lin"), (31, "translate(17px,0)", "io"), (100, "translate(0,0)", None)],
    "torso": [(0, "rotate(0deg)", "io"), (20, "rotate(-1.5deg)", "lin"), (28, "rotate(-1deg)", "out"), (34, "rotate(4deg)", "io"), (46, "rotate(-1.5deg)", "io"), (62, "rotate(.5deg)", "io"), (100, "rotate(0deg)", None)],
    "head":  [(0, "rotate(0deg)", "io"), (28, "rotate(0deg)", "out"), (34, "rotate(5deg)", "io"), (48, "rotate(-2deg)", "io"), (66, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "arm":   [(0, "rotate(0deg)", "io"), (28, "rotate(4deg)", "io"), (44, "rotate(-18deg)", "out"), (60, "rotate(-16deg)", "io"), (88, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
  },
})
