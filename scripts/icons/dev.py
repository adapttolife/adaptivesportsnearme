"""Dev loop: build icons, write SVGs and a labelled contact sheet.

  python dev.py [keys...]            -> /tmp/asnm-icons/dev/<key>.svg + sheet.png
  python dev.py --grid basketball    -> sheet with a 10-unit grid (for placing parts)
"""
import importlib, os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
import kit

OUT = os.environ.get("ASNM_DEV_OUT", "/tmp/asnm-icons/dev")
os.makedirs(OUT, exist_ok=True)


def build(key):
    mod = importlib.import_module(f"set.{key.replace('-', '_')}")
    importlib.reload(mod)
    return mod.build()


GRID = "".join(f'<line x1="{v}" y1="0" x2="{v}" y2="120" stroke="{"#e44" if v % 50 == 0 else "#f3b0b0"}" stroke-width=".25"/>'
               f'<line x1="0" y1="{v}" x2="120" y2="{v}" stroke="{"#e44" if v % 50 == 0 else "#f3b0b0"}" stroke-width=".25"/>'
               for v in range(0, 121, 10))


def edge_warn(ic, lo=0.6, hi=119.4):
    """Moving parts must stay inside the 120 box while visible (opacity > .25)."""
    bad = []
    for t, st in kit.motion_states(ic, 24):
        for p in ic.parts:
            if p.group is None:
                continue
            path, vis = p.path, 1.0
            for g in reversed(kit._chain(ic, p.group)):
                if g not in st:
                    continue
                ops, op = st[g]
                path = kit._apply(path, ops, ic.motions[g].pivot)
                vis *= op
            m = ic.motions.get(p.group)
            if m is not None and m.clip is not None:
                path = kit.inter(path, m.clip)
            if vis <= 0.25 or abs(path.area) < 1e-6:
                continue
            x0, y0, x1, y1 = path.bounds
            if x0 < lo or y0 < lo or x1 > hi or y1 > hi:
                bad.append((round(t, 2), p.group))
    if not bad:
        return ""
    return "  WARNING leaves the 120 box: " + ", ".join(sorted({g for _, g in bad})) + f" at t={sorted({t for t, _ in bad})}"


def main(args):
    grid = "--grid" in args
    keys = [a for a in args if not a.startswith("--")] or sorted(f[:-3].replace("_", "-") for f in os.listdir(os.path.join(os.path.dirname(__file__), "set")) if f.endswith(".py") and not f.startswith("_"))
    pngs = []
    for k in keys:
        ic = build(k)
        svg = kit.render(ic)
        st = kit.render(ic, static=True)
        open(f"{OUT}/{k}.svg", "w").write(svg)
        open(f"{OUT}/{k}.static.svg", "w").write(st)
        view = st
        if grid:
            view = st.replace("</svg>", GRID + "</svg>")
        open(f"{OUT}/{k}.view.svg", "w").write(view)
        subprocess.run(["rsvg-convert", "-w", "360", "-h", "360", "-b", "white", f"{OUT}/{k}.view.svg", "-o", f"{OUT}/{k}.png"], check=True)
        pngs.append((k, f"{OUT}/{k}.png", len(svg)))
        print(f"{k}: {len(svg)} bytes" + edge_warn(ic))
    from PIL import Image, ImageDraw
    cols = min(4, len(pngs))
    rows = (len(pngs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 360, rows * 384), "white")
    d = ImageDraw.Draw(sheet)
    for i, (k, f, n) in enumerate(pngs):
        x, y = (i % cols) * 360, (i // cols) * 384
        sheet.paste(Image.open(f).convert("RGB"), (x, y + 24))
        d.text((x + 6, y + 6), f"{k}  {n}B", fill=(200, 0, 0))
    sheet.save(f"{OUT}/sheet.png")




def frames(key, n=8, size=220):
    """Strip of n frames across one loop, drawn from the same transforms CSS will run."""
    from PIL import Image, ImageDraw
    ic = build(key)
    parts = ic.resolved()
    states = list(kit.motion_states(ic, n))[:n]
    imgs = []
    for t, st in states:
        body = ""
        for p in parts:
            path, vis = p.path, 1.0
            g, chain = p.group, []
            while g is not None:
                chain.append(g)
                g = ic.motions[g].parent if g in ic.motions else None
            for g in chain:
                if g in st:
                    ops, op = st[g]
                    m = ic.motions[g]
                    path = kit._apply(path, ops, m.pivot)
                    vis *= op
            if p.group and p.group in ic.motions and ic.motions[p.group].clip is not None:
                path = kit.inter(path, ic.motions[p.group].clip)
            body += f'<path d="{kit._d(path, 2)}" fill="#1A1A1A" fill-opacity="{vis:.2f}"/>'
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#fff"/>{body}</svg>'
        open(f"{OUT}/_f.svg", "w").write(svg)
        subprocess.run(["rsvg-convert", "-w", str(size), "-h", str(size), f"{OUT}/_f.svg", "-o", f"{OUT}/_f.png"], check=True)
        imgs.append((t, Image.open(f"{OUT}/_f.png").convert("RGB")))
    strip = Image.new("RGB", (size * n, size + 18), "white")
    d = ImageDraw.Draw(strip)
    for i, (t, im) in enumerate(imgs):
        strip.paste(im, (i * size, 18))
        d.text((i * size + 4, 3), f"{key} t={t:.2f}", fill=(200, 0, 0))
        d.line([(i * size, 0), (i * size, size + 18)], fill=(220, 220, 220))
    strip.save(f"{OUT}/frames-{key}.png")
    return f"{OUT}/frames-{key}.png"


if __name__ == "__main__":
    if "--frames" in sys.argv:
        for k in [a for a in sys.argv[1:] if not a.startswith("--")]:
            print(frames(k))
    else:
        main(sys.argv[1:])
