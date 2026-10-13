#!/usr/bin/env python3
"""Athlete emblem series — built on the 2026 Adapt To Life logo (Alec 2026-09-05: "use the
new logo… I like how we're creating our own language of communicating with these symbols").

Source: public/emblems/atl-logo-2026.svg (Drive: atl-logo-2026-black.svg). Its five paths
are: 0 = the "A", 1 = head, 2 = torso + arm, 3 = leg, 4 = wheel. Paths 1–4 ARE the athlete,
a complete standalone figure — nothing is cropped or redrawn. Each sport adds ONE prop in
the same one-colour silhouette. Output: public/emblems/athlete.svg, athlete-<sport>.svg,
and a contact sheet (public/emblems/series.html).

  python3 scripts/emblem-series.py            # write SVGs + contact sheet
  python3 scripts/emblem-series.py --png DIR  # also render PNG previews (needs rsvg-convert)
"""
import re, sys, subprocess, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
EMB = ROOT / "public" / "emblems"
INK = "#1A1A1A"

src = (EMB / "atl-logo-2026.svg").read_text()
GROUP = re.search(r'<g[^>]*transform="([^"]+)"', src).group(1)   # translate(0,2084) scale(0.1,-0.1)
PATHS = re.findall(r'<path[^>]*d="([^"]+)"', src)
assert len(PATHS) == 5, "atl-logo-2026.svg changed shape"
A, HEAD, TORSO, LEG, WHEEL = PATHS

# Logo space is 2276 x 2084. The athlete lives in x 680..2276, y 480..2084; props extend
# to the right and above, so the emblem frame is a square with room on that side.
VIEWBOX = "560 360 1780 1780"

def athlete():
    return (f'<g class="ink" transform="{GROUP}">'
            f'<path d="{HEAD}"/><path d="{TORSO}"/><path d="{LEG}"/><path d="{WHEEL}"/></g>')

# ---- props (logo units). Chest front ~ (1400,1000); the forward hand ~ (1300,1230);
# balls sit in front of the chest around (1760,1060); held props run from the hand up-right.
def ball_with_mask(cx, cy, r, mask_lines, name):
    return (f'<mask id="{name}"><circle cx="{cx}" cy="{cy}" r="{r}" fill="#fff"/>'
            f'<g fill="none" stroke="#000" stroke-width="{r*0.13:.0f}" stroke-linecap="round">{mask_lines}</g></mask>'
            f'<circle class="ink" cx="{cx}" cy="{cy}" r="{r}" mask="url(#{name})"/>')

BX, BY, BR = 1760, 1060, 165

def basketball():
    cx, cy, r = BX, BY, BR
    seams = (f'<line x1="{cx-r}" y1="{cy}" x2="{cx+r}" y2="{cy}"/><line x1="{cx}" y1="{cy-r}" x2="{cx}" y2="{cy+r}"/>'
             f'<path d="M{cx-r*0.72} {cy-r*0.72} Q{cx} {cy-r*0.15} {cx+r*0.72} {cy-r*0.72}"/>'
             f'<path d="M{cx-r*0.72} {cy+r*0.72} Q{cx} {cy+r*0.15} {cx+r*0.72} {cy+r*0.72}"/>')
    return ball_with_mask(cx, cy, r, seams, "bb")

def volleyball():
    cx, cy, r = BX, BY, BR
    seams = (f'<path d="M{cx-r} {cy} Q{cx-r*0.3} {cy-r*0.9} {cx+r*0.5} {cy-r*0.87}"/>'
             f'<path d="M{cx-r*0.2} {cy+r*0.98} Q{cx+r*0.2} {cy+r*0.1} {cx+r*0.98} {cy+r*0.2}"/>'
             f'<path d="M{cx-r*0.75} {cy-r*0.66} Q{cx-r*0.1} {cy+r*0.2} {cx+r*0.6} {cy+r*0.8}"/>')
    return ball_with_mask(cx, cy, r, seams, "vb")

def goalball():
    cx, cy, r = BX, BY, BR
    holes = "".join(f'<circle cx="{cx+dx}" cy="{cy+dy}" r="{r*0.1:.0f}" fill="#000"/>' for dx, dy in
                    [(-75, -48), (0, -82), (75, -48), (-75, 48), (0, 82), (75, 48), (0, 0)])
    return (f'<mask id="gb"><circle cx="{cx}" cy="{cy}" r="{r}" fill="#fff"/>{holes}</mask>'
            f'<circle class="ink" cx="{cx}" cy="{cy}" r="{r}" mask="url(#gb)"/>')

def boccia():
    cx, cy, r = BX, BY, 145
    return (f'<mask id="bo"><circle cx="{cx}" cy="{cy}" r="{r}" fill="#fff"/>'
            f'<path d="M{cx-r} {cy} A{r} {r*0.42} 0 0 0 {cx+r} {cy}" fill="none" stroke="#000" stroke-width="18"/>'
            f'<path d="M{cx-r} {cy} A{r} {r*0.42} 0 0 1 {cx+r} {cy}" fill="none" stroke="#000" stroke-width="18"/></mask>'
            f'<circle class="ink" cx="{cx}" cy="{cy}" r="{r}" mask="url(#bo)"/>')

def rugby():
    return (f'<mask id="rg"><ellipse cx="{BX}" cy="{BY}" rx="205" ry="130" fill="#fff" transform="rotate(-30 {BX} {BY})"/>'
            f'<line x1="{BX-80}" y1="{BY+48}" x2="{BX+80}" y2="{BY-48}" stroke="#000" stroke-width="18"/></mask>'
            f'<ellipse class="ink" cx="{BX}" cy="{BY}" rx="205" ry="130" transform="rotate(-30 {BX} {BY})" mask="url(#rg)"/>')

def football():
    laces = "".join(f'<line x1="{BX+i*30-60}" y1="{BY-34}" x2="{BX+i*30-60}" y2="{BY+34}" stroke="#000" stroke-width="13"/>' for i in range(5))
    return (f'<mask id="fb"><ellipse cx="{BX}" cy="{BY}" rx="220" ry="126" fill="#fff" transform="rotate(-30 {BX} {BY})"/>'
            f'<g transform="rotate(-30 {BX} {BY})"><line x1="{BX-135}" y1="{BY}" x2="{BX+135}" y2="{BY}" stroke="#000" stroke-width="13"/>{laces}</g></mask>'
            f'<ellipse class="ink" cx="{BX}" cy="{BY}" rx="220" ry="126" transform="rotate(-30 {BX} {BY})" mask="url(#fb)"/>')

# Held props: hand frame, origin at the forward hand, +x along the shaft, lifted 35°.
def held(markup, lift=35):
    return f'<g transform="translate(1300 1230) rotate({-lift})">{markup}</g>'

def tennis():
    strings = "".join(f'<line x1="{400+i*46-115}" y1="-130" x2="{400+i*46-115}" y2="130" stroke="#000" stroke-width="11"/>' for i in range(6)) + \
              "".join(f'<line x1="240" y1="{i*44-110}" x2="560" y2="{i*44-110}" stroke="#000" stroke-width="11"/>' for i in range(6))
    return held('<rect class="ink" x="-14" y="-25" width="260" height="50" rx="20"/>'
                '<path class="ink" fill-rule="evenodd" d="M400 -150a165 130 0 1 0 0.1 0zM400 -106a121 86 0 1 1-0.1 0z"/>'
                f'<mask id="tn" maskUnits="userSpaceOnUse" x="200" y="-160" width="400" height="320"><ellipse cx="400" cy="0" rx="121" ry="86" fill="#fff"/>{strings}</mask>'
                '<ellipse class="ink" cx="400" cy="0" rx="121" ry="86" mask="url(#tn)"/>')

def pickleball():
    holes = "".join(f'<circle cx="{380+dx}" cy="{dy}" r="16" fill="#000"/>' for dx in (-82, -27, 27, 82) for dy in (-82, -27, 27, 82))
    return held('<rect class="ink" x="-14" y="-25" width="210" height="50" rx="20"/>'
                f'<mask id="pk" maskUnits="userSpaceOnUse" x="200" y="-160" width="360" height="320"><rect x="215" y="-138" width="330" height="276" rx="115" fill="#fff"/>{holes}</mask>'
                '<rect class="ink" x="215" y="-138" width="330" height="276" rx="115" mask="url(#pk)"/>')

def baseball():
    return held('<path class="ink" d="M0 -22h80l450 -25a50 50 0 0 1 0 94l-450 -25h-80a22 22 0 0 1 0 -44z"/>'
                '<circle class="ink" cx="600" cy="-165" r="70"/>')

def golf():
    return held('<rect class="ink" x="-14" y="-15" width="550" height="30" rx="14"/>'
                '<path class="ink" d="M520 -40c68-42 165-14 178 55 8 50-40 85-110 77-55-6-96-42-96-88 0-17 10-32 28-44z"/>') + \
           '<circle class="ink" cx="1250" cy="1470" r="46"/>'

def sledhockey():
    return held('<rect class="ink" x="-14" y="-18" width="450" height="36" rx="16"/>'
                '<path class="ink" d="M410 -20l150 82a30 30 0 0 1-30 52l-136-68z"/>', lift=15) + \
           '<ellipse class="ink" cx="1930" cy="1440" rx="95" ry="38"/>'

def rowing():
    return held('<rect class="ink" x="-14" y="-15" width="600" height="30" rx="14"/>'
                '<path class="ink" d="M580 -70c80-55 180-55 210 15 20 55-40 125-125 165-55 27-110 15-130-30-20-48 0-110 45-150z"/>', lift=40)

def swimming():
    return ('<path class="ink" d="M1560 900c80-80 190-80 270 0s190 80 270 0v68c-80 80-190 80-270 0s-190-80-270 0z"/>'
            '<path class="ink" d="M1560 1050c80-80 190-80 270 0s190 80 270 0v68c-80 80-190 80-270 0s-190-80-270 0z"/>')

def skiing():
    return ('<path class="ink" d="M1560 1020l32-11 165 490-32 11z"/><circle class="ink" cx="1770" cy="1525" r="38"/>'
            '<path class="ink" d="M1710 980l32-11 165 490-32 11z"/><circle class="ink" cx="1920" cy="1485" r="38"/>')

def waterskiing():
    return ('<path class="ink" d="M1310 1210l700-80 8 54-700 80z"/>'
            '<path class="ink" d="M1480 1400c110-70 270-70 410 0s270 70 380 0v68c-110 70-250 70-380 0s-300-70-410 0z"/>')

def cycling():
    # handcycle: the drive wheel sits in front of the chest (the ball slot, where there is
    # room), hub + a frame bar from the hand. The leg swoosh owns the bottom-right corner.
    return ('<path class="ink" fill-rule="evenodd" d="M1780 900a170 170 0 1 0 0.1 0zM1780 950a120 120 0 1 1-0.1 0z"/>'
            '<circle class="ink" cx="1780" cy="1070" r="34"/>'
            '<path class="ink" d="M1300 1212l470-165 16 44-470 165z"/>')

def equine_therapy():
    # horseshoe at the ball slot: unmistakable at chip size, and it keeps the one-prop rule
    return ('<path class="ink" fill-rule="evenodd" d="M1760 880c-118 0-205 92-205 215 0 78 30 148 78 196l-52 52c-62-62-100-150-100-248 0-160 125-283 279-283s279 123 279 283c0 98-38 186-100 248l-52-52c48-48 78-118 78-196 0-123-87-215-205-215z"/>'
            '<path class="ink" d="M1556 1348a44 44 0 1 0 0.1 0zM1964 1348a44 44 0 1 0 0.1 0z"/>'
            '<circle class="ink" cx="1625" cy="960" r="22"/><circle class="ink" cx="1895" cy="960" r="22"/>'
            '<circle class="ink" cx="1588" cy="1090" r="22"/><circle class="ink" cx="1932" cy="1090" r="22"/>')

def art_therapy():
    # palette + brush at the ball slot
    holes = ('<circle cx="1690" cy="985" r="30" fill="#000"/><circle cx="1795" cy="960" r="30" fill="#000"/>'
             '<circle cx="1878" cy="1030" r="30" fill="#000"/><circle cx="1700" cy="1105" r="30" fill="#000"/>')
    return (f'<mask id="ar"><path d="M1755 875c-135 0-245 92-245 205 0 62 33 96 82 96h34c26 0 46 20 46 46 0 12-5 22-9 32-6 16-9 33-9 50 0 47 38 85 85 85 152 0 261-104 261-244 0-152-110-270-245-270z" fill="#fff"/>{holes}</mask>'
            '<path class="ink" d="M1755 875c-135 0-245 92-245 205 0 62 33 96 82 96h34c26 0 46 20 46 46 0 12-5 22-9 32-6 16-9 33-9 50 0 47 38 85 85 85 152 0 261-104 261-244 0-152-110-270-245-270z" mask="url(#ar)"/>'
            '<path class="ink" d="M2118 792a34 34 0 0 0-48 0l-196 196 48 48 196-196a34 34 0 0 0 0-48z"/>')

def veteran_meetup():
    # two speech bubbles in the ball slot: people getting together to talk
    return ('<path class="ink" d="M1700 830c-132 0-239 85-239 190 0 48 22 92 58 125l-28 96c-3 11 9 19 18 14l112-55c25 9 52 14 79 14 132 0 239-85 239-194s-107-190-239-190z"/>'
            '<path class="ink" d="M1985 1155c88 0 159 58 159 129 0 32-15 62-38 84l19 65c3 11-9 19-18 14l-76-37c-15 5-30 7-46 7-88 0-159-58-159-131s71-131 159-131z"/>')

def soccer():
    cx, cy, r = BX, BY, BR
    seams = (f'<path d="M{cx} {cy-r*0.55} l{r*0.52} {r*0.38} l-{r*0.2} {r*0.62} h-{r*0.64} l-{r*0.2} -{r*0.62} z"/>'
             f'<line x1="{cx}" y1="{cy-r*0.55}" x2="{cx}" y2="{cy-r}"/>'
             f'<line x1="{cx+r*0.52}" y1="{cy-r*0.17}" x2="{cx+r*0.95}" y2="{cy-r*0.42}"/>'
             f'<line x1="{cx-r*0.52}" y1="{cy-r*0.17}" x2="{cx-r*0.95}" y2="{cy-r*0.42}"/>'
             f'<line x1="{cx+r*0.32}" y1="{cy+r*0.45}" x2="{cx+r*0.55}" y2="{cy+r*0.9}"/>'
             f'<line x1="{cx-r*0.32}" y1="{cy+r*0.45}" x2="{cx-r*0.55}" y2="{cy+r*0.9}"/>')
    return ball_with_mask(cx, cy, r, seams, "sc")

def climbing():
    # carabiner at the ball slot: the climbing sign that is not a wall
    return ('<path class="ink" fill-rule="evenodd" d="M1760 855c-100 0-181 84-181 188v96c0 104 81 188 181 188s181-84 181-188v-96c0-104-81-188-181-188zm0 74c62 0 111 51 111 114v96c0 63-49 114-111 114s-111-51-111-114v-96c0-63 49-114 111-114z"/>'
            '<path class="ink" d="M1866 890l-150 118a26 26 0 0 0 32 41l150-118a26 26 0 0 0-32-41z"/>')

PROPS = {
    "basketball": basketball, "tennis": tennis, "rugby": rugby, "football": football, "pickleball": pickleball,
    "sledhockey": sledhockey, "baseball": baseball, "golf": golf, "volleyball": volleyball, "goalball": goalball,
    "boccia": boccia, "rowing": rowing, "swimming": swimming, "skiing": skiing, "waterskiing": waterskiing,
    "cycling": cycling, "soccer": soccer, "climbing": climbing,
    # Veteran wellness (Spec 175) — same rule: the 2026 athlete plus one prop, never a lone symbol.
    "equine-therapy": equine_therapy, "art-therapy": art_therapy, "veteran-meetup": veteran_meetup,
}

def svg(body, title):
    return (f'<!-- {title}: the 2026 Adapt To Life athlete (logo paths, untouched) + one prop.\n'
            f'     Generated by scripts/emblem-series.py — edit the script, not this file. -->\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" width="1780" height="1780" viewBox="{VIEWBOX}" aria-hidden="true">\n'
            f'  <style>.ink{{fill:{INK}}}</style>\n  {athlete()}\n  {body}\n</svg>\n')

def main():
    out = ["athlete"]
    (EMB / "athlete.svg").write_text(svg("", "Athlete stamp"))
    for key, fn in PROPS.items():
        (EMB / f"athlete-{key}.svg").write_text(svg(fn(), f"Athlete + {key}")); out.append(f"athlete-{key}")
    cells = "".join(f'<figure><img src="/emblems/{n}.svg" alt=""><figcaption>{n}</figcaption></figure>' for n in out)
    (EMB / "series.html").write_text(
        '<!doctype html><meta charset="utf-8"><title>ASNM athlete emblem series</title>'
        '<style>body{margin:0;padding:32px;background:#F6F4F0;font:14px/1.4 system-ui;color:#1A1A1A}'
        'main{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:20px}'
        'figure{margin:0;background:#fff;border-radius:16px;padding:12px;text-align:center}img{width:100%;height:auto}</style>'
        f'<h1>Athlete emblem series</h1><p>The 2026 Adapt To Life athlete plus one prop per sport. One colour, built from the logo paths.</p><main>{cells}</main>')
    print("wrote", len(out), "emblems + series.html")
    if "--png" in sys.argv:
        d = pathlib.Path(sys.argv[sys.argv.index("--png") + 1]); d.mkdir(parents=True, exist_ok=True)
        for n in out:
            subprocess.run(["rsvg-convert", "-w", "260", "-h", "260", "-b", "#F6F4F0", str(EMB / f"{n}.svg"), "-o", str(d / f"{n}.png")], check=True)
        print("png previews in", d)

if __name__ == "__main__":
    main()
