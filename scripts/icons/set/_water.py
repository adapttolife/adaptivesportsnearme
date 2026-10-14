"""Lane C helpers (boats, boards, skis, sleds): two-joint arms that can follow a moving grip."""
import math
import kit
from kit import brush, circle, union, add, sub, mul, norm, dist


def elbow(S, T, L1, L2, bend=1):
    """Elbow for a shoulder S reaching hand target T with upper arm L1 and forearm L2.
    bend=+1 puts the elbow on the clockwise side of S->T (below it for a hand reaching right)."""
    d = dist(S, T)
    d = max(min(d, L1 + L2 - 1e-6), abs(L1 - L2) + 1e-6)
    a = (L1 * L1 - L2 * L2 + d * d) / (2 * d)
    h = math.sqrt(max(0.0, L1 * L1 - a * a))
    u = norm(sub(T, S))
    n = (-u[1], u[0])
    return add(add(S, mul(u, a)), mul(n, h * bend))


def ang(a, b):
    return math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))


def wrap180(d):
    while d > 180:
        d -= 360
    while d < -180:
        d += 360
    return d


def arm2(S, E, H, w=(7.2, 5.9, 4.6), fist=3.4):
    """Arm in two pieces (upper arm; forearm with fist). Two straight brushes never fold over
    themselves at a tight elbow, and they can turn separately (shoulder, then elbow)."""
    up = brush([S, kit.lerp(S, E, 0.5), E], [w[0], (w[0] + w[1]) / 2, w[1]], ("round", "round"))
    fo = union(brush([E, kit.lerp(E, H, 0.5), H], [w[1], (w[1] + w[2]) / 2, w[2]], ("round", "round")), circle(*H, fist))
    return up, fo


def ik_frames(S, E0, H0, targets, L1=None, L2=None, bend=1):
    """targets: [(pct, hand point)], same space as S/E0/H0. Returns two keyframe angle lists:
    the upper arm about S, and the forearm about E0 (to nest inside the upper arm's group)."""
    L1 = L1 or dist(S, E0)
    L2 = L2 or dist(E0, H0)
    a0 = ang(S, E0)
    b0 = ang(E0, H0)
    up, fo = [], []
    for pct, T in targets:
        E = elbow(S, T, L1, L2, bend)
        a = wrap180(ang(S, E) - a0)
        b = wrap180(ang(E, T) - b0 - a)
        up.append((pct, a))
        fo.append((pct, b))
    return up, fo


def rframes(vals):
    """[(pct, deg)] -> keyframes with rotate(), rest frames written as none."""
    return [(pct, "none" if abs(v) < 0.05 else f"rotate({v:.1f}deg)") for pct, v in vals]
