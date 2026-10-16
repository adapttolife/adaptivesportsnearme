"""The sport drawings in motion: turn a spec (which of the drawing's own shapes sit in
which moving group, where each group turns, and its keyframes) into the data the site
plays. Nothing is redrawn: every path is one of the shapes of the sport's SVG in
public/emblems/sports, so at rest the figure is the drawing exactly."""
import hashlib, json, math, pathlib, re
from svgparts import shapes
from bend import arm_rig

ROOT = pathlib.Path(__file__).resolve().parents[3]
SPORTS = ROOT / "public" / "emblems" / "sports"

# Named easings used by the specs; a spec may also give any cubic-bezier() directly.
EASE = {"io": "cubic-bezier(.45,0,.55,1)", "out": "cubic-bezier(.2,.7,.3,1)", "in": "cubic-bezier(.55,0,.75,.55)",
        "snap": "cubic-bezier(.2,.6,.35,1)", "lin": "linear", "fall": "cubic-bezier(.6,0,.85,.4)", "rise": "cubic-bezier(.15,.65,.35,1)",
        "whip": "cubic-bezier(.6,0,.8,.5)", "soft": "cubic-bezier(.3,0,.25,1)", "settle": "cubic-bezier(.45,0,.3,1)"}

def load(key):
    """The drawing's separate shapes (holes kept with their outline), by id."""
    return {g["id"]: g for g in shapes((SPORTS / f"{key}.svg").read_text())}

def drawing_hash(key):
    """sha256 of the drawing's path data: the same for sports that share a drawing."""
    svg = (SPORTS / f"{key}.svg").read_text()
    return hashlib.sha256("".join(re.findall(r'\sd="([^"]+)"', svg)).encode()).hexdigest()

def _circle(cx, cy, r):
    return f"M{cx - r:.2f} {cy:.2f}a{r:.2f} {r:.2f} 0 1 0 {2 * r:.2f} 0a{r:.2f} {r:.2f} 0 1 0 {-2 * r:.2f} 0Z"

def _sector(px, py, r, a0, a1, R=900, steps=32):
    pts = []
    for k in range(steps + 1):
        t = math.radians(a0 + (a1 - a0) * k / steps); pts.append((px + r * math.cos(t), py + r * math.sin(t)))
    for k in range(steps, -1, -1):
        t = math.radians(a0 + (a1 - a0) * k / steps); pts.append((px + R * math.cos(t), py + R * math.sin(t)))
    return "M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in pts) + "Z"

BIG = "M-900 -900H1400V1400H-900Z"

class Figure:
    """Walks a spec's tree into SVG markup. Moving groups carry data-m (their index in
    the animation list), bending paths data-b, and clip ids start with '@' so the
    page can make them unique per figure."""
    def __init__(self, spec):
        self.spec, self.key = spec, spec["key"]
        self.parts = load(spec.get("drawing", spec["key"]))
        self.groups, self.bends, self.nclip = [], [], 0

    def clip_id(self):
        self.nclip += 1; return f"@c{self.nclip}"

    def group(self, cls, inner, attrs=""):
        if cls not in self.spec.get("keys", {}): return f"<g{attrs}>{inner}</g>"
        self.groups.append(cls)
        return f'<g data-m="{len(self.groups) - 1}"{attrs}>{inner}</g>'

    def node(self, n):
        kind, P = n[0], self.parts
        if kind == "p":
            return f'<path fill-rule="evenodd" d="{"".join(P[i]["d"] for i in n[1])}"/>'
        if kind == "g":
            return self.group(n[1], "".join(self.node(k) for k in n[2]))
        if kind == "bend":
            cls, sid = n[1], n[2]; b = self.spec["bends"][cls]
            rig = arm_rig(P[sid]["d"], b["pivot"], b["cut_a"], b["cut_b"], b.get("ramp", 60), b["hand"])
            self.bends.append((rig, b["keys"], bool(b.get("lin"))))
            return f'<path fill-rule="evenodd" data-b="{len(self.bends) - 1}" d="{P[sid]["d"]}"/>'
        if kind == "joint":
            # A rigid part held in a round knob turns about the knob's centre; the knob
            # never changes. The part beyond the knob's circle (inside the sector) moves.
            cls, sid, j = n[1], n[2], n[3]; px, py = j["pivot"]; r = j["r"]; d = P[sid]["d"]
            cin, cout = self.clip_id(), self.clip_id()
            if j.get("knob"):
                inner = _circle(px, py, r + .8) + _sector(px, py, r - 1, j["a0"], j["a1"])
                outer = BIG + _circle(px, py, r) + _sector(px, py, r, j["a0"], j["a1"])
            else:
                inner = _sector(px, py, r - 1, j["a0"], j["a1"])
                outer = BIG + _sector(px, py, r, j["a0"], j["a1"])
            out = (f'<defs><clipPath id="{cin}" clipPathUnits="userSpaceOnUse"><path d="{inner}"/></clipPath>'
                   f'<clipPath id="{cout}" clipPathUnits="userSpaceOnUse"><path clip-rule="evenodd" d="{outer}"/></clipPath></defs>'
                   f'<path fill-rule="evenodd" d="{d}" clip-path="url(#{cout})"/>')
            if j.get("cap"):   # a disc shown only while the part turns, so the old handle stub never shows
                cap = f'<path d="{_circle(px, py, r + .3)}"/>'
                out += self.group(f"{cls}-cap", cap, ' style="opacity:0"') if f"{cls}-cap" in self.spec["keys"] else ""
            return out + self.group(cls, f'<path fill-rule="evenodd" d="{d}" clip-path="url(#{cin})"/>')
        if kind == "cut":
            # One shape split along a circle: "in" keeps what is inside (a ball drawn into a hand).
            sid, (cx, cy, r), side = n[1], n[2], n[3]; cid = self.clip_id()
            dd = _circle(cx, cy, r) if side == "in" else BIG + _circle(cx, cy, r)
            return (f'<defs><clipPath id="{cid}" clipPathUnits="userSpaceOnUse"><path clip-rule="evenodd" d="{dd}"/></clipPath></defs>'
                    f'<path fill-rule="evenodd" d="{P[sid]["d"]}" clip-path="url(#{cid})"/>')
        if kind == "clip":
            # One shape cut along lines of the drawing itself; nested clips intersect.
            sid, clips = n[1], n[2]; defs = head = tail = ""
            for cd, rule in clips:
                cid = self.clip_id()
                defs += f'<clipPath id="{cid}" clipPathUnits="userSpaceOnUse"><path clip-rule="{rule}" d="{cd}"/></clipPath>'
                head += f'<g clip-path="url(#{cid})">'; tail += "</g>"
            return f"<defs>{defs}</defs>{head}" + f'<path fill-rule="evenodd" d="{P[sid]["d"]}"/>' + tail
        raise ValueError(kind)

# ---------------------------------------------------------------- keyframes
_NUM = re.compile(r"-?\d*\.?\d+(?:e-?\d+)?")
TOL = {"translate": .08, "rotate": .04, "scale": .002, "scaleX": .002, "opacity": .004}

def _rows(keys):
    """Spec keys (percent, 'transform[; opacity: x]', ease) as [offset, transform, opacity, easing]."""
    rows = []
    for pct, tf, ease in keys:
        tparts = tf.split(";"); t = tparts[0].strip()
        op = None
        for extra in tparts[1:]:
            if "opacity" in extra: op = float(extra.split(":")[1])
        easing = "ease" if ease is None else EASE.get(ease, ease)
        for p in (pct.replace("%", "").split(",") if isinstance(pct, str) else [pct]):
            rows.append([round(float(p) / 100, 5), t, op, easing])
    rows.sort(key=lambda r: r[0])
    out = []
    for r in rows:                                 # exact duplicates add nothing
        if out and out[-1][:3] == r[:3] and out[-1][0] == r[0]: out[-1] = r; continue
        out.append(r)
    return out

def _vec(row):
    """The row's numbers with a tolerance for each (by transform function)."""
    vals, tols = [], []
    for name, args in re.findall(r"(\w+)\(([^)]*)\)", row[1]):
        for v in _NUM.findall(args): vals.append(float(v)); tols.append(TOL.get(name, .05))
    if row[2] is not None: vals.append(row[2]); tols.append(TOL["opacity"])
    return vals, tols

def simplify(rows):
    """Drop keyframes inside a run of linear segments that sit on the straight line
    between their neighbours (within a hair), so dense curves ship light."""
    if len(rows) < 3: return rows
    keep = [True] * len(rows)
    def shape(r): return re.sub(r"[-\d.e]+", "#", r[1]) + ("|o" if r[2] is not None else "")
    i = 0
    while i < len(rows) - 1:
        j = i
        while j + 1 < len(rows) and rows[j][3] == "linear" and shape(rows[j + 1]) == shape(rows[i]): j += 1
        if j - i >= 2: _rdp(rows, i, j, keep)
        i = max(j, i + 1)
    return [r for r, k in zip(rows, keep) if k]

def _rdp(rows, a, b, keep):
    va, tol = _vec(rows[a]); vb, _ = _vec(rows[b]); ta, tb = rows[a][0], rows[b][0]
    worst, wi = 0, None
    for m in range(a + 1, b):
        vm, _ = _vec(rows[m]); u = (rows[m][0] - ta) / (tb - ta) if tb > ta else 0
        err = max(abs(vm[q] - (va[q] + (vb[q] - va[q]) * u)) / tol[q] for q in range(len(vm)))
        if err > worst: worst, wi = err, m
    if worst <= 1:
        for m in range(a + 1, b): keep[m] = False
    else:
        _rdp(rows, a, wi, keep); _rdp(rows, wi, b, keep)

def _num(x):
    s = f"{x:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s

def _compact(t):
    return re.sub(r"-?\d+\.\d+", lambda m: _num(float(m.group())), t)

def build(spec):
    """The figure's playable data: markup, moving groups, bends, duration, source."""
    fig = Figure(spec)
    markup = "".join(fig.node(n) for n in spec["tree"])
    dur = spec["dur"]
    moves = []
    for cls in fig.groups:
        rows = simplify(_rows(spec["keys"][cls]))
        frames = []
        for o, t, op, e in rows:
            f = [o, _compact(t)]
            if op is not None or e != "linear": f.append(op if op is None else round(op, 3))
            if e != "linear": f.append(e)
            frames.append(f)
        origin = spec.get("origins", {}).get(cls)
        delay = round(spec.get("delays", {}).get(cls, 0) * dur)
        moves.append([[round(origin[0], 2), round(origin[1], 2)] if origin else None, delay, frames])
    bends = []
    for rig, keys, lin in fig.bends:
        k = [[round(v, 4 if i == 0 else 3) for i, v in enumerate(row)] for row in keys]
        if lin and len(k) > 2:                     # dense, linear: drop points on the line
            k = _simplify_bend(k)
        bends.append([{"pivot": [round(v, 2) for v in rig["pivot"]], "pts": [[round(x, 2), round(y, 2)] for x, y in rig["pts"]],
                       "w": [round(w, 4) for w in rig["w"]], "segs": "".join(rig["segs"])}, k, 1 if lin else 0])
    return {"v": 1, "src": drawing_hash(spec.get("drawing", spec["key"])), "dur": dur, "svg": markup, "m": moves, "b": bends}

def _simplify_bend(k):
    keep = [True] * len(k)
    def rdp(a, b):
        worst, wi = 0, None
        for m in range(a + 1, b):
            u = (k[m][0] - k[a][0]) / (k[b][0] - k[a][0])
            tol = [.04, .08, .08]
            err = max(abs(k[m][q] - (k[a][q] + (k[b][q] - k[a][q]) * u)) / tol[q - 1] for q in range(1, len(k[m])))
            if err > worst: worst, wi = err, m
        if worst <= 1:
            for m in range(a + 1, b): keep[m] = False
        else:
            rdp(a, wi); rdp(wi, b)
    rdp(0, len(k) - 1)
    return [r for r, f in zip(k, keep) if f]
