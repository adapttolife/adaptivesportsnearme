"""Shared parts for the ball sports: balls with seams, arms that stay merged with the body
while they move, a throwing arm whose ball is handed off to a free copy at release, framing, and
keyframe helpers."""
import math
import kit
from kit import circle, diff, union, inter, outline, brush, grow
import figure as F


# ---------------------------------------------------------------- balls
def seam(c, R, a0, a1, w):
    """A thin curved seam (a gap line) along an arc, as one smooth brush stroke (few bytes)."""
    pts = kit.arc_pts(c, R, a0, a1, 4)
    return brush(pts, [w] * len(pts), ("round", "round"), samples=10, err=0.06)


def baseball(c, r, w=0.75):
    """Ball with the two curved stitch seams of a baseball or softball: ')(' ."""
    x, y = c
    seams = union(seam((x - r * 1.5, y), r * 1.16, -50, 50, w), seam((x + r * 1.5, y), r * 1.16, 130, 230, w))
    return diff(circle(x, y, r), seams)


def panel_ball(c, r, w=0.8, deg=0.0):
    """Handball: a pentagon panel at the centre with five seams running out to the rim."""
    x, y = c
    k = 0.36 * r
    pent = [kit.polar(c, k, deg - 90 + 72 * i) for i in range(5)]
    seams = [outline(pent + [pent[0]], w)]
    for i, p in enumerate(pent):
        q = kit.polar(c, r * 1.2, deg - 90 + 72 * i)
        seams.append(outline([p, q], w))
    return diff(circle(x, y, r), union(*seams))


def volley_ball(c, r, w=0.85, deg=0.0):
    """Volleyball-type ball (also the wheelchair rugby ball): three panel seams curling out from the
    centre like a pinwheel; 3-fold symmetric, so a 120-degree spin lands on the same drawing."""
    x, y = c
    lines = []
    for k in range(3):
        a = deg + 120 * k
        pts = [kit.polar(c, r * 0.12, a), kit.polar(c, r * 0.5, a + 22), kit.polar(c, r * 0.86, a + 52),
               kit.polar(c, r * 1.2, a + 74)]
        lines.append(brush(pts, [w] * 4, ("round", "round"), samples=10, err=0.06))
    return diff(circle(x, y, r), union(*lines))


def football(c, length, width, deg, w=0.7, stitches=3):
    """American football side-on: a lens with blunt points, laces along the top as gaps."""
    u = (math.cos(math.radians(deg)), math.sin(math.radians(deg)))
    n = (u[1], -u[0])                                   # 'up' of the ball when deg = 0
    L = length / 2

    def at(t, s=0.0):
        return (c[0] + u[0] * t + n[0] * s, c[1] + u[1] * t + n[1] * s)
    body = brush([at(-L), at(-L * 0.55), at(0), at(L * 0.55), at(L)],
                 [0.0, width * 0.8, width, width * 0.8, 0.0], ("point", "point"))
    off = width * 0.2

    def bar(a, b):
        return brush([a, b], [w, w], ("round", "round"), samples=4)
    lace = [bar(at(-L * 0.36, off), at(L * 0.36, off))]
    for i in range(stitches):
        t = -L * 0.24 + (L * 0.48) * i / max(1, stitches - 1)
        lace.append(bar(at(t, off - 1.05), at(t, off + 1.05)))
    return diff(body, union(*lace))


def helmet(hd, r, w=1.5):
    """Football helmet: the head circle with a face-guard cage merged onto its lower front
    (two bars and an upright); the white windows between them do the drawing."""
    x, y = hd
    front = x + r + 3.4
    top, bot = y - 0.4, y + 4.4
    cage = union(outline([(x + r * 0.5, top), (front, top)], w),
                 outline([(x + r * 0.2, bot), (front - 0.9, bot)], w),
                 outline([(front, top - 1.0), (front, top), (front - 0.9, bot)], w))
    return union(circle(x, y, r), cage)


def wiffle(c, r, hole=0.62, ring=0.52):
    """Perforated ball (pickleball): a centre hole and four around it, as gaps."""
    x, y = c
    holes = [circle(x, y, hole)] + [circle(*kit.polar(c, r * ring, a), hole) for a in (-135, -45, 45, 135)]
    return diff(circle(x, y, r), union(*holes))


def arc_frames(p0, p1, apex_h, n, t0, t1):
    """[(pct, (x, y))] for a ball flying p0 -> p1 along a parabola that rises apex_h above the chord,
    sampled n times between t0 and t1 percent (play them with linear easing)."""
    out = []
    for i in range(n + 1):
        u = i / n
        x = p0[0] + (p1[0] - p0[0]) * u
        y = p0[1] + (p1[1] - p0[1]) * u - 4 * apex_h * u * (1 - u)
        out.append((t0 + (t1 - t0) * u, (x, y)))
    return out


# ---------------------------------------------------------------- arms
def body_zone(P, lean=0.0, extra=(), official=True):
    """Where an arm must stay merged with the body: the torso (+ swoosh back), grown past one gap."""
    b = P(F.body(lean)) if official else union(P(F.torso(lean)), P(F.back(lean)))
    return grow(union(b, *extra), kit.GAP + 0.5)


def add_arm(ic, path, zone, group, merge="body"):
    """Add a moving arm in two pieces: the root inside the body zone never cuts the body
    (so the moving copy matches the merged static drawing), the rest keeps its white gap."""
    root = inter(path, zone)
    if abs(root.area) > 0.01:
        ic.add(root, group=group, gap=False, merge=merge)
    ic.add(diff(path, zone), group=group, merge=merge)


# ---------------------------------------------------------------- throwing arm + hand-off
def pose_of(ic, group, pct, c):
    """Where point c of a group sits at pct of the loop, and how far the group has turned (degrees)."""
    M, vis = kit.chain_matrix(ic, group, pct)
    a, b, cc, d, e, f = M
    return (a * c[0] + cc * c[1] + e, b * c[0] + d * c[1] + f), math.degrees(math.atan2(b, a))


def two_part_arm(ic, ua0, fa0, keys, sh, elbow, dur, held=None, release=None, gone=None, back=None):
    """Motions for an arm in two groups: 'ua' (upper arm, about the shoulder) and 'fa' (forearm,
    a child, about the elbow). keys: [(pct, upper-arm direction, forearm direction, easing|None)]
    in screen degrees, so poses are written the way they look.

    held: a ball group that rides in the hand. It is a SIBLING of the forearm (same parent, the
    same rotation track) so the two cut white gaps into each other like unrelated shapes, and it
    carries opacity: shown until `release`, hidden after, fading back in from `gone` to `back`.
    keys must contain release, release + 0.6, gone and back as key times."""
    ua, fa, hb = [], [], []
    for pct, a, b, e in keys:
        r1, r2 = a - ua0, (b - fa0) - (a - ua0)
        ua.append((pct, rz(r1, e)))
        fa.append((pct, rz(r2, e)))
        if held:
            op = 1.0 if (pct <= release or pct >= back) else 0.0
            hb.append((pct, rz(r2, e) + f";opacity:{fmt(op)}"))
    ic.motion(kit.Motion("ua", ua, pivot=sh, dur=dur))
    ic.motion(kit.Motion("fa", fa, pivot=elbow, dur=dur, parent="ua"))
    if held:
        ic.motion(kit.Motion(held, hb, pivot=elbow, dur=dur, parent="ua"))


def fly(ic, held, flight, c, release, dur, path, ease="linear"):
    """The free copy of a held ball: invisible until `release`, then it takes over from the held
    copy at the same place and turn and follows path [(pct, dx, dy, ddeg, opacity)] (from the
    release point), ending invisible. c is the ball centre in icon space."""
    eps = 0.6
    p0, a0 = pose_of(ic, held, release, c)
    dx0, dy0 = p0[0] - c[0], p0[1] - c[1]
    fr = [(0, tr(dx0, dy0, a0, 0)), (release, tr(dx0, dy0, a0, 0)), (release + eps, tr(dx0, dy0, a0, 1))]
    for pct, dx, dy, dd, op in path:
        fr.append((pct, tr(dx0 + dx, dy0 + dy, a0 + dd, op)))
    fr.append((100, tr(dx0, dy0, a0, 0)))
    ic.motion(kit.Motion(flight, fr, pivot=c, dur=dur, ease=ease))


# ---------------------------------------------------------------- framing
def settle(ic, margin=6.0, travel=3.0, dy=0.0):
    """Centre the rest pose (as finish() does) so the athlete sits where it does in every icon, then
    nudge only as far as needed to keep everything the motion shows `travel` units inside the box."""
    ic.finish(margin=margin, dy=dy)
    x0, y0, x1, y1 = ic.sweep_bounds()
    dx = max(0.0, travel - x0) - max(0.0, x1 - (120 - travel))
    dy_ = max(0.0, travel - y0) - max(0.0, y1 - (120 - travel))
    if dx or dy_:
        bx0, by0, bx1, by1 = ic.bounds()
        if bx0 + dx < 0.5 or bx1 + dx > 119.5 or by0 + dy_ < 0.5 or by1 + dy_ > 119.5:
            raise ValueError(f"{ic.key}: the motion does not fit the box")
        for p in ic.parts:
            p.path = kit.move(p.path, dx, dy_)
        for m in ic.motions.values():
            m.pivot = (m.pivot[0] + dx, m.pivot[1] + dy_)
            if m.clip is not None:
                m.clip = kit.move(m.clip, dx, dy_)
    return ic


# ---------------------------------------------------------------- keyframes
def fmt(v):
    return kit._fmt(v)


def tr(dx=0.0, dy=0.0, deg=0.0, op=None, ease=None):
    """One keyframe declaration: translate + rotate (always both, so CSS interpolates cleanly)."""
    s = f"transform:translate({fmt(dx)}px,{fmt(dy)}px) rotate({fmt(deg)}deg)"
    if op is not None:
        s += f";opacity:{fmt(op)}"
    if ease:
        s += f";animation-timing-function:{ease}"
    return s


def rz(deg, ease=None):
    s = f"transform:rotate({fmt(deg)}deg)"
    if ease:
        s += f";animation-timing-function:{ease}"
    return s
