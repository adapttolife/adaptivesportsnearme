"""The three pilots Alec approved one by one (2026-10-16): basketball ("I love it"),
swimming with the bending arm ("Love it"), tennis ("I love it")."""
SPECS = []
B = "cubic-bezier"

# The shot from the chair. The hand and the ball's lower half are one shape in the
# drawing, so arm and ball move as one: gather (dip), rise into the release, hold the
# follow-through, settle. The body leans into it; the chair rolls a touch and back.
SPECS.append({
  "key": "basketball", "label": "Basketball", "dur": 1600,
  "tree": [("g", "all", [("g", "wheel", [("p", [8])]), ("p", [7]),
                         ("g", "body", [("p", [6]), ("p", [5]), ("g", "arm", [("p", [4]), ("p", [0, 1, 2, 3])])])])],
  "origins": {"arm": (246, 224), "body": (190, 285), "wheel": (169.5, 366)},
  "keys": {
    "arm":   [(0, "rotate(0deg)", f"{B}(.45,0,.55,1)"), (15, "rotate(9deg)", f"{B}(.16,.84,.3,1)"), (31, "rotate(-13deg)", f"{B}(.4,0,.6,1)"),
              (46, "rotate(-11deg)", f"{B}(.45,0,.3,1)"), (74, "rotate(1.5deg)", f"{B}(.45,0,.55,1)"), (88, "rotate(-.5deg)", f"{B}(.45,0,.55,1)"), (100, "rotate(0deg)", None)],
    "body":  [(0, "rotate(0deg)", f"{B}(.45,0,.55,1)"), (15, "rotate(2deg)", f"{B}(.16,.84,.3,1)"), (32, "rotate(-2.6deg)", f"{B}(.4,0,.6,1)"),
              (48, "rotate(-2deg)", f"{B}(.45,0,.3,1)"), (76, "rotate(.6deg)", f"{B}(.45,0,.55,1)"), (100, "rotate(0deg)", None)],
    "wheel": [(0, "rotate(0deg)", f"{B}(.45,0,.55,1)"), (15, "rotate(-3deg)", f"{B}(.16,.84,.3,1)"), (33, "rotate(5deg)", f"{B}(.4,0,.6,1)"),
              (72, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "all":   [(0, "translate(0px,0px)", f"{B}(.45,0,.55,1)"), (15, "translate(-2px,0px)", f"{B}(.16,.84,.3,1)"), (33, "translate(5px,0px)", f"{B}(.4,0,.6,1)"),
              (72, "translate(0px,0px)", None), (100, "translate(0px,0px)", None)],
  },
})

# A freestyle stroke. The arm is part of the body's shape, so it bends at the shoulder:
# it lifts out for the recovery while the head turns up to breathe, then slices in as
# the swimmer surges and the kick throws the drops. The waves roll under.
SW_IO = f"{B}(.45,0,.55,1)"
SPECS.append({
  "key": "swimming", "label": "Swimming", "dur": 1900,
  "tree": [("g", "w10", [("p", [10])]), ("g", "w9", [("p", [9])]), ("g", "w11", [("p", [11])]),
           ("g", "d1", [("p", [1])]), ("g", "d4", [("p", [4])]), ("g", "d7", [("p", [7])]),
           ("g", "swimmer", [("bend", "arm", 0), ("g", "wake", [("p", [8])]), ("g", "head", [("p", [2, 3, 5, 6])])])],
  "origins": {"swimmer": (300, 235), "head": (318, 258), "d1": (157, 250), "d4": (146, 262), "d7": (135, 276), "wake": (243, 315)},
  "delays": {"d4": .035, "d7": .07},
  "bends": {"arm": {"pivot": (312, 162), "cut_a": (290, 158), "cut_b": (330, 170), "ramp": 60, "hand": (468, 220),
                    "keys": [[0, 0], [.12, 3], [.38, -32], [.58, 7], [.78, -2], [1, 0]]}},
  "keys": {
    "swimmer": [(0, "translate(0px,0px) rotate(0deg)", SW_IO), (36, "translate(-4px,2px) rotate(1.2deg)", f"{B}(.3,0,.25,1)"),
                (64, "translate(15px,-4px) rotate(-2deg)", SW_IO), (80, "translate(9px,-1px) rotate(-.6deg)", SW_IO), (100, "translate(0px,0px) rotate(0deg)", None)],
    "head":    [("0%, 14%", "rotate(0deg)", f"{B}(.3,0,.2,1)"), (34, "rotate(-13deg)", SW_IO), (46, "rotate(-12deg)", f"{B}(.45,0,.3,1)"),
                (70, "rotate(1deg)", SW_IO), (100, "rotate(0deg)", None)],
    **{d: [("0%, 30%", "translate(0px,0px) scale(1,1)", SW_IO), (44, "translate(4px,3px) scale(.62,.62)", f"{B}(.12,.8,.3,1)"),
           (62, "translate(-11px,-11px) scale(1.14,1.14)", f"{B}(.4,0,.7,.6)"), (82, "translate(-2px,1px) scale(.98,.98)", SW_IO),
           (100, "translate(0px,0px) scale(1,1)", None)] for d in ("d1", "d4", "d7")},
    "wake":    [("0%, 40%", "translate(0px,0px) scale(1,1)", SW_IO), (50, "translate(3px,0px) scale(.88,.88)", f"{B}(.2,.75,.3,1)"),
                (66, "translate(-10px,0px) scale(1.1,1.1)", SW_IO), (100, "translate(0px,0px) scale(1,1)", None)],
    "w10":     [(0, "translate(0px,0px)", SW_IO), (30, "translate(-12px,4px)", SW_IO), (62, "translate(-5px,-3px)", SW_IO), (100, "translate(0px,0px)", None)],
    "w9":      [(0, "translate(0px,0px)", SW_IO), (24, "translate(7px,-4px)", SW_IO), (56, "translate(-9px,4px)", SW_IO), (100, "translate(0px,0px)", None)],
    "w11":     [(0, "translate(0px,0px)", SW_IO), (36, "translate(-11px,3px)", SW_IO), (70, "translate(4px,-2px)", SW_IO), (100, "translate(0px,0px)", None)],
  },
})

# A forehand: backswing (arm back, racket laid back at the wrist), the swing (arm
# through, wrist snaps, the strings meet the ball where it hangs), follow-through,
# recover. The ball leaves with topspin and comes back to its spot, the next shot.
TN_IO, TN_IN, TN_OUT, TN_WHIP = f"{B}(.45,0,.55,1)", f"{B}(.55,0,.75,.55)", f"{B}(.2,.6,.35,1)", f"{B}(.6,0,.8,.5)"
SPECS.append({
  "key": "tennis", "label": "Tennis", "dur": 1800,
  "tree": [("g", "all", [("g", "wheel", [("p", [9])]), ("p", [8]),
                         ("g", "body", [("p", [7]), ("p", [4]), ("g", "arm", [("p", [6]), ("g", "racket", [("p", [0])])])])]),
           ("g", "ball", [("g", "spin", [("p", [2, 3])])])],
  "origins": {"arm": (206, 250), "racket": (331, 199), "body": (175, 292), "wheel": (138.5, 368), "ball": (461.3, 134.4), "spin": (461.3, 134.4)},
  "keys": {
    "arm":    [(0, "rotate(0deg)", TN_IO), (20, "rotate(-16deg)", TN_IN), (31, "rotate(6deg)", TN_OUT), (46, "rotate(7deg)", TN_IO), (76, "rotate(-1deg)", TN_IO), (100, "rotate(0deg)", None)],
    "racket": [(0, "rotate(0deg)", TN_IO), (20, "rotate(-14deg)", TN_WHIP), (31, "rotate(32deg)", TN_OUT), (46, "rotate(37deg)", TN_IO), (78, "rotate(-2deg)", TN_IO), (100, "rotate(0deg)", None)],
    "body":   [(0, "rotate(0deg)", TN_IO), (20, "rotate(2deg)", TN_IN), (32, "rotate(-3deg)", TN_OUT), (48, "rotate(-3.5deg)", TN_IO), (80, "rotate(.5deg)", TN_IO), (100, "rotate(0deg)", None)],
    "wheel":  [(0, "rotate(0deg)", TN_IO), (20, "rotate(-3deg)", TN_IN), (34, "rotate(4deg)", TN_IO), (70, "rotate(0deg)", None), (100, "rotate(0deg)", None)],
    "all":    [(0, "translate(0px,0px)", TN_IO), (20, "translate(-2px,0px)", TN_IN), (34, "translate(4px,0px)", TN_IO), (70, "translate(0px,0px)", None), (100, "translate(0px,0px)", None)],
    "ball":   [("0%, 30%", "translate(0px,0px) scale(1,1)", "linear"), (32, "translate(2px,-1px) scale(.86,1.1)", f"{B}(.15,.7,.35,1)"),
               (56, "translate(60px,-44px) scale(1,1)", TN_IO), (94, "translate(-1px,1px) scale(1,1)", TN_IO), (100, "translate(0px,0px) scale(1,1)", None)],
    "spin":   [("0%, 31%", "rotate(0deg)", f"{B}(.2,.6,.4,1)"), (56, "rotate(320deg)", TN_IO), (100, "rotate(720deg)", None)],
  },
})
