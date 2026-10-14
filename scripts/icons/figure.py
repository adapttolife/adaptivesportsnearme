"""The ASNM athlete: the Adapt To Life logo figure (brand identity of 2 Sep 2026).

Figure space: the wheel's outer circle has radius 20.4 and centre (0, -0.4);
the official icon (090226_AdaptToLife_Icon.svg, Drive: Logos / FINAL Logo) is
scaled by 0.4646 into it. The seated athlete is about 70 units wide and 69 tall.

The seated pose uses the logo's own curves (OFFICIAL below: head, torso with
the swoosh back, leg, wheel), so the icons carry the exact brand mark. Other
poses build the same body from brush strokes fitted to those curves: torso(),
back(), arm(), thigh(), shin(). Proportions stay fixed: head r 6.1, wheel r
20.4, limbs 4 to 9 wide. Placement moves figure space into the icon box.
"""
from kit import (brush, circle, diff, union, poly, rotate, xf, limb, add, sub, mul, norm, rot, dist,
                 polar, scale as kscale, mirror as kmirror, move, svg)

# The logo's own curves in figure space (generated from the official icon; do not hand-edit).
OFFICIAL = {
    "head": "M20.237 -42.193C20.237 -38.825 17.505 -36.094 14.137 -36.094C10.769 -36.094 8.037 -38.825 8.037 -42.193C8.037 -43.35 8.358 -44.428 8.915 -45.348C8.948 -45.399 8.98 -45.45 9.013 -45.501C10.1 -47.183 11.991 -48.298 14.137 -48.298C15.642 -48.298 17.022 -47.755 18.086 -46.844C18.337 -46.63 18.569 -46.398 18.783 -46.147C19.689 -45.079 20.232 -43.699 20.232 -42.198L20.237 -42.193Z",
    "torso": "M9.96 -35.136C9.593 -35.569 9.166 -35.963 8.622 -36.335C8.26 -36.586 -0.298 -42.426 -12.967 -31.884C-14.727 -30.421 -16.233 -28.735 -17.626 -26.049C-19.174 -23.071 -19.796 -18.342 -19.113 -15.183C-19.085 -15.048 -18.899 -15.025 -18.839 -15.15L-17.148 -18.621C-15.908 -21.167 -14.161 -23.448 -11.963 -25.227C-11.684 -25.455 -11.401 -25.673 -11.113 -25.877C-10.597 -26.249 -10.044 -26.532 -9.515 -26.848C-4.976 -29.524 -0.177 -28.442 -0.089 -28.423C-0.409 -25.966 -1.747 -21.901 0.274 -18.412C1.31 -16.623 3.456 -16.479 3.563 -16.46C5.31 -16.177 7.057 -16.911 7.006 -16.971C7.038 -17.004 6.931 -17.106 6.852 -17.194C5.998 -18.193 6.076 -18.848 6.053 -19.136C5.937 -20.711 9.519 -26.328 10.174 -27.745C10.346 -28.112 12.59 -32.056 9.965 -35.146L9.96 -35.136Z",
    "leg": "M49.84 19.224C48.939 18.848 48.274 18.49 46.774 17.612C45.269 16.734 44.511 16.139 42.495 14.258C42.133 13.919 40.637 12.232 40.163 11.624C39.624 10.936 37.71 7.967 37.148 6.955C36.414 5.635 35.02 2.708 34.379 1.143C33.366 -1.324 33.199 -1.738 32.655 -3.169C32.339 -4 31.847 -5.208 31.573 -5.859C31.289 -6.514 29.556 -9.891 29.031 -10.792C28.279 -12.089 27.791 -12.762 26.936 -13.673C26.081 -14.574 25.189 -15.28 24.446 -15.633C23.666 -16.005 21.593 -17.022 19.271 -17.041C17.593 -17.055 16.163 -16.985 14.973 -16.734C13.951 -16.521 10.806 -15.578 9.635 -15.146C9.115 -14.955 8.204 -14.648 7.619 -14.467C7.034 -14.286 6.425 -14.086 6.267 -14.026C6.109 -13.966 5.57 -13.835 5.082 -13.743C2.764 -13.301 0.608 -13.729 -0.86 -15.248C-4 -18.504 -2.992 -24.214 -2.969 -24.456C-2.95 -24.656 -3.006 -24.683 -3.057 -24.609C-3.08 -24.572 -3.113 -24.53 -3.141 -24.484C-3.726 -23.541 -4.85 -21.097 -5.427 -19.522C-5.942 -18.137 -6.463 -15.931 -6.63 -14.481C-6.853 -12.544 -6.393 -9.863 -5.626 -8.562C-4.781 -7.132 -3.643 -5.859 -1.942 -5.208C-0.762 -4.758 -0.256 -4.683 1.561 -4.655C3.224 -4.632 4.66 -5.022 5.998 -5.394C7.34 -5.775 9.05 -6.221 10.188 -6.653C13.329 -7.842 15.837 -8.395 17.821 -7.801C18.648 -7.554 19.373 -7.238 20.177 -6.63C21.449 -5.659 22.077 -4.748 24.005 -1.078C25.008 0.827 25.217 1.208 25.454 1.612C25.589 1.849 25.947 2.476 26.239 2.996C26.532 3.517 26.992 4.293 27.261 4.711C27.531 5.138 28.005 5.872 28.307 6.355C30.871 10.397 34.216 13.988 37.426 16.135C38.035 16.544 38.653 16.92 39.285 17.259C41.538 18.476 43.944 19.271 46.611 19.684C46.718 19.703 46.839 19.717 46.964 19.731C48.451 19.902 51.104 19.921 51.28 19.744C51.285 19.74 51.29 19.731 51.29 19.726C51.29 19.661 50.435 19.461 49.849 19.22L49.84 19.224Z",
    "wheel": "M20.06 -2.667C19.786 -3.276 19.289 -3.958 18.815 -4.33C18.286 -4.744 17.71 -4.948 17.082 -5.129C16.367 -5.338 13.946 -5.626 12.539 -4.562C12.497 -4.53 12.488 -4.474 12.506 -4.428C13.138 -2.899 13.389 -2.193 13.389 -0.404C13.389 -0.265 13.389 -0.126 13.384 0.009C13.166 7.224 7.066 12.859 -0.2 12.859C-5.041 12.859 -8.776 10.811 -11.132 6.964C-11.132 6.964 -11.387 6.564 -11.387 6.564C-12.632 4.529 -13.464 2.239 -13.464 -0.321C-13.464 -4.446 -12.154 -7.341 -9.231 -9.798C-9.194 -9.831 -9.171 -9.877 -9.18 -9.928C-9.756 -15.015 -8.925 -17.074 -8.432 -18.388C-8.391 -18.495 -8.488 -18.588 -8.595 -18.546Q-9.431 -18.207 -10.119 -17.849C-16.405 -14.569 -20.4 -7.912 -20.4 -0.316C-20.4 8.618 -14.635 16.204 -6.621 18.927C-6.611 18.927 -6.607 18.927 -6.602 18.931C-4.558 19.624 -2.365 20 -0.084 20C0.088 20 0.26 20 0.432 19.995C0.539 19.995 0.646 19.991 0.748 19.986C1.022 19.977 1.296 19.958 1.565 19.935C1.57 19.935 1.579 19.935 1.584 19.935C2.611 19.851 3.619 19.689 4.594 19.461C13.556 17.347 19.638 9.663 20.376 0.083C20.469 -1.138 20.274 -2.161 20.051 -2.658L20.06 -2.667Z",
}

HEAD_R = 6.1
HEAD = (14.35, -42.55)        # the logo's head, nudged 0.4 up-right so the standard gap clears the shoulder
HIP = (2.6, -19.5)            # upper body leans about this point
SHOULDER = (7.6, -31.6)       # front arm starts here (front of the shoulder)


def head(c=HEAD, r=HEAD_R):
    return circle(c[0], c[1], r)


def body(lean=0.0):
    """The logo's torso with its swoosh back, exactly as drawn (leaned about the hip)."""
    b = svg(OFFICIAL["torso"])
    return rotate(b, lean, HIP) if lean else b


def torso(lean=0.0):
    """Torso alone (brush fitted to the logo), for poses that replace the swoosh back."""
    t = brush([(4.8, -32.4), (4.4, -26.0), (3.4, -19.8)], [10.8, 9.8, 7.2], ("round", "round"))   # clears the head by one gap
    return rotate(t, lean, HIP) if lean else t


def back(lean=0.0, sweep=1.0):
    """The logo's swoosh back (the rear arm) as a brush: from the shoulder up, over and down to a point."""
    pts = [(4.0, -34.6), (-1.5, -34.7), (-7.5, -32.6), (-12.6, -29.0), (-16.5, -23.7), (-18.4, -18.9), (-19.0, -15.2)]
    if sweep != 1.0:
        pts = [pts[0]] + [add(pts[0], mul(sub(p, pts[0]), sweep)) for p in pts[1:]]
    b = brush(pts, [8.0, 7.6, 7.2, 6.2, 4.8, 3.0, 0.0], ("round", "point"))
    return rotate(b, lean, HIP) if lean else b


def leg():
    """The logo's seated leg: pointed tail behind the hip, thigh forward, shin down to a pointed foot."""
    return svg(OFFICIAL["leg"])


def wheel(c=(0.0, 0.0)):
    """The logo's wheel: a brush-pen C, heavy at the bottom, open at the top where the hip sits."""
    w = svg(OFFICIAL["wheel"])
    return move(w, c[0], c[1]) if c != (0.0, 0.0) else w


def upper(lean=0.0):
    """Shoulder point and head centre after leaning the upper body."""
    return rot(SHOULDER, HIP, lean), rot(HEAD, HIP, lean)


def arm(points, w0=7.2, w1=4.6, fist=3.4):
    """Arm from the shoulder through elbow to hand, ending in a round fist."""
    return limb(points, w0, w1, end_r=fist)


class Placement:
    """Figure space -> icon space."""

    def __init__(self, x, y, s=1.0, flip=False):
        self.x, self.y, self.s, self.flip = x, y, s, flip

    def pt(self, p):
        x = -p[0] if self.flip else p[0]
        return (self.x + x * self.s, self.y + p[1] * self.s)

    def __call__(self, path):
        if self.flip:
            path = xf(path, -1, 0, 0, 1, 0, 0)
        return xf(path, self.s, 0, 0, self.s, self.x, self.y)

    def inv(self, p):
        x = (p[0] - self.x) / self.s
        return (-x if self.flip else x, (p[1] - self.y) / self.s)


def seated(ic, P, lean=0.0, sweep=1.0, chair=True, head_at=None, group=None):
    """Add the wheelchair athlete (the logo: torso with swoosh back, wheel, leg, head).

    Returns (shoulder, head) in figure space. The leg carries class "a" (the
    logo's accent colour), which renders in the ink unless a page sets
    --asnm-accent. sweep != 1 swaps the logo's back for the brush back scaled
    about the shoulder.
    """
    sh, hd = upper(lean)
    if head_at:
        hd = head_at
    if sweep == 1.0:
        ic.add(P(body(lean)), merge="body", group=group)
    else:
        ic.add(P(back(lean, sweep)), merge="body", group=group)
        ic.add(P(torso(lean)), merge="body", group=group)
    if chair:
        ic.add(P(wheel()), group=group)
    ic.add(P(leg()), cls="a", group=group)
    ic.add(P(head(hd)), group=group)
    return sh, hd


# ---------------------------------------------------------------- standing / running
import math as _m


def leg_points(hip, theta, phi, lt=19.0, ls=21.0):
    """Knee and ankle for a thigh swung theta degrees forward of straight down and a knee bent phi degrees."""
    t = _m.radians(theta)
    knee = (hip[0] + lt * _m.sin(t), hip[1] + lt * _m.cos(t))
    s = _m.radians(theta - phi)
    ankle = (knee[0] + ls * _m.sin(s), knee[1] + ls * _m.cos(s))
    return knee, ankle


def thigh(hip, knee, w0=9.4, w1=7.8):
    return brush([hip, add(hip, mul(sub(knee, hip), 0.5)), knee], [w0, (w0 + w1) / 2, w1], ("round", "round"))


def shin(knee, ankle, w0=7.8, foot=4.6):
    """Shin tapering to a small pointed foot that points forward (+x)."""
    d = norm(sub(ankle, knee))
    fwd = (d[1], -d[0]) if d[1] > 0 else (1.0, 0.0)
    if fwd[0] < 0:
        fwd = (-fwd[0], -fwd[1])
    mid = add(knee, mul(sub(ankle, knee), 0.55))
    toe = add(ankle, mul(fwd, foot))
    return brush([knee, mid, ankle, toe], [w0, 6.2, 4.6, 0.0], ("round", "point"))


def blade(knee, ankle, w0=7.8):
    """Running blade: a socket under the knee, then a spring that bows backward like ')'
    and sweeps forward into a pointed toe."""
    d = norm(sub(ankle, knee))
    b = (-d[1], d[0])                      # perpendicular; make it point backward (-x)
    if b[0] > 0:
        b = (-b[0], -b[1])
    L = dist(knee, ankle)

    def at(s_, u):
        return add(add(knee, mul(d, L * s_)), mul(b, u))
    socket = brush([knee, at(0.2, 0), at(0.38, 0)], [w0, 7.0, 6.0], ("round", "round"))
    spring = brush([at(0.34, 0.4), at(0.56, 2.6), at(0.78, 3.8), at(0.96, 2.4), at(1.05, -0.8), at(1.07, -5.4)],
                   [3.6, 3.3, 3.0, 2.8, 2.2, 0.0], ("round", "point"))
    return union(socket, spring)


# ---------------------------------------------------------------- water, snow, motion lines
def wave(x0, x1, y, amp=3.4, crests=2.5, w=4.6, phase=0.0, taper=0.16):
    """A calligraphic wave: a sine stroke that swells in the middle and tapers to points."""
    n = max(8, int((x1 - x0) / 3))
    pts, ws = [], []
    for i in range(n + 1):
        u = i / n
        x = x0 + (x1 - x0) * u
        pts.append((x, y - amp * _m.sin(2 * _m.pi * (crests * u) + phase)))
        edge = min(u, 1 - u) / taper
        ws.append(w * min(1.0, edge) ** 0.8 if edge < 1 else w)
    ws[0] = ws[-1] = 0.0
    return brush(pts, ws, ("point", "point"))


def below(x0, x1, y, amp=3.4, crests=2.5, phase=0.0, bottom=140.0):
    """Region under a wave's centre line (for clipping things that go underwater)."""
    n = max(8, int((x1 - x0) / 3))
    pts = [(x0 + (x1 - x0) * i / n, y - amp * _m.sin(2 * _m.pi * (crests * i / n) + phase)) for i in range(n + 1)]
    return poly([(-20, pts[0][1])] + pts + [(140, pts[-1][1]), (140, bottom), (-20, bottom)])


def swoosh(pts, w=3.0):
    """A motion line / ribbon: tapers to points at both ends."""
    n = len(pts)
    ws = [0.0] + [w * _m.sin(_m.pi * i / (n - 1)) ** 0.6 for i in range(1, n - 1)] + [0.0]
    return brush(pts, ws, ("point", "point"))
