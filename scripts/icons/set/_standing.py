"""Shared parts for the standing and floor icons (amputee sports, beep baseball, blind sports, climbing,
goalball, powerlifting).

Body: the standing torso and runner of set/running.py, the logo swoosh as a far arm, a two-part
arm that bends at the elbow, the eyeshade head, a prosthetic lower leg. Props: forearm crutch,
sound arcs. Motion: a two-bone solver (so a hand or foot stays put while the body moves),
keyframe samplers, and transforms that keep one function list per motion (CSS interpolates
them part by part, and kit's motion model expects it).
"""
import math
import kit
from kit import brush, circle, union, diff, inter, grow, rotate, add, sub, mul, norm, rot, dist, polar
import figure as F

HIP = (0.0, -15.0)          # standing hip (figure space, as in set/running.py)
SH = (3.0, -34.5)           # standing shoulder
HD = (5.4, -46.8)           # standing head centre (r 6.1, as in set/running.py)


# ---------------------------------------------------------------- body
def standing(lean):
    """Shoulder, head centre and torso of the standing figure, upper body leaned `lean` degrees forward."""
    t = brush([(3.0, -34.0), (1.4, -25.0), (0.2, -16.5)], [12.4, 10.0, 9.0], ("round", "round"))
    return rot(SH, HIP, lean), rot(HD, HIP, lean), rotate(t, lean, HIP)


def swoosh_arm(pts, w0=7.4, fist=None):
    """The logo's back swoosh used as the far arm: tapers to a point, or ends in a fist that holds something."""
    n = len(pts)
    if fist:
        ws = [w0 - (w0 - 4.6) * i / (n - 1) for i in range(n)]
        return union(brush(pts, ws, ("round", "round")), circle(*pts[-1], fist))
    ws = [w0 * (1 - (i / (n - 1)) ** 2.2) for i in range(n)]
    ws[-1] = 0.0
    return brush(pts, ws, ("round", "point"))


def arm2(s, e, h, w0=7.2, w1=4.6, fist=3.4):
    """Two-part arm (upper arm, forearm with fist) so it can bend at the elbow."""
    l1, l2 = dist(s, e), dist(e, h)
    wm = w0 + (w1 - w0) * l1 / (l1 + l2)
    up = brush([s, kit.lerp(s, e, 0.5), e], [w0, (w0 + wm) / 2, wm], ("round", "round"))
    fo = union(brush([e, kit.lerp(e, h, 0.5), h], [wm, (wm + w1) / 2, w1], ("round", "round")), circle(*h, fist))
    return up, fo


def shade_head(c, tilt=0.0, r=F.HEAD_R, h=2.7, front=1.5, gap=0.95, y=-0.6):
    """Head with an eyeshade: an ink band across the eyes, set off by thin gap lines and standing
    proud of the face like goggles (the silhouette change still reads small). tilt turns the band."""
    band = brush([(-r - 0.6, y), (0.0, y - 0.2), (r + front - h / 2, y)], [h, h, h], ("flat", "round"))
    band = kit.move(rotate(band, tilt, (0, 0)), *c)
    hd = circle(c[0], c[1], r)
    return union(diff(hd, grow(band, gap)), inter(band, grow(hd, front + 0.4)))


def pylon(knee, ankle, w0=7.8, toe=4.8):
    """Prosthetic lower leg: a socket under the knee, a slim pylon, a small foot pointing forward (+x)."""
    d = norm(sub(ankle, knee))
    sock = add(knee, mul(d, dist(knee, ankle) * 0.42))
    socket = brush([knee, kit.lerp(knee, sock, 0.5), sock], [w0, 7.0, 5.8], ("round", "round"))
    rod = brush([sock, ankle], [2.8, 2.8], ("round", "round"))
    fwd = (d[1], -d[0]) if d[1] > 0 else (1.0, 0.0)
    if fwd[0] < 0:
        fwd = (-fwd[0], -fwd[1])
    foot = brush([add(ankle, mul(fwd, -1.6)), add(ankle, mul(fwd, 1.4)), add(ankle, mul(fwd, toe))], [3.6, 3.0, 0.0],
                 ("round", "point"))
    return union(socket, rod, foot)


# ---------------------------------------------------------------- runner (set/running.py's figure, posable)
RUN_STRIDE = [(0.0, 56, 78), (0.2, 26, 14), (0.5, -26, 16), (0.75, -6, 108)]


def run_pose(t):
    """(thigh swing, knee bend) at stride phase t, cosine-blended between running.py's key poses."""
    t %= 1.0
    keys = RUN_STRIDE + [(1.0,) + RUN_STRIDE[0][1:]]
    for (t0, a0, b0), (t1, a1, b1) in zip(keys, keys[1:]):
        if t0 <= t <= t1:
            u = smooth((t - t0) / (t1 - t0))
            return a0 + (a1 - a0) * u, b0 + (b1 - b0) * u


def runner(lean=14.0, phase=0.0, shade=False, hip=(0.0, -15.0)):
    """The running figure of set/running.py in figure space: a dict of shapes and key points."""
    sh = rot((hip[0] + 3.0, hip[1] - 19.5), hip, lean)
    hd = rot((hip[0] + 5.4, hip[1] - 31.8), hip, lean)
    torso = rotate(brush([(hip[0] + 3.0, hip[1] - 19.0), (hip[0] + 1.4, hip[1] - 10.0), (hip[0] + 0.2, hip[1] - 1.5)],
                         [12.4, 10.0, 9.0], ("round", "round")), lean, hip)
    sw_pts = [sh] + [rot((hip[0] + x, hip[1] + y), hip, lean)
                     for x, y in ((-4.0, -18.0), (-11.0, -13.0), (-15.0, -6.0), (-16.6, 0.4))]
    th0, ph0 = run_pose(phase + 0.5)
    k2, a2 = F.leg_points(hip, th0, ph0)
    th1, ph1 = run_pose(phase)
    k1, a1 = F.leg_points(hip, th1, ph1)
    el = rot((hip[0] + 9.6, hip[1] - 9.0), hip, lean)
    fist = rot((hip[0] + 20.0, hip[1] - 12.5), hip, lean)
    return dict(sh=sh, hd=hd, hip=hip, torso=torso, el=el, fist=fist,
                swoosh=brush(sw_pts, [7.4, 7.0, 6.2, 4.2, 0.0], ("round", "point")),
                head=shade_head(hd, tilt=lean * 0.5) if shade else F.head(hd),
                far_leg=union(F.thigh(hip, k2), F.shin(k2, a2)), near_thigh=F.thigh(hip, k1), near_shin=F.shin(k1, a1),
                arm=F.arm([sh, el, fist], w0=7.0, w1=4.8, fist=3.3))


# ---------------------------------------------------------------- props
def crutch(hand, tip, cuff_len=7.0, w=2.5):
    """Forearm crutch: the shaft from above the hand (hidden behind the forearm) to a rubber tip."""
    d = norm(sub(tip, hand))
    top = add(hand, mul(d, -cuff_len))
    shaft = brush([top, kit.lerp(top, tip, 0.5), tip], [w, w, w], ("round", "flat"))
    foot = brush([add(tip, mul(d, -2.6)), add(tip, mul(d, 0.8))], [3.4, 3.8], ("round", "round"))
    return union(shaft, foot)


def sound_arc(c, r, a0, a1, w=1.9):
    """One sound arc: a short calligraphic arc that swells in the middle and ends round."""
    n = 6
    pts = [polar(c, r, a0 + (a1 - a0) * i / n) for i in range(n + 1)]
    ws = [w * (0.62 + 0.38 * math.sin(math.pi * i / n)) for i in range(n + 1)]
    return brush(pts, ws, ("round", "round"))


# ---------------------------------------------------------------- solving and keyframes
def ik(s, t, l1, l2, bend=1):
    """Elbow (or knee) of a two-bone limb from s reaching t; bend=+1/-1 picks the side."""
    d = dist(s, t)
    d = min(max(d, abs(l1 - l2) + 1e-6), l1 + l2 - 1e-6)
    a = (l1 * l1 - l2 * l2 + d * d) / (2 * d)
    hh = math.sqrt(max(l1 * l1 - a * a, 0.0))
    u = norm(sub(t, s))
    return add(add(s, mul(u, a)), mul((-u[1], u[0]), hh * bend))


def ang(a, b):
    """Direction a->b in degrees (clockwise on screen, as CSS rotate)."""
    return math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))


def wrap(d):
    while d > 180:
        d -= 360
    while d < -180:
        d += 360
    return d


def smooth(u):
    """Cosine ease 0..1 -> 0..1."""
    return (1 - math.cos(math.pi * max(0.0, min(1.0, u)))) / 2


def bump(t, a, b, c, d):
    """0 before a, eases up to 1 by b, holds to c, eases back to 0 by d."""
    if t <= a or t >= d:
        return 0.0
    if t < b:
        return smooth((t - a) / (b - a))
    if t <= c:
        return 1.0
    return smooth(1 - (t - c) / (d - c))


def sampled(n, fn, rest="none"):
    """[(pct, transform)] at n+1 evenly spaced samples; the ends are the rest pose."""
    return [(100 * i / n, rest if i in (0, n) else fn(i / n)) for i in range(n + 1)]


def timed(pcts, fn, rest="none"):
    """[(pct, transform)] at the given loop percentages (0 and 100 are the rest pose)."""
    return [(p, rest if p in (0.0, 100.0) else fn(p / 100.0)) for p in sorted(set([0.0, 100.0] + list(pcts)))]


def tr(t=None, r=None, s=None):
    """CSS transform with a fixed function list (keyframes of one motion must match)."""
    parts = []
    if t is not None:
        parts.append(f"translate({kit._num(t[0], 2)}px,{kit._num(t[1], 2)}px)")
    if r is not None:
        parts.append(f"rotate({kit._num(r, 1)}deg)")
    if s is not None:
        parts.append(f"scale({kit._num(s[0], 3)},{kit._num(s[1], 3)})")
    return " ".join(parts) or "none"


def stretch(a, b0, b1, rest=False):
    """CSS that maps segment a->b0 onto a->b1 about pivot a: turn, and stretch along the segment only
    (a rope or tether keeps its width)."""
    th0 = ang(a, b0)
    if rest:
        return f"rotate({kit._num(th0, 1)}deg) scale(1,1) rotate({kit._num(-th0, 1)}deg)"
    k = dist(a, b1) / dist(a, b0)
    return f"rotate({kit._num(th0 + wrap(ang(a, b1) - th0), 1)}deg) scale({kit._num(k, 3)},1) rotate({kit._num(-th0, 1)}deg)"
