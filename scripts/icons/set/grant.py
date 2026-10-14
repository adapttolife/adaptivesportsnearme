import kit
from kit import Icon, Motion, brush, union, diff, poly, rrect, line
import figure as F

PAGE_C = (38.0, -64.0)      # page centre (figure space)
PAGE_W, PAGE_H = 22.0, 28.0
TILT = 8.0                  # the page leans back, held up high
FOLD = 7.4                  # folded top-right corner


def page():
    """Grant letter: a solid page, its top-right corner folded over, a dollar sign and two text lines as gaps."""
    x0, y0 = PAGE_C[0] - PAGE_W / 2, PAGE_C[1] - PAGE_H / 2
    x1, y1 = x0 + PAGE_W, y0 + PAGE_H
    sheet = diff(rrect(x0, y0, PAGE_W, PAGE_H, 1.8), poly([(x1 - FOLD, y0 - 2), (x1 + 2, y0 - 2), (x1 + 2, y0 + FOLD)]))
    flap = poly([(x1 - FOLD, y0), (x1 - FOLD, y0 + FOLD), (x1, y0 + FOLD)])
    flap = kit.union(kit.inter(kit.grow(flap, 0.0), flap))
    sheet = diff(sheet, kit.grow(flap, kit.GAP * 0.62))
    # the dollar sign: a smooth S and a bar, cut out of the page
    cx, cy = x0 + PAGE_W * 0.42, y0 + 11.0
    s_pts = [(cx + 3.6, cy - 3.9), (cx + 0.6, cy - 5.0), (cx - 2.9, cy - 3.9), (cx - 2.6, cy - 1.3), (cx + 0.0, cy + 0.0),
             (cx + 2.6, cy + 1.3), (cx + 2.9, cy + 3.9), (cx - 0.6, cy + 5.0), (cx - 3.6, cy + 3.9)]
    dollar = union(brush(s_pts, [2.1] * len(s_pts), ("round", "round")),
                   line((cx, cy - 7.4), (cx, cy + 7.4), 1.9, "round"))
    lines = union(line((x0 + 4.2, y1 - 8.4), (x1 - 4.2, y1 - 8.4), 2.0, "round"),
                  line((x0 + 4.2, y1 - 4.4), (x1 - 9.0, y1 - 4.4), 2.0, "round"))
    sheet = diff(sheet, union(dollar, lines))
    return union(sheet, flap)


def burst(c, a0, r0, r1, w=2.6):
    """One celebration ray: a short stroke tapering to a point, pointing away from c."""
    p0 = kit.polar(c, r0, a0)
    p1 = kit.polar(c, r1, a0)
    return brush([p0, kit.lerp(p0, p1, .5), p1], [w, w * 0.8, 0.0], ("round", "point"))


def build():
    ic = Icon("grant", "Grants")
    P = F.Placement(42, 92, 0.94)
    sh, hd = F.seated(ic, P)
    elbow, hand = (26.5, -27.0), (30.0, -47.5)
    pg = kit.rotate(page(), TILT, PAGE_C)
    ic.add(P(pg), group="doc")
    ic.add(P(F.arm([sh, elbow, hand], w0=7.0, w1=4.6, fist=3.4)), group="arm", merge="body")
    rays = union(*[burst(PAGE_C, a, 21.0, 27.4) for a in (-152, -120, -60, -28, 4)])
    ic.add(P(rays), group="rays")
    dur = 2.6
    up = "animation-timing-function:cubic-bezier(.3,0,.2,1)"
    ic.motion(Motion("arm", [(0, "none"), (10, f"transform:none;{up}"), (34, "rotate(-5deg)"), (50, "rotate(-3deg)"),
                             (64, "rotate(-5deg)"), (86, "none"), (100, "none")], pivot=P.pt(sh), dur=dur))
    ic.motion(Motion("doc", [(0, "none"), (10, f"transform:none;{up}"), (34, "rotate(-5deg) translate(0px,-1px)"),
                             (50, "rotate(-1deg)"), (64, "rotate(-6deg)"), (86, "none"), (100, "none")],
                     pivot=P.pt(sh), dur=dur))
    ic.motion(Motion("rays", [(0, "transform:none;opacity:1"), (30, "transform:scale(.86);opacity:.15"),
                              (46, "transform:scale(1.08);opacity:1"), (62, "transform:scale(.9);opacity:.4"),
                              (80, "transform:scale(1.04);opacity:1"), (100, "transform:none;opacity:1")],
                     pivot=P.pt(PAGE_C), dur=dur, parent="doc"))
    return ic.settle()
