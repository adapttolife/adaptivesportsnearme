"""A bat swing seen from the side, drawn with the drawing's own flat shapes.

The swing turns about the batter's spine. The arms are a horizontal tube, so turning
them toward or away from us only shortens them along their length: a horizontal scale
about the spine. The bat is a cylinder, so it never gets thinner: it is turned to
where its 3D direction points on screen and shortened along its own axis.

Each control is a list of (percent, value); values between are a smooth monotone
cubic, then written out as dense linear keyframes."""
import math

def _hermite(ctrl):
    ts = [c[0] for c in ctrl]; vs = [c[1] for c in ctrl]; n = len(ts)
    d = [(vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]) for i in range(n - 1)]
    m = [d[0]] + [0.0 if d[i - 1] * d[i] <= 0 else (d[i - 1] + d[i]) / 2 for i in range(1, n - 1)] + [d[-1]]
    m[0] = m[-1] = 0.0                                   # start and end at rest
    for i in range(n - 1):                                # Fritsch-Carlson: no overshoot between points
        if d[i] == 0: m[i] = m[i + 1] = 0.0; continue
        a, b = m[i] / d[i], m[i + 1] / d[i]; s = a * a + b * b
        if s > 9: t = 3 / math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]
    def f(t):
        if t <= ts[0]: return vs[0]
        if t >= ts[-1]: return vs[-1]
        i = max(k for k in range(n - 1) if ts[k] <= t); h = ts[i + 1] - ts[i]; u = (t - ts[i]) / h
        h00, h10, h01, h11 = 2*u**3 - 3*u**2 + 1, u**3 - 2*u**2 + u, -2*u**3 + 3*u**2, u**3 - u**2
        return h00 * vs[i] + h10 * h * m[i] + h01 * vs[i + 1] + h11 * h * m[i + 1]
    return f

def swing(spine, grip, rest, phi0, ctrl, times):
    """spine: (x, y) the arms turn about; grip: the bat's pivot in drawing units;
    rest: (r, a) of the hands at rest; phi0: the bat's drawn direction (deg);
    ctrl: {"a","r","dy","beta","gamma"} -> [(pct, value)]; times: percents to key."""
    F = {k: _hermite(v) for k, v in ctrl.items()}
    r0, a0 = rest; base = r0 * math.cos(math.radians(a0))
    arms, bat, prev = [], [], None
    for t in times:
        a, r, dy, be, ga = (F[k](t) for k in ("a", "r", "dy", "beta", "gamma"))
        sx = r * math.cos(math.radians(a)) / base
        hx = spine[0] + sx * (grip[0] - spine[0]); hy = grip[1] + dy
        cb, sb, cg = math.cos(math.radians(be)), math.sin(math.radians(be)), math.cos(math.radians(ga))
        psi = math.degrees(math.atan2(-sb, cb * cg)); fl = math.hypot(cb * cg, sb)
        if prev is not None:
            while psi - prev > 180: psi -= 360
            while psi - prev < -180: psi += 360
        prev = psi
        arms.append((round(t, 3), f"translate(0px,{dy:.2f}px) scale({sx:.4f},1)", "lin"))
        bat.append((round(t, 3), f"translate({hx - grip[0]:.2f}px,{hy - grip[1]:.2f}px) rotate({psi:.3f}deg) scale({fl:.4f},1) rotate({-phi0:.3f}deg)", "lin"))
    return arms, bat

def tip(spine, grip, rest, phi0, ctrl, t, frac):
    """Screen point frac of the way along the bat (from the grip) at time t; length = bat length units."""
    F = {k: _hermite(v) for k, v in ctrl.items()}
    a, r, dy, be, ga = (F[k](t) for k in ("a", "r", "dy", "beta", "gamma"))
    r0, a0 = rest; sx = r * math.cos(math.radians(a)) / (r0 * math.cos(math.radians(a0)))
    hx = spine[0] + sx * (grip[0] - spine[0]); hy = grip[1] + dy
    cb, sb, cg = math.cos(math.radians(be)), math.sin(math.radians(be)), math.cos(math.radians(ga))
    return hx + frac * cb * cg, hy - frac * sb

def times(*spans):
    """spans: (t0, t1, step) ... -> sorted unique percents."""
    out = set()
    for t0, t1, st in spans:
        n = int(round((t1 - t0) / st))
        out.update(round(t0 + (t1 - t0) * i / n, 3) for i in range(n + 1))
    return sorted(out)

def smooth_keys(ctrl, fmt, ts):
    """Dense linear keyframes along a smooth monotone curve through ctrl [(pct, value)]."""
    f = _hermite(ctrl)
    return [(round(t, 3), fmt(f(t)), "lin") for t in ts]

def segment_keys(pivot, rest_end, ctrl_x, ctrl_y, ts):
    """A straight piece (a bowstring) fixed at pivot whose free end follows a path:
    turned toward the end point and stretched along its own axis, never thicker or thinner.
    rest_end is where its end sits in the drawing. Returns (keys, end(t))."""
    fx, fy = _hermite(ctrl_x), _hermite(ctrl_y)
    px, py = pivot; ex, ey = rest_end
    phi0 = math.degrees(math.atan2(ey - py, ex - px)); L0 = math.hypot(ex - px, ey - py)
    keys, prev = [], None
    for t in ts:
        x, y = fx(t), fy(t)
        psi = math.degrees(math.atan2(y - py, x - px)); f = math.hypot(x - px, y - py) / L0
        if prev is not None:
            while psi - prev > 180: psi -= 360
            while psi - prev < -180: psi += 360
        prev = psi
        keys.append((round(t, 3), f"rotate({psi:.3f}deg) scale({f:.4f},1) rotate({-phi0:.3f}deg)", "lin"))
    return keys, (lambda t: (fx(t), fy(t)))
