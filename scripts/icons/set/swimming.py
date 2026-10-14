import kit
from kit import Icon, Motion, circle, union, diff, brush, poly
import figure as F


def build():
    ic = Icon("swimming", "Swimming")
    yw = 70.0
    # trailing arm: the logo swoosh, sweeping back along the surface
    ic.add(brush([(63.0, 65.0), (50.0, 62.4), (38.0, 61.6), (27.5, 64.6)], [10.4, 7.6, 4.8, 0.0], ("round", "point")),
           merge="body")
    head = (78.6, 60.6)
    ic.add(circle(*head, F.HEAD_R))
    # goggles strap: a thin gap across the head reads as a swim cap line
    sh = (63.0, 61.8)
    arm = F.arm([sh, (74.0, 44.5), (92.6, 48.2)], w0=7.2, w1=4.8, fist=3.4)
    ic.add(arm, group="arm", merge="body")
    w1 = F.wave(14, 106, yw + 1.6, amp=2.6, crests=2.25, w=4.8, phase=0.4)
    w2 = F.wave(26, 98, yw + 11.6, amp=2.2, crests=2.0, w=4.0, phase=2.2)
    ic.add(w1, group="w1")
    ic.add(w2, group="w2")
    # splash behind the kick
    ic.add(union(circle(20.5, 61.0, 1.9), circle(14.5, 66.0, 1.5)), group="sp")
    ic.add(F.swoosh([(25.0, 58.0), (21.0, 52.0), (23.5, 46.5)], 2.6), group="sp")
    water = F.below(14, 106, yw + 1.6, amp=2.6, crests=2.25, phase=0.4)
    clip = diff(poly([(-20, -20), (140, -20), (140, 140), (-20, 140)]), kit.grow(union(water, w1), kit.GAP))
    dur = 1.9
    ic.motion(Motion("arm", [(0, "none"), (100, "rotate(360deg)")], pivot=sh, dur=dur, ease="linear", clip=clip))
    ic.motion(Motion("w1", [(0, "none"), (50, "translate(-1.6px,0.7px)"), (100, "none")], pivot=(60, 72), dur=dur))
    ic.motion(Motion("w2", [(0, "none"), (50, "translate(1.6px,-0.6px)"), (100, "none")], pivot=(60, 82), dur=dur))
    ic.motion(Motion("sp", [(0, "transform:none;opacity:1"), (45, "transform:translate(-1.5px,-2.5px);opacity:.15"),
                            (55, "transform:translate(1px,2px);opacity:.15"), (100, "transform:none;opacity:1")],
                     pivot=(20, 58), dur=dur / 2))
    return ic.finish()
