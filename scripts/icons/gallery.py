"""Review page for the icon set: every icon animated, with play/pause, loop and size controls.

  /tmp/pv/bin/python gallery.py OUTDIR

Writes OUTDIR/index.html (icons inline, ids made unique per copy) and copies the
built SVGs to OUTDIR/svg/ for the <img> row (exactly how the site embeds them).
"""
import html, importlib, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import kit
from build import KEYS


def uniq(svg, tag):
    svg = re.sub(r'id="([^"]+)"', lambda m: f'id="{m.group(1)}-{tag}"', svg)
    return re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{m.group(1)}-{tag})', svg)


def main(out):
    os.makedirs(os.path.join(out, "svg"), exist_ok=True)
    cards, done = [], []
    for k in KEYS:
        path = os.path.join(HERE, "set", k.replace("-", "_") + ".py")
        if not os.path.exists(path):
            continue
        ic = importlib.import_module("set." + k.replace("-", "_")).build()
        svg = kit.render(ic)
        open(os.path.join(out, "svg", k + ".svg"), "w").write(svg)
        cards.append(f'<figure class="card" data-key="{k}"><div class="art">{uniq(svg, "g")}</div>'
                     f'<figcaption><b>{html.escape(ic.title)}</b><span>{k} · {len(svg) / 1024:.1f} KB</span></figcaption></figure>')
        done.append(k)
    sample = [k for k in ("basketball", "swimming", "archery", "equestrian", "sailing") if k in done][:4]
    sizes = "".join(f'<div class="sz"><img src="svg/{sample[0]}.svg" width="{s}" height="{s}" alt=""><span>{s}px</span></div>'
                    for s in (24, 32, 48, 64, 96, 160, 240)) if sample else ""
    page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>ASNM sport icons: review</title>
<style>
:root{{--ink:#1A1A1A;--paper:#FAF8F3;--line:#E6E1D6;--muted:#6B665C}}
*{{box-sizing:border-box}}body{{margin:0;font:17px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--ink);background:var(--paper)}}
header{{position:sticky;top:0;z-index:2;background:rgba(250,248,243,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}}
.bar{{max-width:1240px;margin:0 auto;padding:14px 20px;display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center}}
h1{{font-size:20px;margin:0 auto 0 0}}@media (max-width:700px){{header{{position:static}} .bar{{flex-wrap:nowrap;overflow-x:auto;gap:8px;padding:12px 16px}} h1{{font-size:18px;white-space:nowrap;margin-right:8px}} button{{flex:none}} main{{padding:16px 16px 60px}} .grid{{gap:10px}} .card{{padding:8px}}}}
button{{font:inherit;font-size:15px;min-height:44px;padding:0 16px;border-radius:999px;border:1px solid var(--ink);background:#fff;color:var(--ink);cursor:pointer}}
button[aria-pressed=true]{{background:var(--ink);color:#fff}}
main{{max-width:1240px;margin:0 auto;padding:24px 20px 80px}}
p.lede{{max-width:760px;color:var(--muted);margin:0 0 24px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(var(--card,200px),calc(50vw - 28px)),1fr));gap:16px}}
.card{{margin:0;background:#fff;border:1px solid var(--line);border-radius:18px;padding:12px 12px 10px;display:flex;flex-direction:column;gap:6px}}
.card .art svg{{display:block;width:100%;height:auto}}
figcaption{{display:flex;flex-direction:column;font-size:15px;line-height:1.3}}figcaption span{{color:var(--muted);font-size:13px}}
body.paused .art svg{{--asnm-play:paused}} body.loop .art svg{{--asnm-loops:infinite}}
body.tint .card{{background:#EEF3F1}} body.dark .card{{background:#1A1A1A;border-color:#333}} body.dark .card .art svg{{--asnm-ink:#F5F5F3}} body.dark figcaption b{{color:#F5F5F3}}
body.brand .art svg{{--asnm-ink:#3B3B46;--asnm-accent:#FF5C39}}
h2{{font-size:18px;margin:40px 0 12px}} .sizes{{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-end}} .sz{{display:flex;flex-direction:column;align-items:center;gap:4px;color:var(--muted);font-size:13px}}
.imgrow{{display:inline-block;margin-right:12px}}
</style></head><body class="loop">
<header><div class="bar"><h1>ASNM sport icons</h1>
<button id="play" aria-pressed="false">Pause</button>
<button id="loop" aria-pressed="true">Loop</button>
<button id="replay">Replay</button>
<button data-size="140">S</button><button data-size="200" aria-pressed="true">M</button><button data-size="320">L</button>
<button data-bg="tint" aria-pressed="false">Tint</button><button data-bg="dark" aria-pressed="false">Dark</button><button data-bg="brand" aria-pressed="false">Logo colours</button>
</div></header>
<main><p class="lede">{len(done)} icons, one athlete: the Adapt To Life logo, posed for each sport and drawn in code. On the site each one plays its motion twice, then rests; here they loop. Logo colours previews charcoal with the coral leg.</p>
<div class="grid" id="grid">{''.join(cards)}</div>
<h2>Sizes (as the site embeds them, &lt;img&gt;)</h2><div class="sizes">{sizes}</div>
</main>
<script>
const b=document.body,grid=document.getElementById('grid'),html0=grid.innerHTML;
const toggle=(el,cls)=>{{const on=b.classList.toggle(cls);el.setAttribute('aria-pressed',on);return on}};
document.getElementById('play').onclick=e=>{{const on=toggle(e.target,'paused');e.target.textContent=on?'Play':'Pause'}};
document.getElementById('loop').onclick=e=>toggle(e.target,'loop');
document.getElementById('replay').onclick=()=>{{grid.innerHTML='';requestAnimationFrame(()=>grid.innerHTML=html0)}};
document.querySelectorAll('[data-size]').forEach(x=>x.onclick=()=>{{document.documentElement.style.setProperty('--card',x.dataset.size+'px');document.querySelectorAll('[data-size]').forEach(y=>y.setAttribute('aria-pressed',y===x))}});
document.querySelectorAll('[data-bg]').forEach(x=>x.onclick=()=>toggle(x,x.dataset.bg));
</script></body></html>"""
    open(os.path.join(out, "index.html"), "w").write(page)
    print(f"{len(done)} icons -> {out}/index.html")


if __name__ == "__main__":
    main(sys.argv[1])
