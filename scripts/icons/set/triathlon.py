import kit
from kit import Icon, Motion, union, brush, circle, outline
import figure as F
from set import _water as C
from set import swimming as SW, running as RN


def place(src, s, at):
    """Maps for a finished icon scaled by s about its box centre (60, 60), which lands on `at`:
    (path transform, point transform)."""
    T = lambda p: kit.xf(p, s, 0, 0, s, at[0] - 60 * s, at[1] - 60 * s)
    Tp = lambda q: (at[0] + (q[0] - 60) * s, at[1] + (q[1] - 60) * s)
    return T, Tp


def swimmer(ic, s, at, dur, drop=("w2", "sp")):
    """The swimming icon, small (one wave, no splash): body and wave still, the arm turning over as in
    swimming (hidden under the water)."""
    src = SW.build()
    T, Tp = place(src, s, at)
    m = src.motions["arm"]
    for p in src.parts:
        if p.group in drop:
            continue
        g = "sa" if p.group == "arm" else None
        ic.add(T(p.path), cls=p.cls, group=g, gap=p.gap, merge=("s" + p.merge) if p.merge else None)
    ic.motion(Motion("sa", m.frames, pivot=Tp(m.pivot), dur=dur, ease=m.ease, clip=T(m.clip) if m.clip is not None else None))


def runner(ic, s, at, dur, bob=1.4):
    """The running icon, small, in mid-stride: the whole runner bobs twice per loop."""
    src = RN.build()
    T, Tp = place(src, s, at)
    for p in src.parts:
        ic.add(T(p.path), cls=p.cls, group="rb", gap=p.gap, merge=("r" + p.merge) if p.merge else None)
    ic.motion(Motion("rb", [(0, "none"), (25, f"translateY(-{bob}px)"), (50, "none"), (75, f"translateY(-{bob}px)"), (100, "none")],
                     pivot=at, dur=dur))


def handcycle(ic, P, dur, hub=(70.0, 6.0), r=14.0, axle=(31.0, -20.0), crank=5.0):
    """The logo athlete in a chair with a clip-on handbike: a spoked front wheel, the fork up to the hand grips, a
    tube back to the chair, the near hand on the grip. The front wheel's spokes spin."""
    sh, hd = F.seated(ic, P, lean=4)
    fork = brush([hub, kit.lerp(hub, axle, 0.5), axle], [3.2, 3.0, 2.8], ("round", "round"))
    tube = brush([kit.lerp(hub, axle, 0.55), (28.0, -3.0), (16.0, -2.0)], [2.8, 2.6, 2.6], ("round", "round"))
    ic.add(P(union(fork, tube)))
    ic.add(P(kit.ring(hub[0], hub[1], r, r - 3.2)))
    spokes = union(*[outline([kit.polar(hub, -(r - 2.6), a), kit.polar(hub, r - 2.6, a)], 1.4) for a in (0, 60, 120)],
                   circle(*hub, 2.4))
    ic.add(P(spokes), group="hw", gap=False)
    h0 = kit.polar(axle, crank, -60)
    E0 = C.elbow(sh, h0, 12.5, 12.0, bend=1)
    up, fo = C.arm2(sh, E0, h0)
    ic.add(P(up), merge="body")
    ic.add(P(fo), merge="body")
    ic.motion(Motion("hw", [(0, "none"), (100, "rotate(360deg)")], pivot=P.pt(hub), dur=dur, ease="linear"))


def build(s=0.6, swim_at=(35.0, 22.0), cycle_at=(38.0, 68.0), run_at=(99.0, 88.0), dur=1.9):
    """Swim, bike, run on a diagonal, each figure at 0.6 scale with its own small loop."""
    ic = Icon("triathlon", "Triathlon")
    swimmer(ic, s, swim_at, dur)
    handcycle(ic, F.Placement(cycle_at[0], cycle_at[1], s=s), dur)
    runner(ic, s, run_at, dur)
    return ic.settle()
