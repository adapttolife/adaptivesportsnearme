from kit import Icon, Motion, circle, union, outline, brush, poly, turn
import figure as F


def build():
    ic = Icon("archery", "Archery")
    P = F.Placement(40, 82)
    hd = (14.2, -52.4)
    # body without the usual back swoosh: the draw arm takes its place
    ic.add(P(F.torso()), merge="body")
    ic.add(P(F.wheel()))
    ic.add(P(F.leg()), cls="a")
    ic.add(P(F.head(hd)))
    sh = F.SHOULDER
    grip = (29.6, -36.6)
    ic.add(P(F.arm([sh, (18.6, -35.4), grip], fist=3.2)), merge="body")
    # recurve bow: thick at the grip, tips flick forward
    bow = brush([(30.6, -13.8), (28.2, -17.6), (31.0, -26.5), (32.9, -36.6), (31.0, -46.6), (28.2, -55.6), (30.6, -59.4)],
                [0.9, 1.7, 2.5, 3.3, 2.5, 1.7, 0.9], ("round", "round"))
    ic.add(P(bow), merge="bow")
    ic.add(P(circle(*grip, 3.2)), merge="bow")      # fist in front of the bow
    top, bot = (29.3, -58.6), (29.3, -14.6)
    nock = (20.2, -41.2)
    # the string: two segments that swing straight when released
    ic.add(P(outline([top, nock], 0.75)), group="s1", gap=False)
    ic.add(P(outline([bot, nock], 0.75)), group="s2", gap=False)
    # arrow: shaft, head, two vanes
    y = nock[1]
    arrow = union(outline([(nock[0] - 1.0, y), (45.0, y)], 1.05, "butt"),
                  poly([(44.0, y - 2.1), (49.2, y), (44.0, y + 2.1)]),
                  brush([(nock[0] + 4.6, y - 0.4), (nock[0] + 1.6, y - 1.9), (nock[0] - 0.6, y - 2.6)], [1.4, 1.2, 0], ("flat", "point")),
                  brush([(nock[0] + 4.6, y + 0.4), (nock[0] + 1.6, y + 1.9), (nock[0] - 0.6, y + 2.6)], [1.4, 1.2, 0], ("flat", "point")))
    ic.add(P(arrow), group="ar")
    # draw arm: a swoosh from behind the shoulder to the hand at the nock
    draw = brush([(-18.6, -33.6), (-9.0, -38.8), (2.0, -40.6), (12.0, -41.0), (17.2, -41.2)], [0, 4.6, 5.6, 5.0, 4.4],
                 ("point", "round"))
    ic.add(P(union(draw, circle(*nock, 3.1))), group="hand", merge="body")

    pull = 9.1 * P.s   # hand travel from the drawn position to the resting string
    st = (top[0], -36.6)
    a1, a2 = turn(top, nock, st), turn(bot, nock, (bot[0], -36.6))
    T, B = P.pt(top), P.pt(bot)
    rel = "animation-timing-function:cubic-bezier(.2,.9,.3,1)"
    ic.motion(Motion("hand", [(0, "none"), (38, "none"), (44, "translate(-2.4px,0px)"), (60, "translate(-2.4px,0px)"),
                              (72, f"translate({pull:.2f}px,0px)"), (80, f"translate({pull:.2f}px,0px)"), (100, "none")],
                     pivot=P.pt(nock), dur=3.0))
    ic.motion(Motion("s1", [(0, "none"), (40, f"transform:none;{rel}"), (44, f"rotate({a1:.1f}deg)"), (80, f"rotate({a1:.1f}deg)"),
                            (100, "none")], pivot=T, dur=3.0))
    ic.motion(Motion("s2", [(0, "none"), (40, f"transform:none;{rel}"), (44, f"rotate({a2:.1f}deg)"), (80, f"rotate({a2:.1f}deg)"),
                            (100, "none")], pivot=B, dur=3.0))
    ic.motion(Motion("ar", [(0, "transform:none;opacity:1"), (40, "transform:none;opacity:1;animation-timing-function:cubic-bezier(.5,0,1,.6)"),
                            (49, "transform:translate(24px,0px);opacity:0"), (57, f"transform:translate({pull:.2f}px,0px);opacity:0"),
                            (72, f"transform:translate({pull:.2f}px,0px);opacity:1"), (80, f"transform:translate({pull:.2f}px,0px);opacity:1"),
                            (100, "transform:none;opacity:1")], pivot=P.pt(nock), dur=3.0, ease="cubic-bezier(.45,0,.55,1)"))
    return ic.finish(sweep=True)
