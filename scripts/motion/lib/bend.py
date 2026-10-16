"""Bend one shape's arm about a shoulder: points along the arm's outline rotate by
angle x weight, the weight easing 0 -> 1 from the shoulder outward, so the arm curves
at the joint instead of breaking. Same commands at every angle (SMIL can morph it)."""
import math, sys
from pathparse import parse

def smooth(t):
    t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)

def arm_bend_paths(d, pivot, cut_a, cut_b, ramp, angles, hand):
    """cut_a/cut_b: points on the outline where the arm starts (shoulder top, armpit).
    The arm is the run of outline points between them that is farther from the pivot."""
    sub = parse(d)[0]
    # flat list of points: start, then each segment's control points and end
    pts, kind = [sub["start"]], ["P"]
    for s in sub["segs"]:
        if s[0] == "C": pts += [s[1], s[2], s[3]]; kind += ["c", "c", "P"]
        elif s[0] == "L": pts.append(s[1]); kind.append("P")
        else: raise ValueError("arcs not expected in this shape")
    anchors = [i for i, k in enumerate(kind) if k == "P"]
    near = lambda q: min(anchors, key=lambda i: (pts[i][0] - q[0]) ** 2 + (pts[i][1] - q[1]) ** 2)
    ia, ib = sorted((near(cut_a), near(cut_b)))
    inside = set(range(ia, ib + 1))
    outside = set(range(len(pts))) - inside
    ih = near(hand)
    arm = inside if ih in inside else outside   # the run that reaches the hand
    # weight: distance along the outline from the nearer cut point, eased over `ramp` units
    def run_dist(i):
        da = math.dist(pts[i], pts[ia]); db = math.dist(pts[i], pts[ib])
        return min(da, db)
    w = [smooth(run_dist(i) / ramp) if i in arm else 0.0 for i in range(len(pts))]
    out = []
    for ang in angles:
        q = []
        for (x, y), wi in zip(pts, w):
            a = math.radians(ang * wi); c, s = math.cos(a), math.sin(a)
            dx, dy = x - pivot[0], y - pivot[1]
            q.append((pivot[0] + c * dx - s * dy, pivot[1] + s * dx + c * dy))
        f = lambda v: f"{v:.2f}"
        dd, k = [f"M{f(q[0][0])} {f(q[0][1])}"], 1
        for s in sub["segs"]:
            if s[0] == "C": dd.append(f"C{f(q[k][0])} {f(q[k][1])} {f(q[k+1][0])} {f(q[k+1][1])} {f(q[k+2][0])} {f(q[k+2][1])}"); k += 3
            else: dd.append(f"L{f(q[k][0])} {f(q[k][1])}"); k += 1
        out.append("".join(dd) + "Z")
    return out, (ia, ib, len(pts))


def arm_rig(d, pivot, cut_a, cut_b, ramp, hand):
    """Points, per-point weights and the segment pattern, for bending in the browser."""
    sub = parse(d)[0]
    pts, kind, pattern = [sub["start"]], ["P"], []
    for seg in sub["segs"]:
        if seg[0] == "C": pts += [seg[1], seg[2], seg[3]]; kind += ["c", "c", "P"]; pattern.append("C")
        elif seg[0] == "L": pts.append(seg[1]); kind.append("P"); pattern.append("L")
    anchors = [i for i, k in enumerate(kind) if k == "P"]
    near = lambda q: min(anchors, key=lambda i: (pts[i][0] - q[0]) ** 2 + (pts[i][1] - q[1]) ** 2)
    ia, ib = sorted((near(cut_a), near(cut_b)))
    inside = set(range(ia, ib + 1)); arm = inside if near(hand) in inside else set(range(len(pts))) - inside
    w = [round(smooth(min(math.dist(pts[i], pts[ia]), math.dist(pts[i], pts[ib])) / ramp), 4) if i in arm else 0 for i in range(len(pts))]
    return {"pivot": list(pivot), "pts": [[round(x, 2), round(y, 2)] for x, y in pts], "w": w, "segs": "".join(pattern)}
