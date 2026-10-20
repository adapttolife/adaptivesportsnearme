"""Split a potrace-style single-path SVG (M/m/c/l/z) into shapes, keeping each
outer shape with the holes inside it (evenodd), all in absolute coordinates."""
import re, sys, json

import sys as _sys
from pathparse import parse

def flatten(sub, n=24):
    pts = [sub["start"]]; p0 = sub["start"]
    segs = []
    for s in sub["segs"]:
        segs.extend(s[7] if s[0] == "A" else [s])
    for s in segs:
        if s[0] == "L": pts.append(s[1]); p0 = s[1]
        else:
            (x1, y1), (x2, y2), (x3, y3) = s[1], s[2], s[3]
            for k in range(1, n + 1):
                t = k / n; u = 1 - t
                pts.append((u**3*p0[0] + 3*u*u*t*x1 + 3*u*t*t*x2 + t**3*x3, u**3*p0[1] + 3*u*u*t*y1 + 3*u*t*t*y2 + t**3*y3))
            p0 = (x3, y3)
    return pts

def inside(pt, poly):
    x, y = pt; c = False
    for i in range(len(poly)):
        x1, y1 = poly[i]; x2, y2 = poly[i - 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1 + 1e-12) + x1: c = not c
    return c

def area(poly):
    return abs(sum(poly[i][0] * poly[i-1][1] - poly[i-1][0] * poly[i][1] for i in range(len(poly)))) / 2

def to_d(sub):
    f = lambda v: f"{v:.2f}".rstrip("0").rstrip(".")
    out = [f"M{f(sub['start'][0])} {f(sub['start'][1])}"]
    for s in sub["segs"]:
        if s[0] == "L": out.append(f"L{f(s[1][0])} {f(s[1][1])}")
        elif s[0] == "A": out.append(f"A{f(s[1])} {f(s[2])} {f(s[3])} {s[4]} {s[5]} {f(s[6][0])} {f(s[6][1])}")
        else: out.append("C" + " ".join(f"{f(a)} {f(b)}" for a, b in s[1:]))
    return "".join(out) + "Z"

def shapes(svg_text):
    d = re.search(r'\sd="([^"]+)"', svg_text).group(1)
    subs = parse(d); polys = [flatten(s) for s in subs]; areas = [area(p) for p in polys]
    parent = []
    for i, p in enumerate(polys):
        # smallest other subpath that contains this one's first point
        cands = [j for j in range(len(polys)) if j != i and areas[j] > areas[i] and inside(p[0], polys[j]) and inside(p[len(p)//2], polys[j])]
        parent.append(min(cands, key=lambda j: areas[j]) if cands else None)
    depth = []
    for i in range(len(polys)):
        k, n = i, 0
        while parent[k] is not None: k = parent[k]; n += 1
        depth.append(n)
    groups = {}
    for i in range(len(polys)):
        owner = i if depth[i] % 2 == 0 else parent[i]
        groups.setdefault(owner, []).append(i)
    out = []
    for owner, members in groups.items():
        xs = [x for m in members for x, _ in polys[m]]; ys = [y for m in members for _, y in polys[m]]
        out.append({"id": owner, "subpaths": members, "d": "".join(to_d(subs[m]) for m in members),
                    "bbox": [round(min(xs), 1), round(min(ys), 1), round(max(xs), 1), round(max(ys), 1)], "area": round(areas[owner])})
    return out

if __name__ == "__main__":
    print(json.dumps(shapes(open(sys.argv[1]).read()), indent=1))
