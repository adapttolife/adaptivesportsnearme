import kit
from kit import Icon, Motion, brush
import figure as F
from set import _horse as H

K = 1.45                      # horse units -> figure units (a horse's head is ~2.5 x a person's)
MUZZLE = (35.5, -38.0)        # figure space: the horse's nose, at the athlete's hand
FACE = 14.0                   # turn of the mirrored head: lowered, the nose reaching toward the hand


def head_fig(p):
    """Horse-space head shape -> figure space, mirrored to face the athlete."""
    m = H._head_at(16.6, 3.5)
    p = kit.move(p, -m[0], -m[1])
    p = kit.xf(p, -1, 0, 0, 1, 0, 0)
    p = kit.rotate(p, FACE, (0, 0))
    return kit.xf(p, K, 0, 0, K, MUZZLE[0], MUZZLE[1])


def build():
    ic = Icon("equine-therapy", "Equine therapy")
    P = F.Placement(34, 84)
    sh, hd = F.seated(ic, P)
    # horse bust (figure space): neck arching up and over, tapering to a point; mane band on the crest; the head
    neck = brush([(51.0, -53.0), (59.0, -58.5), (65.5, -54.0), (68.0, -44.0), (67.5, -33.0), (64.0, -22.0)],
                 [11.0, 12.8, 12.8, 11.0, 7.4, 0.0], ("round", "round"))
    mane = brush([(58.5, -66.6), (63.2, -65.4), (67.6, -61.0), (71.2, -53.4), (73.4, -44.0), (72.8, -33.5)],
                 [0.0, 4.6, 5.2, 4.8, 3.6, 0.0], ("point", "point"))
    ic.add(P(H.smooth(neck, 1.6)), group="hn", merge="h")      # fillet the inside of the tight bend
    ic.add(P(mane), group="hn")
    ic.add(P(head_fig(H.head())), group="hn", merge="hd")
    hand = (28.0, -37.5)
    ic.add(P(F.arm([sh, (18.5, -27.5), hand], w0=7.0, w1=4.6, fist=3.3)), group="arm", merge="body")
    # the horse nuzzles down into the hand twice; the hand strokes up the nose and back
    dur = 2.8
    ic.motion(Motion("hn", [(0, "none"), (22, "rotate(-3.5deg)"), (40, "rotate(-1deg)"), (60, "rotate(-3deg)"),
                            (84, "none"), (100, "none")], pivot=P.pt((66.0, -36.0)), dur=dur))
    ic.motion(Motion("arm", [(0, "none"), (12, "none"), (34, "rotate(-7deg)"), (52, "rotate(0deg)"),
                             (70, "rotate(-6deg)"), (88, "none"), (100, "none")], pivot=P.pt(sh), dur=dur))
    return ic.settle()
