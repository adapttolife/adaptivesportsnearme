"""SVG path scanner: M/m L/l H/h V/v C/c S/s Q/q A/a Z/z -> subpaths of absolute
segments (arcs become cubic Beziers, as the SVG spec's endpoint-to-centre maths)."""
import math, re
NUM = re.compile(r"\s*,?\s*(-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)")
FLAG = re.compile(r"\s*,?\s*([01])")

def arc_to_cubics(x1, y1, rx, ry, phi, fa, fs, x2, y2):
    if rx == 0 or ry == 0 or (x1 == x2 and y1 == y2): return [("L", (x2, y2))]
    rx, ry, phi = abs(rx), abs(ry), math.radians(phi)
    c, s = math.cos(phi), math.sin(phi)
    dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
    x1p, y1p = c * dx + s * dy, -s * dx + c * dy
    lam = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry)
    if lam > 1: rx, ry = rx * math.sqrt(lam), ry * math.sqrt(lam)
    num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
    den = rx * rx * y1p * y1p + ry * ry * x1p * x1p
    co = (-1 if fa == fs else 1) * math.sqrt(max(0, num / den)) if den else 0
    cxp, cyp = co * rx * y1p / ry, -co * ry * x1p / rx
    cx, cy = c * cxp - s * cyp + (x1 + x2) / 2, s * cxp + c * cyp + (y1 + y2) / 2
    ang = lambda ux, uy, vx, vy: math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
    t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
    dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
    if not fs and dt > 0: dt -= 2 * math.pi
    if fs and dt < 0: dt += 2 * math.pi
    n = max(1, math.ceil(abs(dt) / (math.pi / 2) - 1e-9)); step = dt / n
    P = lambda t: (cx + rx * math.cos(t) * c - ry * math.sin(t) * s, cy + rx * math.cos(t) * s + ry * math.sin(t) * c)
    D = lambda t: (-rx * math.sin(t) * c - ry * math.cos(t) * s, -rx * math.sin(t) * s + ry * math.cos(t) * c)
    out = []
    for k in range(n):
        a, b = t1 + k * step, t1 + (k + 1) * step
        al = 4 / 3 * math.tan((b - a) / 4)
        pa, pb, da, db = P(a), P(b), D(a), D(b)
        out.append(("C", (pa[0] + al * da[0], pa[1] + al * da[1]), (pb[0] - al * db[0], pb[1] - al * db[1]), (x2, y2) if k == n - 1 else pb))
    return out

def parse(d):
    i, n = 0, len(d); subs, cur = [], None
    pos = start = (0.0, 0.0); cmd = None; last_ctrl = None; prev = None
    def num():
        nonlocal i
        m = NUM.match(d, i)
        if not m: raise ValueError(f"number expected at {i}: {d[i:i+20]!r}")
        i = m.end(); return float(m.group(1))
    def flag():
        nonlocal i
        m = FLAG.match(d, i)
        if not m: raise ValueError(f"flag expected at {i}")
        i = m.end(); return int(m.group(1))
    def more():
        return NUM.match(d, i) is not None
    while True:
        while i < n and d[i] in " \t\r\n,": i += 1
        if i >= n: break
        if d[i].isalpha(): cmd = d[i]; i += 1
        elif cmd is None: raise ValueError("path must start with a command")
        rel = cmd.islower(); C = cmd.upper()
        ox, oy = (pos if rel else (0.0, 0.0))
        if C == "M":
            pos = (ox + num(), oy + num()); start = pos; cur = {"start": pos, "segs": []}; subs.append(cur)
            cmd = "l" if rel else "L"; last_ctrl = None; prev = "M"; continue
        if C == "Z":
            pos = start; last_ctrl = None; prev = "Z"
            if cur is not None and not cur.get("closed"): cur["closed"] = True
            continue
        if cur is None or cur.get("closed"):
            cur = {"start": pos, "segs": []}; subs.append(cur); start = pos
        if C == "L": p = (ox + num(), oy + num()); cur["segs"].append(("L", p)); pos = p; last_ctrl = None
        elif C == "H": p = ((pos[0] if rel else 0) + num(), pos[1]); cur["segs"].append(("L", p)); pos = p; last_ctrl = None
        elif C == "V": p = (pos[0], (pos[1] if rel else 0) + num()); cur["segs"].append(("L", p)); pos = p; last_ctrl = None
        elif C == "C":
            a = (ox + num(), oy + num()); b = (ox + num(), oy + num()); p = (ox + num(), oy + num())
            cur["segs"].append(("C", a, b, p)); pos = p; last_ctrl = b
        elif C == "S":
            a = (2 * pos[0] - last_ctrl[0], 2 * pos[1] - last_ctrl[1]) if last_ctrl and prev in "CS" else pos
            b = (ox + num(), oy + num()); p = (ox + num(), oy + num())
            cur["segs"].append(("C", a, b, p)); pos = p; last_ctrl = b
        elif C == "Q":
            q = (ox + num(), oy + num()); p = (ox + num(), oy + num())
            a = (pos[0] + 2 / 3 * (q[0] - pos[0]), pos[1] + 2 / 3 * (q[1] - pos[1])); b = (p[0] + 2 / 3 * (q[0] - p[0]), p[1] + 2 / 3 * (q[1] - p[1]))
            cur["segs"].append(("C", a, b, p)); pos = p; last_ctrl = None
        elif C == "A":
            rx, ry, rot = num(), num(), num(); fa, fs = flag(), flag(); p = (ox + num(), oy + num())
            cub = arc_to_cubics(pos[0], pos[1], rx, ry, rot, fa, fs, p[0], p[1])
            cur["segs"].append(("A", rx, ry, rot, fa, fs, p, cub)); pos = p; last_ctrl = None
        else: raise ValueError(f"unsupported command {cmd}")
        prev = C
    return subs
