import kit
from kit import Icon, Motion, brush, circle, union, diff, poly, rrect, stroke_arc
import figure as F

S = 0.70                       # two people in one scene (figures may scale to 0.6)
HAND = (25.0, -30.0)           # each holds a mug at chest height (figure space)
ELBOW = (16.4, -24.6)


def mug(hand):
    """A coffee mug held by its handle: the body sits just beyond the fist."""
    x0 = hand[0] + 5.0
    body = rrect(x0, hand[1] - 7.6, 11.6, 13.2, 2.4)
    handle = stroke_arc((x0, hand[1] - 1.0), 4.0, 90, 270, 2.5)
    return union(body, handle)


def steam(base, phase):
    """Two thin swooshes rising from the mug."""
    x, y = base
    a = F.swoosh([(x + 1.2, y), (x - 1.2, y - 4.6), (x + 1.4, y - 9.2), (x - 0.4, y - 13.4)], 2.6)
    b = F.swoosh([(x + 6.0, y - 1.2), (x + 3.8, y - 5.2), (x + 6.2, y - 9.0), (x + 4.6, y - 12.4)], 2.4)
    return a if phase == 0 else b


def cap(hd, r=F.HEAD_R):
    """Cap on the head: a crown over the top third, a brim forward, a star cut out of the crown."""
    cx, cy = hd
    edge = cy - 2.0                               # the cap's lower edge
    crown = diff(circle(cx - 0.3, cy - 0.4, r + 1.0), poly([(cx - 20, edge), (cx + 20, edge), (cx + 20, cy + 20), (cx - 20, cy + 20)]))
    brim = brush([(cx + 2.0, edge - 0.7), (cx + 7.0, edge - 0.6), (cx + 11.4, edge + 0.6)], [2.8, 2.4, 1.2], ("round", "round"))
    pts = [kit.polar((cx - 0.8, edge - 3.0), 2.3 if i % 2 == 0 else 0.95, -90 + 36 * i) for i in range(10)]
    return diff(union(crown, brim), poly(pts))


def build():
    ic = Icon("veteran-meetup", "Veteran meetups")
    A = F.Placement(60.0 - 1.6 - 51.3 * S, 84.0, S)        # left athlete, facing right
    B = F.Placement(60.0 + 1.6 + 51.3 * S, 84.0, S, flip=True)   # right athlete (cap), facing left: toes 3.2 apart
    for P, g in ((A, None), (B, None)):
        sh, hd = F.seated(ic, P)
    sh, hd = F.SHOULDER, F.HEAD
    # left: mug + steam, still
    ic.add(A(mug(HAND)), merge="mugA")
    ic.add(A(F.arm([sh, ELBOW, HAND], w0=7.0, w1=4.6, fist=3.2)), merge="body")
    sx = HAND[0] + 5.0 + 2.8
    for i in range(2):
        ic.add(A(steam((sx, HAND[1] - 11.6), i)), group=f"sa{i}", gap=False)
    # right: cap, mug raised in a toast (arm + mug + its steam move together)
    ic.add(B(cap(hd)), merge="cap")
    ic.add(B(mug(HAND)), group="armB", merge="mugB")
    ic.add(B(F.arm([sh, ELBOW, HAND], w0=7.0, w1=4.6, fist=3.2)), group="armB", merge="body")
    for i in range(2):
        ic.add(B(steam((sx, HAND[1] - 11.6), i)), group=f"sb{i}", gap=False)
    dur = 2.8
    for i, g in enumerate(("sa0", "sa1", "sb0", "sb1")):
        fr = [(0, "transform:none;opacity:1")]
        # rise and fade, then reappear low and fade in: staggered per wisp
        a, b = (20 + i * 9) % 70 + 10, (20 + i * 9) % 70 + 11
        fr += [(a, "transform:translate(0px,-4px);opacity:0"), (b, "transform:translate(0px,2.5px);opacity:0"),
               (min(b + 30, 96), "transform:translate(0px,1px);opacity:1"), (100, "transform:none;opacity:1")]
        P = A if g.startswith("sa") else B
        ic.motion(Motion(g, fr, pivot=P.pt((sx, HAND[1] - 14)), dur=dur, ease="ease-in-out",
                         parent="armB" if g.startswith("sb") else None))
    ic.motion(Motion("armB", [(0, "none"), (20, "none"), (40, "rotate(9deg)"), (56, "rotate(7deg)"), (76, "none"), (100, "none")],
                     pivot=B.pt(sh), dur=dur))
    return ic.settle()
