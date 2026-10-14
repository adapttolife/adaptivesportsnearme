# ASNM round three: build spec ("Near You", rebuilt)

Status: prototype only. Write only in `/home/agentos/wt/asnm-design2/public/design/r3/`. Do not commit, push or deploy, and do not touch production, D1 or the asnm-launch worktree. Nothing gets sent.

## 0. The direction in one paragraph

Every listing is a postcard from a place, and Alec's athlete is the picture. The first question is "Where do you play?" and every answer follows the same honest order: in your city, then within about 25 miles, then elsewhere in your state, then across your state with no single city listed. The sport images carry the color: each athlete is drawn in its family's deep color on that family's soft tint, normalized so goalball and football look the same size. Place is a second visual idea, kept out of the way of the art: state outlines with city dots in result headers and state banners, one MapLibre pin per city, and a place stamp on the listing hero. The wow screens are the home poster mosaic, the sport and state community pages, the listing hero, and a 4:5 share poster sized for Instagram. White paper, black type, orange only for signals, DM Sans at 17px and up, 44px tap targets, phone first.

Base: Near You. Skeleton: Clubhouse (path-mirror routes, tokens, one community template, compact rows, focus trap). Grafted from Gallery: the listing page and booking box, the share poster, ZIP to city labels, athlete-first grants, and the overlay and a11y patterns.

---

## 1. File plan and contracts

```
public/design/r3/
  index.html          WP-A  shell (only HTML file)
  logo.svg            WP-A  copy of /favicon.svg with the @media (prefers-color-scheme: dark) rule deleted, nothing else changed
  app.css             WP-A  tokens, reset, chrome, every shared component
  app.js              WP-A  ES module: router, data, place logic, components, overlays
  views/
    home.js   home.css        WP-B
    sports.js sports.css      WP-B
    states.js states.css      WP-B
    near.js   near.css        WP-C
    map.js    map.css         WP-C
    sport.js  sport.css       WP-D
    state.js  state.css       WP-D
    program.js program.css    WP-E
    grants.js grants.css      WP-F
    grant.js  grant.css       WP-F
    events.js events.css      WP-F
    forms.js  forms.css       WP-G
    help.js   help.css        WP-G
```

Every view ships its `.css` file, even if it's empty. View CSS must be scoped under `.v-<name>` (app.js sets `main.className = "v-" + name`). Shared components live only in app.css, which WP-A owns. A view builder who needs a new shared component writes it in their view file, prefixed `.v-<name>`, and lists it in a top comment under `PROMOTE:` so WP-A can lift it later.

### 1.1 index.html (exact)

```html
<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Adaptive Sports Near Me</title>
<meta name="description" content="Find adaptive sports programs, grants and events near you. Free, no account needed.">
<link rel="icon" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/design/r3/app.css">
<script src="/listing-art.js"></script>
<script src="/design/core.js"></script>
<script src="/assets/vendor/lucide-1.49.0.min.js"></script>
<script type="module" src="/design/r3/app.js"></script>
</head><body>
<a class="skip" href="#/" data-skip>Skip to content</a>
<div id="beta"></div>
<header id="top"></header>
<div id="shell" class="shell">
  <nav id="rail" aria-label="Site"></nav>
  <main id="main" tabindex="-1"></main>
  <aside id="aside" aria-label="About this directory"></aside>
</div>
<footer id="foot"></footer>
<div id="sticky"></div>
<div id="overlay"></div>
<div id="live" class="sr" aria-live="polite"></div>
</body></html>
```

The skip link and every in-page jump must use JS (`preventDefault`, then focus the target). A plain `#id` anchor would replace the hash route.

### 1.2 Routes (hash routes that mirror the future server paths)

| Hash route | View | Query params |
|---|---|---|
| `#/` | home | `open=search|sports|menu` (QA only, for any route) |
| `#/near/:place` | near | `s=<sportKey>`, `v=1` (verified only), `map=1` |
| `#/sports` | sports | |
| `#/sports/:key` | sport | `t=programs|grants|events` (default programs), `st=<ST>` |
| `#/states` | states | |
| `#/states/:st` | state | `s=<sportKey>`, `map=1` |
| `#/programs/:id` | program | `share=1` |
| `#/grants` | grants | `a=athlete|program|all` (default athlete) |
| `#/grants/:id` | grant | |
| `#/events` | events | |
| `#/add/program`, `#/add/event`, `#/update/:id` | forms | update: `rel=run|attend|other` (default other) |
| `#/help`, `#/about`, `#/resources`, `#/letter` | help | |
| anything else | app.js `notFound()` | |

`:place` is `encodeURIComponent(label)`, for example `#/near/Tampa%2C%20FL`. `:st` is upper case. Internal links are always `href="#/..."`. Query changes that only filter (sport chip, verified toggle, grants audience, sport tab) use `nav(href, {replace: true})`. Real page changes push a history entry.

### 1.3 The view module contract

Each `views/<name>.js` is an ES module:

```js
import * as A from "../app.js";            // only import; never import another view

export async function render(ctx) {
  // ctx = { name, path, params, query, data, isBack, isFirst }
  return {
    title: "Tennis near Tampa, FL · Adaptive Sports Near Me", // document.title
    description: "…",          // sets meta[name=description] (future SSR meta)
    html: "<section>…</section>", // goes into <main>; must contain exactly one <h1 tabindex="-1">
    aside: "",                 // optional; app puts it in #aside at >=1280px, appends it to main below that
    sticky: "",                // optional phone bottom bar HTML (see 4.13); app toggles body.has-sticky
    railActive: "grants"       // optional; marks the current drawer/rail item
  };
}
export function mount(root, ctx) { /* optional listeners */ return () => {} /* cleanup */ }
```

`views/map.js` is the one exception. It exports `openMap(ctx, opts)` and `closeMap()` (see 5.3), and app.js calls it when `query.map === "1"` on near or state routes.

### 1.4 app.js: registry and render loop (WP-A)

```js
const ROUTES = [
  ["/", "home"], ["/near/:place", "near"], ["/sports", "sports"], ["/sports/:key", "sport"],
  ["/states", "states"], ["/states/:st", "state"], ["/programs/:id", "program"],
  ["/grants", "grants"], ["/grants/:id", "grant"], ["/events", "events"],
  ["/add/program", "forms"], ["/add/event", "forms"], ["/update/:id", "forms"],
  ["/help", "help"], ["/about", "help"], ["/resources", "help"], ["/letter", "help"],
];
```

`render()` runs on load and on every `hashchange`:
1. Parse `location.hash` into path and query. If the hash doesn't start with `#/`, ignore the event.
2. Match ROUTES. Dynamically import the module (`import("./views/" + name + ".js")`, cached). Before the first render of a view, inject its CSS link and await its load.
3. Save `scrollY` for the outgoing route key in sessionStorage (`asnm.scroll.<hash>`).
4. Call the previous cleanup. Call `await mod.render(ctx)`. Write `#main` (class `v-<name>`), `#aside`, `#sticky` and the title.
5. Call `mod.mount?.(main, ctx)`.
6. If `ctx.isBack` (a popstate to a seen hash), restore the saved scroll after paint; otherwise `scrollTo(0,0)`. Set `history.scrollRestoration = "manual"`.
7. On any navigation except the first, focus the `h1` and write the title into `#live`.
8. Handle `query.open` (search, sports or menu) and `query.map`.
9. Count in-app navigations in sessionStorage `asnm.navs` (`backOr()` uses it).

Global delegated handlers, set once:
- `[data-open="search|sports|menu"]` opens that overlay.
- `[data-close]` closes it.
- `[data-jump="<id>"]` scrolls to that id and focuses it.
- `[data-back]` calls `backOr(fallbackHref)`.
- `[data-share]` calls `navigator.share`, else copies the link and says "Link copied" in `#live`.
- `form[data-letter]`, `form[data-proto]` get the prototype submit handler (4.15).
- `[data-skip]` focuses `#main`.

Chrome is rendered once, then refreshed only where it changes: `betaBar()` into #beta, `header()` into #top, `drawerList(active)` into #rail (desktop rail) and the drawer overlay, `footer()` into #foot.

`notFound()` content: H1 "We couldn't find that page". Body "The link may be old, or the listing may have moved." Buttons: "Find a program" (`#/`) and "Browse sports" (`#/sports`).

### 1.5 app.js exports (exact names; views use only these)

Data and place:
- `loadData(): Promise<D>`, memoized and loaded once at boot. It fetches `/design/programs.json`, `/design/grants.json`, `/design/states.json`, `/design/sports.json`. `D = { items, byId, grants, grantById, byState, sports, sportByKey, shapes, centers, events: [] }`.
- `loadGeo(): Promise<{places, zcta}>`, lazy. It fetches `/design/places.json` and `/design/zcta.json` on the first place search or locate.
- `resolvePlace(q): Promise<Where>`. `Where = { kind: "city"|"zip"|"state"|"none", label, short, city, state, coords:[lat,lng]|null, zip }`.
- `suggestPlaces(text, limit = 6): Promise<Array<{label, href}>>`
- `locateMe(): Promise<Where>`
- `ladder(where, pool): { inCity, near, elsewhere, statewide, dist: Map<id, miles> }`
- `relation(p, where): { inCity: bool, miles: number|null }`. This is the only source of distance text anywhere.
- `aboutMi(miles, {cap = false} = {}): string|null`
- `nearestOutside(where, pool, limit = 6): Array<{state, items}>`
- `parseDesc(p): { sports: string|null, served: string|null }`
- `grantInfo(g): { amount, deadlineText, past, closed, audienceLabel, open }`
- `sportName(key)`, `sportNote(key)`, `familyOf(key)`, `toneOf(key) -> {t, d}`
- `picGroup(key)`: the key whose picture this sport uses (5.2)
- `placeText(p)`, `cityShort(cityRaw)`, `isPlaced(p)`, `displayName(name)`, `shortDate(iso)`, `longDate(iso)`
- `remember(kind, value)` / `recall(kind)` for localStorage `asnm.place` (last searched label) and `asnm.recent` (last 3 sport keys)

Components (each returns an HTML string):
- `esc(s)`, `icon(name, size = 20)`
- `fig(key, {color} = {})`
- `plate(key, opts)`
- `avatar(key, size)`
- `trust(p, mode)`
- `programCard(p, ctx)`
- `programRow(p, ctx)`
- `rowList(list, ctx, {id, first = 12})`
- `grantRow(g)`, `grantCard(g)`
- `eventCard(e)`
- `sectionHead({title, sub, id, seeAll})`
- `emptyState({title, body, actions})`
- `letterBlock({source})`
- `helpBand()`
- `stateOutline(st, {dots = [], you = null, size = 120, fill = false})`
- `tileMap({counts, hrefFor, selected})`
- `sportBar({keys, active, hrefFor, label})`
- `jumpChips(groups)`
- `stickyBar({left, action})`
- `btn(label, href, kind = "ink"|"orange"|"line"|"text", {external, attrs})`
- `communityHeader(opts)` (4.10)
- `aboutBox()` (the desktop aside)

Navigation and overlays:
- `nav(href, {replace} = {})`, `backOr(fallbackHref)`
- `openSearch(preset)`, `openSportsSheet()`, `openDrawer()`, `closeOverlay()`
- `trapFocus(el): release()`
- `announce(text)`

---

## 2. Design tokens (app.css `:root`)

### 2.1 Color
```
--ink:#1A1A1A  --graphite:#3A3A37  --muted:#5F5D59   (muted is the lightest text allowed, on white AND on every tint)
--paper:#FFFFFF --mist:#F7F7F5 --sand:#F0EFEC
--line:#E4E2DD --line-strong:#CFCCC5
--orange:#C5430C  (actions, selected, focus, active pin; white text on it is OK)
--orange-ink:#A8370A (orange text under 18px)  --orange-soft:#FBEBDC
--flame:#E85D04 (logo file only; never text, never UI)
--teal:#0E6F73 (Verified status)  --teal-soft:#E3F1F1
--error:#B42318  --error-soft:#FDECEA
--focus: 0 0 0 3px #FFFFFF, 0 0 0 5px #C5430C
```
Verified uses teal, not green #1F6B3A. Balance: page white; Mist and Sand bands; black for type and the one primary button; orange for signals only (search submit, selected chip underline, focus, the active pin, the tile-map top tier).

### 2.2 Sport family tints (soft `--t` / deep `--d`)
| Family | Keys | soft | deep |
|---|---|---|---|
| court | basketball volleyball boccia goalball handball curling fencing martialarts dance powerlifting blindsports | #F7E1CF | #B4461C |
| racquet | tennis pickleball | #EAF0CF | #5A6F10 |
| field | football rugby soccer baseball softball beepbaseball lacrosse archery shooting trackfield running wheelchairracing amputeesports | #D9EBD5 | #2F7043 |
| snow | skiing sledhockey nordicskiing | #DAE7F4 | #2B62A0 |
| water | swimming rowing waterskiing sailing surfing | #D3ECE8 | #0C716F |
| trail | cycling handcycling triathlon climbing golf | #F2E5CC | #925F17 |
| calm | equestrian equestrianvaulting equine-therapy art-therapy veteran-meetup | #E7E0F2 | #5E4A9C |
| house | multi, unknown | #EDE8E0 | #262523 |
| grant | grant | #F5EBC9 | #8A6300 |
| event | event | #FBE2D8 | #C63F22 |

Pale variant (state page cards, sheet grid hover): `color-mix(in srgb, var(--t) 50%, #fff)`.
**Inversion rule:** white-on-deep (the inverted hero and poster) is allowed for court, racquet, field, snow, water, trail and calm. Never invert house, grant or event; they always use soft tint with a deep figure.

### 2.3 Type (DM Sans only; fallbacks Arial, Helvetica, system-ui, sans-serif; `font-optical-sizing:auto`; tabular numerals on counts, dates and amounts)
| Token | Phone | >=768px | Weight / line height |
|---|---|---|---|
| display | 40px | 56px (64 at >=1280) | 700 / 1.04, letter-spacing -0.02em |
| h1 | 30px | 40px | 700 / 1.12, -0.015em |
| h2 | 24px | 28px | 700 / 1.2 |
| h3 (card name) | 18px | 18px | 700 / 1.3 |
| body | 17px | 18px | 400 / 1.55 |
| meta (sport, place) | 16px | 16px | 500 / 1.4, graphite |
| trust | 15px | 15px | 500 / 1.4 |
| label (chips, rail, buttons) | 15px | 15px | 600 |
| button | 16px | 16px | 700 |

Floor: no text under 15px. The only exceptions are tile-map state codes (13px/700 on pale tiers) and map attribution. Sentence case everywhere. No all caps, except tile codes. Lines max 68ch. Inputs 17px.

### 2.4 Space, radius, shadow, motion
- Space scale (px): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80. Gutter: 16 on phone, 24 at >=768, 40 at >=1100. Content max 1280. Section gap: 48 on phone, 64 on desktop.
- Radius: `--r-s:8px` (chips inside cards), `--r:12px` (buttons, inputs, rows), `--r-l:16px` (cards, plates), `--r-xl:20px` (hero on desktop, sheets), pills 999px.
- Shadows: `--sh-1: 0 1px 2px rgba(26,26,26,.06), 0 1px 1px rgba(26,26,26,.04)` (cards on hover only); `--sh-2: 0 8px 24px rgba(26,26,26,.12)` (sheets, booking box); `--sh-pill: 0 2px 10px rgba(26,26,26,.10)` plus a 1px `--line` border (search pill). No decorative depth.
- Motion: 180ms ease-out. Tap scale 1 to 1.06 to 1 on avatars. Card hover lifts the figure with `scale:1.03`. Everything is off under `prefers-reduced-motion: reduce`. Nothing pulses.

### 2.5 Layout
- <1100px: one column. The drawer is an overlay.
- >=1100px: a 272px left rail (the drawer list, sticky, scrolls on its own) plus the main column. Hide the header menu button.
- >=1280px: views that return `aside` get a 300px right column (sticky), so main is about 640 to 708px.
- Bottom padding: `body.has-sticky main { padding-bottom: calc(96px + env(safe-area-inset-bottom)) }`.

---

## 3. Image treatment (Alec's sport set)

### 3.1 Source and recolor
- Files: `/emblems/sports/<key>.svg`. app.js must map `grant` to `/emblems/sports/grant.svg` and `event` to `/emblems/sports/event.svg` itself, because `ListingArt.symbolSrc('grant')` returns multi.svg.
- Recolor with a mask. `fig(key, {color})` returns `<i class="fig" aria-hidden="true" style="--src:url(/emblems/sports/KEY.svg);--w:W;--h:H;--g:G;--dk:DK;--cx:CX;color:COLOR"></i>`:
```css
.fig{display:block;aspect-ratio:1;width:62%;background:currentColor;
 -webkit-mask:var(--src) center/contain no-repeat;mask:var(--src) center/contain no-repeat;
 translate:clamp(-5%, calc(var(--cx,0) * -50%), 5%) 0}
@media (forced-colors:active){.fig{forced-color-adjust:none;background:CanvasText}}
```
- `OPTICAL` table: copy the 47-key object from `public/design/r3-clubhouse.js` line 43 into app.js as `const OPTICAL` (`[w, h, g, density, cx]`). Compute `dk = clamp(Math.pow(0.31/density, 0.3), 0.90, 1.04)`. (Production should move this to `ListingArt.OPTICAL`.)
- Inside every plate (which is `container-type:size`):
  `width:min(calc(var(--A)*100cqh/var(--g)*var(--dk)), calc(var(--Hm)*100cqh/var(--h)), calc(var(--Wm)*100cqw/var(--w)))`, with the plain `width:62%` as the fallback above it.

### 3.2 Sizes and grounds (one style per grid; never the old 3D icons or photos)
| Use | Box | Ground / figure | A / Hm / Wm |
|---|---|---|---|
| Card plate | 4:3, radius 16 (16:9 when the card is full-width on a phone) | soft tint / deep | .62 / .80 / .84 |
| Row tile | 72px phone, 84px >=768, square, radius 12 | soft / deep | .66 / .84 / .88 |
| Sport bar avatar | 56px phone, 64px >=768, circle | soft / deep, always full color, never opacity | .72 / .80 / .80 |
| Drawer avatar | 40px circle | soft / deep | .74 / .82 / .82 |
| Sports grid / sheet avatar | 72px circle | soft / deep | .72 / .80 / .80 |
| Home mosaic tile | square (big tile 2x2) | soft / deep, label inside bottom-left | .64 / .78 / .80 |
| Community banner | 160px phone, 220px >=768, full width (radius 20 at >=768) | deep / white (inversion families); soft / deep (house, grant, event) | athlete right-aligned, height 86% of banner, no ghost copy |
| Listing hero | 16:10 phone full-bleed; >=768 16:9, max-height 440px, radius 20 | deep / white (inversion families); soft / deep (house) | bleed crop (3.3) |
| Share poster | 4:5 (preview 320px wide; production 1080x1350) | same as hero | .58 / .66 / .80, centered upper half |

Never draw any image under 40px. Group scenes (event, veteran-meetup, art-therapy, grant, multi, soccer, football, lacrosse, handball, softball, volleyball, triathlon, nordicskiing) never go under 56px, except in the 40px drawer avatar, where a 17px label sits next to it. Every image is decorative (`aria-hidden`) because the sport is always named in text next to it.

### 3.3 Hero bleed crop
For keys not in `FLOOR_PROP = {soccer, sledhockey, golf, boccia, curling, goalball, blindsports}`, use `--A:.80;--Hm:1.0;--Wm:.70`. Anchor the figure right (`right:6cqw`) and push it down `translate: … 14%` so about 12% bleeds off the bottom edge. FLOOR_PROP keys sit centered with `.62/.78/.84` and no bleed.

### 3.4 Multi-sport trio (display-only retag; needs Alec's nod, see open questions)
1. `parseDesc(p).sports` is the text after "Sports and activities:", up to ";" + "Athletes served:" or the end. Split it on ";" and ",". Map each part through `ListingArt.symbolKey({sportLabel: part})`, then through `picGroup()`, and dedupe.
2. If `p.sportKey === "multi"` and the parts map to exactly one key, set `p.key` to that key and `p.retagged = true`. The listing then shows under that sport everywhere.
3. If they map to 2 or more, `p.trio` = up to 3 keys, bold single athletes first (bold = not in the group-scene list above). The trio plate is the house soft tint, each figure in its own family deep color. The first figure uses A .46 and the others A .36, sized with OPTICAL, and the figures sit in a bottom-aligned row with gaps. Never put a trio on a dark ground.
4. Otherwise multi shows the multi picture on the house soft tint.

### 3.5 Shared pictures (`picGroup`)
`equestrianvaulting` and `equine-therapy` map to `equestrian`; `blindsports` to `goalball`; `handcycling` to `cycling`; `wheelchairracing` to `trackfield`; `surfing` to `multi`.
In any grid of sports (sport bar, sports index, sheet, drawer), only the group's first key gets a tile. Siblings appear as text links under it, for example "Also: Equine therapy, Equestrian vaulting". Surfing appears under Sailing as "Also: Surfing".

### 3.6 Sport names (`sportName`) and notes
Take names and notes from `/design/sports.json`. Add the six it lacks:
- equestrianvaulting: "Equestrian vaulting" ("Gymnastics and dance on horseback.")
- equine-therapy: "Equine therapy" ("Therapeutic riding and time with horses.")
- blindsports: "Blind sports" ("Sports for blind and low-vision athletes.")
- wheelchairracing: "Wheelchair racing" ("Track and road racing in racing chairs.")
- handcycling: "Handcycling" ("Hand-powered cycling, road and trail.")
- surfing: "Surfing" ("Adaptive surfing and surf days.")

Override: `multi` = "Multi-sport", `equestrian` = "Horseback riding". Never show a raw key or the raw `sportLabel` on a card.

---

## 4. Components (app.css + app.js, WP-A)

### 4.1 Beta bar `betaBar()`
Sand (#F0EFEC) ground, ink text, 15px/500, min-height 44px, padding 8px 16px. Text: "This directory is new and still growing. **Help us build it**". The bold phrase is an underlined link to `#/help`, and the whole bar is a 44px-tall hit area. There's a dismiss button (44x44, `icon("x")`, aria-label "Hide this message") that stores `asnm.beta=0` in localStorage. Never black. At most 2 lines on a 390px phone.

### 4.2 Header `header()`
56px tall, white, 1px `--line` bottom border, not sticky.
- Left: menu button (44x44, `icon("menu")`, aria-label "Menu", `data-open="menu"`, hidden at >=1100px). Then the logo link to `#/`: `<img src="/design/r3/logo.svg" alt="" width="32" height="32">` plus the text "Adaptive Sports Near Me" at 17px/700. The link's accessible name is "Adaptive Sports Near Me, home".
- Right: a search button (44x44, `icon("search")`, aria-label "Search", `data-open="search"`; hidden on home). Then an "Add" button: 44px tall, outlined `--line-strong`, radius 12, `icon("plus")` + "Add", to `#/help`. Keep 16px from the right edge.
- The official mark is unchanged and never sits next to or inside a sport image.

### 4.3 Search sheet `openSearch(preset)`
A full-screen dialog on phones; a centered 640px dialog at >=768px (radius 20, `--sh-2`). `role="dialog" aria-modal="true" aria-labelledby`.
- Top row: close button (44px, aria-label "Close"), h2 "Search".
- **Where?** Label "City, state or ZIP". The input is 56px with autocomplete off. Below it, a type-ahead list of up to 6 `suggestPlaces` results as 48px buttons, plus a "Use my location" button (44px, `icon("locate")`). While working, show "Finding your city…". On failure: "We couldn't get your location. Type your city instead."
- **Which sport?** (optional). A 4-column grid of 72px avatars with 15px labels. The first tile is "Any sport" (a ring icon, selected by default). Show the 12 most-listed sports, then a "Show all sports" button that expands to all picture groups (3.5).
- Sticky footer: "Clear" (text button) and "Show programs" (ink button, 48px).
- Submit rules:
  - city or ZIP: `#/near/<label>?s=<key>`
  - state + sport: `#/states/<ST>?s=<key>` (the sport stays selected)
  - state only: `#/states/<ST>`
  - sport only: `#/sports/<key>`
  - nothing: inline error "Enter a city, state, or ZIP code."
- Unresolved place: inline under the input, `We couldn't find "<text>". Try a city and state, like Springfield, IL, or a 5-digit ZIP code.`
- `preset` = `{place, sport}` pre-fills the sheet.

### 4.4 Drawer `openDrawer()` / desktop rail `drawerList(active)`
Width `min(86vw, 320px)` from the left, with a scrim. At >=1100px the same list renders in `#rail` (272px, sticky, scrolls on its own). Rows are 48px min, 17px/600, with `icon()` 20px left. The drawer header is the logo (32px) and the close button; no wordmark text, so nothing gets cut off. When closed (phone), the drawer is `hidden` plus `inert`.

Sections, in order:
1. **Recently viewed**: up to 3 sports from `recall("recent")`, 40px avatars. Only shown if there are any.
2. **Find**: "Programs near you" (`#/near/<saved place>` if there is one, else opens search), "Sports", "States", "Grants", "Events".
3. **Sports**: the 12 most-listed picture groups with 40px avatars, then "All sports" (`#/sports`).
4. **Help build this**: "Add a program", "Add an event", "Claim your program" (`#/help`), "How we check listings" (`#/about`).
5. **More**: "Get the letter" (`#/letter`), "Resources" (`#/resources`).

No counts anywhere in the drawer. No emoji. The active item gets `aria-current="page"`, a 4px orange left bar and weight 700.

### 4.5 Sport bar `sportBar({keys, active, hrefFor, label})`
A horizontal scroller (`overflow-x:auto`, `scroll-snap-type:x proximity`). 16px side padding; the 5th item is cut off at the edge, and a 24px white fade on the right edge is the cue that it scrolls. `role` stays the default; the `<nav aria-label="Sports">` is a list of links.
- Each item is min 80px wide, max 96px. An avatar (56px/64px), then the label 15px/600 underneath, up to 2 lines, centered, with 8px between them.
- First item: "All", with a grid icon in a Mist circle.
- Active item: `aria-current="true"`, the avatar gets a 2px ink ring with a 2px white gap, the label goes 700, and a 3px ink underline 24px wide sits under the label.
- Inactive items are full color. Never use opacity.
- Order: global popularity (sports.json order), filtered to `keys`, which is only the sports present in the current pool. A sport with nothing here never appears.
- Tap: `nav(hrefFor(key), {replace:true})` plus a 180ms avatar scale (off under reduced motion).
- Last item: "All sports" (opens the sports sheet). Only on the sport-agnostic bar on home and results.

### 4.6 Program card `programCard(p, ctx)` (lists that mix sports only)
```
<a class="pcard" href="#/programs/ID">
  plate: 4:3 soft tint, figure deep (or trio); top-left "Verified" pill only when verified;
         top-right place stamp ONLY when ctx.stamp === true
  <h3>name</h3>                  18/700, max 3 lines (line-clamp 3; full name in title attr)
  <p class="meta">Tennis · Tampa, FL</p>          16/500 graphite, never truncated
  <p class="dist">About 12 mi</p>                 16 muted; only if relation() gives miles and !inCity
  trust(p, "short")                               15/500
</a>
```
- Verified pill: white, 32px tall, 12px side padding, `icon("badge-check", 18)` in teal, then "Verified" 15/700 ink, `--sh-1`.
- Place stamp: a 48x48 white rounded-12 chip, `stateOutline(st, {size: 32})` in ink, with a 6px orange dot at the city if placed, or the outline filled with `--line-strong` if not. It's `aria-hidden` because the text already says the place.
- Layout:
  - Phone rails: cards 264px wide, gap 12.
  - Phone full-width card: plate becomes 16:9.
  - Grids: 2 columns from 600px, 3 from 900px, 4 at >=1280px (when there's no aside).
- Hover: border `--line-strong` and `--sh-1`. Focus uses `--focus` on the whole card.
- No heart, no type field, no score, no description on cards.

### 4.7 Program row `programRow(p, ctx)` (lists of one sport, and every far group)
A 72/84px tile on the LEFT, then text. Min height 96px, 12px vertical padding, 1px `--line` between rows.
- Line 1: name 18/700. No clamp; it wraps.
- Line 2: meta 16/500, `"Tennis · Tampa, FL"`. If the list is all one sport, show only the place.
- Line 3: one line holding the distance if any (`About 12 mi · `), then `trust(p,"short")`.
- `rowList(list, ctx, {id, first = 12})` renders the first 12 and then a "Show all 69" button (48px, line style). The button reveals the rest in place, moves focus to the 13th row and announces "Showing all 69".

### 4.8 Trust line `trust(p, mode)` (one function; the wording is final)
| Data | `short` (cards, rows, sticky bar) | `page` (listing trust box) |
|---|---|---|
| verified + lastChecked | "Verified · Website checked Oct 8" | Title "Verified". Body "A person on our team checked this program against an official source. Schedules change, so check the website before you go." Row "Website last checked: October 8, 2026" |
| verified + no date | "Verified · No check date yet" | same title and body; row "Website last checked: Not recorded yet" |
| unverified + listedAt (future API) | "Not yet verified · Listed Sep 2" | Title "Not yet verified". Body "We found this program, and no one on our team has confirmed it yet. Check the website before you go." Row "Listed: September 2, 2026, not checked yet" |
| unverified + lastChecked | "Not yet verified · Website checked Oct 9" | same title and body; row "Website last checked: October 9, 2026" |
| unverified + nothing | "Not yet verified · No check date yet" | same; row "Website last checked: Not recorded yet" |

- Icons: verified gets `badge-check` in teal; unverified gets `circle-dashed` in muted. Text color: ink for "Verified", muted for the rest. Status is never shown by color alone.
- Dates: "Oct 8" in the current year, "Oct 8, 2025" otherwise; long form "October 8, 2026".
- Never write "or call" anywhere. Never show freshness, quality or a score. If verifiedMonth is ever present, add the row "Verified by a person: September 2026".

### 4.9 Grant row `grantRow(g)` / grant card `grantCard(g)`
- **Row** (the grants list; text first, no repeated image):
  - Name 18/700 (`displayName`).
  - "From <source>" 16 graphite.
  - A line with the amount (16/700 ink, only when real) · the deadline text (16).
  - Tags: a pill "For athletes" or "For programs" (Mist ground, 15/600, 32px tall). "Closed for now" (muted pill) if `open == 0`.
  - The whole row links to `#/grants/<id>`.
- **Card** (only the home rail and the sport page Grants tab, max 3 shown): 4:3 grant plate, soft #F5EBC9 with the deep #8A6300 figure. Top-left white pill "For athletes". Amount as h3-size text below the plate, then name and deadline.
- `grantInfo(g)`:
  - `amount` = g.amount unless null or "Varies".
  - `past` = the deadline matches `^[A-Z][a-z]+ \d{1,2}, 20\d\d$` and the date is before today.
  - `deadlineText`:
    - past: "Last deadline was June 15, 2026"
    - free text: "Deadline: <text>"; "Rolling" and "Year-round" read "Apply any time"
    - null: "Deadline: see their site"
    - en dashes in ranges become " to " ("Annual · Oct to Nov").
  - `open` = g.open == 1 and not past.

### 4.10 Community header `communityHeader({kind:"sport"|"state", key, st, title, line, count, actions, tabs})`
Shared by the sport and state pages (Reddit community).
- Banner (sizes in 3.2). Sport: deep ground with the white athlete right-aligned (house, grant and event: soft ground with a deep athlete). State: Sand ground with `stateOutline(st, {dots, size: 140})`, ink outline, orange city dots, right-aligned. No ghost copy behind the athlete. `aria-hidden`; no `role="img"`.
- Sport only: an 88px round two-tone avatar overlapping the banner's bottom-left by 32px, with a 4px white ring.
- H1 (30/40px).
- One-line note (17px graphite).
- `count`: local only (rules in 6.5).
- Actions row: "Get the letter" (ink button; `data-jump="letter"` to the letter block on the page), "Share" (line button, `data-share`). The state page also gets "Map" (line button, `icon("map")`).
- `tabs`: links styled as a 48px tab bar with the active one `aria-current="page"` (3px ink underline). Not role=tablist.

### 4.11 Empty state `emptyState({title, body, actions})`
A Mist panel, radius 16, padding 24. The event image as a 72px row tile only on events; otherwise no image. h2-size title (24px), 17px body, then up to 3 buttons (the first is the primary). Never the word "No results".

### 4.12 Letter `letterBlock({source})` (id="letter"; inline only, never a popup)
Sand band, radius 16 (full-bleed on phones).
- h2 "Get the letter". Text "New programs, grants and events, when there is something worth sending. No spam, and you can unsubscribe any time."
- `<form data-letter data-source="<route name>">`: a visible label "Email", an input (56px, type=email, autocomplete=email, placeholder "name@example.com"), a button "Subscribe" (ink, 56px). Honeypot: `<input name="company" tabindex="-1" autocomplete="off" class="hp">`. A checkbox "I want the first look at new features" (`name="beta"`, 44px row).
- Error: "Enter an email address, like name@example.com."
- Success (prototype): "Thanks. This is a prototype, so nothing was sent."
- It never promises sport- or place-specific mail.

### 4.13 Sticky action bar `stickyBar({left, action})` (phones <1100px only)
Fixed bottom, white, 1px top border, height 72px plus `env(safe-area-inset-bottom)`, 16px padding.
- Left: 15px trust or amount text, up to 2 lines.
- Right: the action button, ink, 48px tall, radius 12, 16/700, `icon("external-link",18)`, `target="_blank" rel="noopener"`.
- At >=1100px it's hidden, and the view's booking box takes over.

### 4.14 Buttons, chips, inputs
- Buttons are 48px tall (44 min for compact), radius 12, 16/700.
  - `ink`: #1A1A1A with white text. One per screen.
  - `orange`: only the search submit and "Add an event" on events.
  - `line`: white, 1px `--line-strong`, ink text.
  - `text`: ink underlined, padded to 44px.
- Chips: 44px tall pills, 1px `--line-strong`, 15/600. Selected: `--orange-soft` ground, ink text, a `check` icon and a 1.5px `--orange` border.
- Toggles are `<button aria-pressed>`. Filter chips that navigate are `<a aria-current>`.
- Inputs: 56px, radius 12, 1px `--line-strong`, 17px. Focus: `--focus`. Errors: 2px `--error` border, a message below in `--error` 15px with an icon, `aria-invalid` and `aria-describedby`.

### 4.15 Prototype forms
Every `form[data-proto]` and `form[data-letter]` validates in place: required fields, email format, and a `^https?://` website. It never submits. On success it replaces the form with a status panel: "Thanks. This is a prototype, so nothing was sent." Turnstile is not drawn. Production forms post to the existing endpoints with Turnstile and the honeypot.

### 4.16 Footer `footer()`
Mist ground, padding 48/24.
- Logo plus the line "A free directory of adaptive sports programs, grants and events. We list programs; we don't run them."
- Three link columns (48px rows on phone):
  - **Find**: Programs near you, Sports, States, Grants, Events
  - **Help build this**: Add a program, Add an event, Claim your program, How we check listings
  - **More**: Get the letter, Resources, Accessibility (`#/about`)
- Bottom line: "Adaptive Sports Near Me is a project of Adapt To Life. Check with each program before you go." and "© 2026 Adapt To Life".
- No donate, no waiver, no sponsor, no social counts.

### 4.17 State outline and tile map
- `stateOutline` uses `D.shapes[st]` (viewBox 0 0 100 100, fill none, stroke ink 1.5 non-scaling). Dots are r=1.8 orange; `you` is a 3px orange ring with a white center. Outlines are drawn only for the page's own state, not on every card (except the opt-in stamp).
- `tileMap({counts, hrefFor, selected})`: copy GRID from `r3-nearyou.js` line 235. CSS grid of 11 columns.
  - Tiles are `aspect-ratio:1`, radius 8. At >=768px tiles are 48px min and show the code 13/700 plus a count 15/600.
  - On phones the tiles are about 31px and show the code only.
  - Tiers: 0 = white with a `--line-strong` border and muted code; 1-9 = #FBEBDC; 10-29 = #F7D3B5; 30-59 = #F0B48A, all with ink code; 60+ = #C5430C with a white code.
  - Every tile is a link with aria-label "Florida". Legend: "Darker means more listings so far."
  - Always render a "Choose a state" list right after it: 2 columns, 48px rows, full state names (`<a>` to `#/states/XX`). That list is the accessible primary on phones.

---

## 5. Data rules (app.js; these are the only implementations)

### 5.1 Normalizing items at load
For each program:
- `key = picGroup-aware symbol key` (start from `p.sportKey`, then apply the retag in 3.4).
- `family`, `tone`, `verified = verification === "verified"`, `name = displayName(raw)`.
- `website` = a valid `^https?://` URL or null (27 junk relative URLs become null).
- `cityFirst = cityShort(p.city)`, `placed = isPlaced(p)`.

Functions:
- `cityShort(c)` (from r3-nearyou, without the length cut):
  1. null for empty or `^statewide$`.
  2. Strip a trailing `*…` and a trailing ` XX` state code.
  3. If ` - ` is present, take the last part.
  4. Take the first segment split on `/ ; ( ,`.
  5. Trim a trailing dash.
  6. If the raw text listed several places, return `"<first> and more"`.
  7. Never add an ellipsis.
- `isPlaced(p)` = `p.geo === "city" && p.lat != null && p.geoPrecision !== "state" && cityFirst && !/statewide|multiple|various|throughout|^.*\bcounty$|\bregion\b/i.test(cityFirst)`. Only the FIRST segment is tested, so "Athens / Clarke County" is placed as Athens.
- `placeText(p)`:
  - placed: `"Tampa, FL"`
  - state, raw city text that isn't "statewide": `"<raw first segment>, FL"`, for example "Escambia County, FL"
  - state only: `"Florida, no single city listed"`
  - no state: `"Place not listed yet"`
- `displayName(s)`: replace a spaced en or em dash (`\s[–—]\s`) with ": " (one rule for programs AND grants; open question 3).

### 5.2 resolvePlace(q)
1. Trim, collapse spaces, drop a trailing ", USA".
2. ZIP `^(\d{5})(-\d{4})?$`: look up zcta. If it's missing: `kind:"none"`. Otherwise find the nearest places.json city in the ZIP3 state, then `kind:"zip"`, `zip`, `city` = that city, `coords` = the ZIP coords. Label: `"33602, Tampa, FL"`.
3. A whole string that is a state code or full name (case-insensitive) is `kind:"state"`.
4. Trailing state: `^(.+?)[,\s]+([A-Za-z]{2}|<any full state name>)$`, where the trailing token is a real state. The rest is the city. This accepts "Tampa FL", "Tampa, FL", "tampa florida" and "Brandon FL".
5. City normalization matches the places.json keys: lowercase, delete ".", `\bsaint\b` to "st", `\bfort\b` to "ft", `\bmount\b` stays, collapse spaces, KEEP hyphens and apostrophes. Try that key first, then the variant with hyphens turned into spaces. Aliases: "st pete" to "st petersburg", "philly" to "philadelphia", "nyc" to "new york".
6. With no state given: use core.js BIG_CITIES; else the state with the most places.json keys equal to that city name, preferring the one with the most listings.
7. Found: `kind:"city"`, `label:"Tampa, FL"` (title case from the input words), `coords`. A city not in the gazetteer is `kind:"none"`. Never guess a location.

`suggestPlaces(text)`: once there are 2+ characters, match places.json keys whose city starts with the normalized text. Rank cities that have a placed listing first, then alphabetically. Add state names that match. Labels look like "St. Petersburg, FL" (restore "St." and "Ft." in display).

`locateMe()`: get the browser position, then snap to the nearest city among the **cities of placed listings** within 30 mi. Otherwise use the nearest places.json city. Return it as `kind:"city"` with that city's coords; never keep raw GPS. The caller navigates straight to `#/near/<label>` with no extra tap. A Tampa fix lands on "Tampa, FL", not "Egypt Lake-Leto".

### 5.3 The near ladder `ladder(where, pool)`
`relation(p, where)`: `miles = haversine(where.coords, [p.lat,p.lng])` only when both are known and p is placed. `inCity = where.city && p.state === where.state && p.placed && (norm(p.cityFirst) === norm(where.city) || miles < 1)`.
- **inCity**: sort verified first, then by name.
- **near**: not inCity and miles < 25.5. Crossing state lines is allowed. Sort by miles.
- **elsewhere**: same state, placed, not in the above. Sort by miles when there are coords, else by name.
- **statewide**: same state, not placed. Sort verified first, then by name.
- Listings with no state never appear in place results.

`aboutMi(m)`: null if inCity or m < 1. Otherwise round to the nearest 1 below 10 and the nearest 5 at 10 and up. Text: "About 12 mi" at the start of a line, "about 12 mi" mid-sentence. Every results page carries this note once, under the header: "Distances are city to city, so they are close, not exact."

Group headings (final copy):
- "In Tampa"
- "Within about 25 miles"
- "Elsewhere in Florida"
- "Across Florida, no single city listed"

For a ZIP search there's no "In" group unless the ZIP's city matches; the group order still starts at 25 miles.

`nearestOutside(where, pool)`: when the current sport has nothing in the state, take placed listings of that sport in OTHER states. Group them by state, ordering states by the distance from `where.coords` (or the state center for a state search) to the nearest listing in each state. Return up to 3 states and 6 listings. Show each listing with "City, ST". Show miles only when where is a city or ZIP. The heading never says "closest" unless it is sorted this way; the heading is "Nearest <sport> outside <State>".

### 5.4 Counts (voice rule)
Counts appear only for the visitor's place or the state being viewed: results summaries, jump chips, sport-bar ordering, the state page line, the sport page with `st` set. No national totals anywhere: not on home, not on sport pages without a place, not in the drawer, not on sport avatars, not on the sports index, not in footers.

---

## 6. Pages (content order and final copy)

### 6.1 Home `#/` (views/home.js, WP-B)
Title: "Adaptive Sports Near Me: find adaptive sports near you".
1. **Hero.** Phone: one column. >=1100: a split, with the text column 5/12 and the mosaic 7/12.
   - Display h1: "Find adaptive sports near you." Bold the words "near you" in `--orange-ink`? **No**: the whole headline is ink. The line below is 17px graphite: "Programs, grants and events, each with the date we last checked it. Free, and no account needed."
   - Inline search form, with no sheet in between. Label "City, state or ZIP". The input is 56px with type-ahead (`suggestPlaces`), next to an orange "Search" button (56px, `icon("search")` + "Search"). Under it, a text button "Use my location" (44px, `icon("locate")`).
   - If `recall("place")` exists, add a chip "Last search: Tampa, FL" linking to `#/near/...`.
   - No example place chips.
   - Errors use the 4.3 wording, inline.
2. **Poster mosaic** "Explore by sport" (h2, visually hidden on phones; the mosaic is self-evident). Tiles, in order: basketball (big 2x2), tennis, swimming, equestrian, skiing, running, sailing, goalball, climbing. Phone: 3 columns, gap 8. Desktop: a 4x3 grid in the right column. Each tile links to `#/sports/<key>` and carries its label inside the tile, bottom-left (15/700 ink; big tile 20/700). Under the mosaic: a text link "See all sports" to `#/sports`. Budget: the top of the mosaic must sit 420px or less from the top on a 390x844 phone.
3. **"Near Tampa"** rail: only if `recall("place")`. The first 8 of `ladder(...)` inCity + near as cards. See all: "See all near Tampa".
4. **"Checked by a person"** rail. Sub: "A person on our team confirmed each of these against an official source." 8 cards with `ctx.stamp = true`. Pick verified + placed + lastChecked, one per key in the order tennis, basketball, equestrian, soccer, swimming, baseball, sledhockey, golf, rowing, archery, cycling, sailing; distinct states; latest lastChecked first. Phone: a horizontal rail. Desktop: a 4-column grid of 8.
5. **"Grants for athletes"**. Sub: "Money for equipment, travel and fees. You apply on the grant maker's site." The first 3 `grantRow`s from grants with audience athlete and `grantInfo.open` true, real amounts first. See all: "See all grants" to `#/grants?a=athlete`.
6. **"Browse by state"** with `tileMap` + the "Choose a state" list (collapsed behind a 48px "Show all states" button on phones, open on desktop).
7. **"Events"** with `emptyState`. Title "No events posted yet". Body "Know of a clinic, tryout or game day coming up? Add it and a person will check it before it goes live." Actions: "Add an event" (`#/add/event`, ink), "Subscribe to the calendar" (`/events.ics`, line).
8. `letterBlock({source:"home"})`
9. `helpBand()`: h2 "Help build this". Body "Know a program we missed, or run one listed here? Tell us." Buttons "Add a program", "Add an event", "Claim your program" (`#/help`).

No aside on home.

### 6.2 Near results `#/near/:place` (views/near.js, WP-C)
Title: "Programs near Tampa, FL" or "Tennis near Tampa, FL".
1. **Results header** (Mist band). On the left (on phones, above the text), `stateOutline(where.state, {dots: placed in-state listings in the current filter, you: where.coords, size: 120})`.
   - h1 "Programs near Tampa, FL" (sport filter: "Tennis near Tampa, FL"; ZIP: "Programs near 33602, Tampa, FL").
   - Summary (17px): "4 in Tampa · 6 within about 25 miles · 99 more in Florida". Zero parts are left out. "more in Florida" = elsewhere + statewide.
   - The 5.3 distance note.
   - State search: route to the state view instead (near.js calls `nav("#/states/XX", {replace:true})`).
2. **Sticky toolbar** (sticky top:0, white, 64px, bottom border; static when `max-height:500px`):
   - a place button "Tampa, FL · Any sport" with `icon("chevron-down")`, which calls `openSearch(preset)`
   - `<button aria-pressed>` "Verified only" (filter: `v=1`)
   - "Map" (`icon("map")`), which navigates with `map=1`
   - Nothing floats over content.
3. `sportBar` built from the sports present in the full ladder pool. Active = `s` or All.
4. `jumpChips`: "In Tampa · 4", "About 25 mi · 6", "Elsewhere in Florida · 69", "Across Florida · 30". Buttons with `data-jump` to the group ids; groups with 0 are left out.
5. Groups:
   - **"In Tampa"**: on a phone, the first 2 render as full-width cards (16:9 plates) and the rest as rows. Desktop: a card grid.
   - **"Within about 25 miles"**: no sport filter: phone shows the first 2 as cards, then rows; desktop shows a card grid of 6, then rows. With a sport filter: rows.
   - **"Elsewhere in Florida"** and **"Across Florida, no single city listed"**: always `rowList(first 12)`.
   - Under the statewide heading, the line "These programs serve Florida but don't list a single city."
6. **Empty or thin.** If inCity + near + elsewhere + statewide is 0 for the sport: `emptyState`. Title "No tennis near Tampa yet". Body "This directory is new and still growing." Actions "See every sport near Tampa" (drops `s`), "Tell us about one" (`#/add/program`). Then `nearestOutside` under h2 "Nearest tennis outside Florida".
7. **Place not found** (`kind:"none"`): h1 `We couldn't find "Atlantis"`. Body "Try a city and state, like Springfield, IL, or a 5-digit ZIP code." Then the search form inline and the "Choose a state" list.
8. `letterBlock({source:"near"})`, `helpBand()`.

Side effects:
- On a successful resolve, call `remember("place", label)`.
- After filter changes, `announce("10 programs near Tampa, FL")`.
- Aside at >=1280: `aboutBox()`.

### 6.3 Map overlay (views/map.js, WP-C)
`export async function openMap(ctx, {where, state, sport, verifiedOnly})` and `export function closeMap()`. app.js calls `openMap` when `query.map==="1"` on near or state; closing navigates `history.back()` if the map was pushed, else replaces the hash with `map` removed.
- Full-screen dialog (`role="dialog"`, labelled by the title, focus trapped, Escape closes).
- Top bar: close (44px), title "Tennis near Tampa, FL" or "Florida".
- Below it, the statewide strip: a button "Across Florida, no single city listed · 30". It closes the map and jumps to that group.
- MapLibre: load `/assets/vendor/maplibre-gl.js` and `.css` lazily; style `https://tiles.openfreemap.org/styles/positron`.
  - One source of city points: placed listings grouped by `state|cityFirst` at the mean lat/lng, with property `count` (+ `key` when the whole city is one sport).
  - Pins are white circles, 2px ink border, ink count 15/700, 36px min.
  - The selected pin is an orange fill with a white count, 44px, plus the city label. Shape and size differ, not just color.
  - Cluster at zoom < 7: an ink circle with a white count.
  - "You": an orange ring (where.coords). Fit bounds to the state, or to where plus the 25 mi results.
- Tap a pin: a bottom card (white, radius 20 top, `--sh-2`) with h2 "Tampa, FL", the first 3 `programRow`s and the link "See all 4 in Tampa" (closes the map and jumps to the group).
- At the bottom center, a "List" button (ink pill, 48px, `icon("list")` + "List"). It sits inside the map overlay only.
- Load failure: "The map could not load. Your results are still in the list." plus the "Back to the list" button.
- The list is always the keyboard alternative; dragging is never required.

### 6.4 Sports index `#/sports` (views/sports.js, WP-B)
Title "Sports". h1 "Sports". Sub "Pick a sport to see programs, grants and events."
- Grid: 3 columns on phones, 6 at >=1100. 72px avatars and 15/600 labels, with sibling "Also:" links (3.5).
- Section 1, h2 "Listed so far": the picture groups that have listings, in popularity order (no numbers shown).
- Section 2, h2 "Not listed yet". Sub "Know a program? Add it and we'll check it." The rest, as normal full-color tiles, each linking to its sport page, which shows the empty state. End with a button "Add a program".

### 6.5 Sport page `#/sports/:key` (views/sport.js, WP-D)
Title "Tennis: adaptive programs, grants and events". Unknown key: `notFound()`.
1. `communityHeader({kind:"sport"})`. h1 = sportName. Line = sportNote.
   - `count`: with `st`: "31 in Florida · 29 checked by a person". With `recall("place")` and no `st`: "6 near Tampa", linking to `#/near/Tampa%2C%20FL?s=tennis`. Otherwise no count.
   - Tabs: "Programs", "Grants", "Events" (`t`).
2. **Programs tab:**
   - Place chips: a horizontal row of `<a>` chips ("All states", then each state with this sport, by local count, labelled "Florida 31"), with a fade edge. After it, a native `<select>` "Choose a state" (48px) as the visible fallback.
   - Small `tileMap` with h3 "Where tennis is listed" (counts limited to this sport; desktop and tablet only, hidden under 600px).
   - Without `st`: h2 "Checked by a person", the verified rows grouped by state (h3 state names, A to Z). Then h2 "Not yet verified" with the unverified rows. Finally "Place not listed yet" for listings with no state.
   - With `st`: h2 "Tennis in Florida". If there are rows, list them; if empty: "No tennis listed in Florida yet." with actions "See tennis everywhere", "Tell us about one", then `nearestOutside`.
   - All rows (one sport, so the plate repeats only at 72px; the line-2 meta shows the place only).
   - Call `remember("recent", key)`.
3. **Grants tab:** h2 "Grants for any sport". Sub "Most grants cover any sport. Check each one's rules." Then `grantRow`s with open grants first. (grants.json has no sport field; if production grants carry `sports`, filter on it and title the tab "Grants for tennis".)
4. **Events tab:** `emptyState` "No tennis events posted yet", actions "Add an event", "Subscribe to the calendar".
5. `letterBlock({source:"sport"})`. Aside: `aboutBox()`.

### 6.6 States index `#/states` (views/states.js, WP-B)
Title "States". h1 "Browse by state". Sub "Programs are listed by the city they're in, or statewide when they serve a whole state." Then `tileMap` (counts = listings per state) and the "Choose a state" list (always open here). Then `letterBlock`.

### 6.7 State page `#/states/:st` (views/state.js, WP-D)
Title "Adaptive sports in Florida". Unknown st: `notFound()`.
1. `communityHeader({kind:"state"})`. h1 "Florida" (with `s`: "Soccer in Florida"). Line: "109 listings · 94 checked by a person" (local count, allowed). Actions: Get the letter, Share, Map (`map=1`). No tabs.
2. `sportBar` of the sports present in the state (local), active = `s`.
3. **"Around Florida"**: 8 cards, taking turns by sport (round robin over keys, verified first, then lastChecked), with no stamp because the page names the state. Phone: a horizontal rail. Desktop: a 4-column grid. Hidden when `s` is set.
4. **"Programs by city"**: placed listings as rows, grouped by cityFirst (h3 city names, A to Z), filtered by `s`.
5. **"Across Florida, no single city listed"**: statewide rows.
6. Empty with `s`: "No soccer listed in Florida yet." Actions: "See every sport in Florida", "Tell us about one". Then `nearestOutside` (state center origin, no miles).
7. Grants teaser: h2 "Grants for athletes", 2 rows, "See all grants".
8. `letterBlock({source:"state"})`. Aside: `aboutBox()`.

### 6.8 Listing `#/programs/:id` (views/program.js, WP-E)
Title "<name>, Tennis in Tampa, FL". Unknown id: H1 "We couldn't find that listing". Body "It may have been removed or merged with another listing." Actions "Find a program", "Browse sports".
1. **Hero** (3.2 and 3.3).
   - Over it: a back button top-left (44px white circle, `icon("arrow-left")`, aria-label "Back", `data-back`). Fallback order: `#/near/<placeText>` if placed, `#/states/<st>` if there's a state, else `#/`. `backOr` uses `history.back()` only when `asnm.navs > 0`. Never `javascript:`.
   - Top-right: a share button (44px, `icon("share")`, aria-label "Share this program", navigates with `share=1`).
   - Bottom-left: the "Verified" pill when verified.
   - The **place stamp** overlaps the hero's bottom edge by 24px: a white chip with radius 16, `--sh-2`, `stateOutline(st,{size:40})` with a dot, and "Tampa, FL" 17/700. For statewide: the outline filled, plus "Florida, statewide".
2. h1 name (30/40). Meta 17/500 graphite: "Tennis · Tampa, FL". Retagged multi listings still show their single sport. If `recall("place")` resolves and the relation isn't inCity: " · About 12 mi from Brandon".
3. **Trust box** (`trust(p,"page")`). Border `--line`, radius 16, padding 20. The title has its icon; then the body; then the date row in tabular numerals.
4. **Action row** (phones; desktop shows it in the booking box):
   - `btn("Visit website", p.website, "ink", {external})`.
   - With no website: a line button "Suggest a website" to `#/update/<id>?rel=other`, with the note "We don't have a website for this program yet."
5. **"About this program"**: h2. Show `served` as a paragraph titled "Who it's for". Show the `sports` text as "Sports here" chips (text chips; 32px avatars only for bold single athletes). With no description: "We don't have a description for this program yet. The program's website has the details."
6. **Facts** (`dl`): Ages, Cost, Equipment, each shown only when present. The whole block is left out when all are empty.
7. **"Where you'll play"**: "Tampa, FL. We show the city only, so check the website for the exact place." Statewide: "This program serves Florida and doesn't list a single city." No state: "This listing doesn't say where it is yet. If you know, suggest an update."
8. **Links** (48px rows with chevrons):
   - "Suggest an update" (`#/update/<id>?rel=other`)
   - "I run this program" (`#/update/<id>?rel=run`, sub "Confirm the details and we'll mark it verified.")
   - "Share" (`share=1`)
9. **"More tennis near Tampa"**: same key from the listing's own city, inCity + within 25 mi, then the rest of the state, cap 6, as rows. Each row shows "Same city" or "About 44 mi". The heading drops to "More tennis in Florida" when none are within 25 mi, and to "More tennis programs" (other states, distance shown) when the state has none. Statewide listings: "More tennis in Florida".
10. Sticky bar (phone): left `trust(p,"short")`, right "Visit website", or "Suggest a website" (line style) when there's no site.
11. **Desktop (>=1100):** a 2-column layout. Main content is max 680. The right booking box (340px, sticky top 24, border, radius 20, `--sh-2`, padding 24) holds the trust short line, the Visit website button full width, then the "Suggest an update" text link. There is no aside.
12. **Share sheet** (`share=1`): a dialog with h2 "Share this program" and the poster (3.2):
   - Sport name top-left, 22/700 white (house: ink).
   - The figure.
   - The program name 28/700, max 3 lines.
   - "Tampa, FL" 20/500.
   - Footer: "adaptivesportsnearme.com" 16/600 and the official logo in a 56px white disc, bottom-right.
   - `role="img"`, aria-label "<name>, <sport>, <place>. Adaptive Sports Near Me".
   - Buttons: "Copy link", "Share" (`navigator.share` when available). Footnote "Sized for an Instagram post. The link opens this listing."
   - Close removes `share`.

### 6.9 Grants `#/grants` (views/grants.js, WP-F)
Title "Grants for adaptive sports".
- Header band (Sand): the grant figure at 120px right, h1 "Grants", sub "Money for adaptive sports from the groups that give it. You apply on their site."
- Segmented links (48px, `aria-current`): "For athletes" (default), "For programs", "All grants".
- h2 "Open now": `grantRow`s with `open` true; real amount first, then any deadline text, then A to Z.
- h2 "Past deadlines and closed for now", sub "Check their site for the next round.", listing past or `open==0` rows.
- No image per row. `letterBlock({source:"grants"})`. Aside: `aboutBox()`.

### 6.10 Grant `#/grants/:id` (views/grant.js, WP-F)
Title "<name>: grant from <source>".
1. Hero: 16:10 phone, 16:6 desktop. Grant soft tint #F5EBC9 with the deep figure, not inverted. Back button (`backOr("#/grants")`).
2. Amount as h2-size text above the h1 when real ("Up to $5,000"). h1 `displayName`. "From <source>".
3. Facts (`dl`): Amount ("Varies" shows as "Amount varies"), Deadline (`grantInfo.deadlineText`), Who can apply ("Athletes" / "Programs"), About (desc, or "See their site for details.").
4. Note box (Mist): "Details come from <source>. We haven't recorded a check date for this grant yet, so check their site for current dates and rules." Past: add "The last deadline was June 15, 2026."
5. Sticky bar: left = amount or "Amount varies", right "Apply on their site" (or "Visit their site" when not open). Desktop: a booking box like the listing's.
6. h2 "Other grants for athletes" (same audience), 4 open rows.
7. Never email or phone.

### 6.11 Events `#/events` (views/events.js, WP-F)
Title "Adaptive sports events". h1 "Events". Sub "Clinics, tryouts, games and meetups."
- `D.events` is empty, so `emptyState`: title "No events posted yet". Body "Events are the newest part of this directory. Know of one coming up? Add it and a person will check it before it goes live." Actions "Add an event" (orange, the one orange button), "Subscribe to the calendar" (`/events.ics`), "Get the letter" (`data-jump="letter"`).
- When events exist: month groups (h2 "October 2026") of `eventCard`s. `eventCard`: a 64px date tile (event soft #FBE2D8, "Oct" 15/700 + "18" 26/700), title 18/700, "Tennis · Tampa, FL", "Sat, Oct 18 · 9:00 AM", link "Event website".
- `letterBlock({source:"events"})`. Small links: "Calendar (.ics)", "RSS feed" (`/events.xml`).

### 6.12 Forms (views/forms.js, WP-G). All `data-proto`; honeypot `company` on each.
- `#/add/program`: h1 "Add a program". Intro "Tell us about an adaptive sports program. A person will check it against an official source before it's marked verified." Fields:
  - Program name*
  - Organization
  - Sport (select of all sportNames, plus "Several sports")
  - City
  - State* (select)
  - Program website
  - Your email*, hint "Only used if we have a question. Never shown."
  - Anything else we should know (textarea)

  Button "Send for review".
- `#/add/event`: h1 "Add an event". Intro "Share a clinic, tryout, game day or meetup. A person checks every event before it goes live." Fields:
  - Event name*
  - Sport (select)
  - Date*, Start time, End date
  - City*, State*
  - Event website*
  - Who's running it
  - Your email*
  - Notes

  Button "Send for review".
- `#/update/:id`: h1 by rel: "Suggest an update" / "Confirm your listing" (rel=run) / "Tell us about your visit" (rel=attend). Shows the listing's name, sport and place as a row at the top (`programRow`). Fields:
  - "How are you connected to this program?" (radio: I run it / I've been / Other, preselected from rel)
  - "What should we change?"* (textarea)
  - Your email*

  Button "Send". The rel=run intro: "Confirm the details and a person on our team will mark this listing verified."
- After any success: the 4.15 panel plus a "Back to the listing" or "Back to the directory" button.

### 6.13 Help, About, Resources, Letter (views/help.js, WP-G)
- `#/help`: title "Help build this". h1 "Help build this". Sub "This directory is new and still growing. Here is how you can help." Four action cards (white, border, radius 16, 48px button each):
  - "Add a program": "Know a program we're missing? Tell us and we'll check it." (`#/add/program`)
  - "Add an event": "Share a clinic, tryout, game day or meetup." (`#/add/event`)
  - "Claim your program": "Run a program listed here? Find it and confirm the details." This card has an inline name finder: label "Program name", up to 6 matches as rows linking to `#/update/<id>?rel=run`.
  - "Suggest an update": "Spot something wrong? Every listing has a Suggest an update link." (button "Find a listing", opens search)

  Then `letterBlock({source:"help"})`.
- `#/about`: title "How we check listings". h1 the same. Body sections:
  - h2 "Verified": "A person on our team checked the program against an official source, like the program's own website."
  - h2 "Not yet verified": "We found the program, and no one has confirmed it yet. It's listed so you can see it, but check the website before you go."
  - h2 "Dates": "Every listing shows the last day we confirmed the program's website works."
  - h2 "Privacy": "We show the city and state only. We don't show phone numbers or email addresses. Visit the program's website to reach them."
  - h2 "We list programs; we don't run them": "Adaptive Sports Near Me is a free directory from Adapt To Life. Each program is run by its own organization."
  - h2 "Accessibility": "We aim to meet WCAG 2.2 AA. If something doesn't work for you, tell us through Suggest an update or the Add a program form."
- `#/resources`: h1 "Resources". A card "Veteran-owned business directories by state": "State lists of veteran-owned businesses, gathered in one place." with the link "Open the directories" to `/resources/veteran-owned-businesses` (the production server page; it 404s on the local preview, which is expected).
- `#/letter`: h1 "Get the letter", then `letterBlock({source:"letter"})` alone, centered.

### 6.14 `aboutBox()` (the desktop aside)
Two stacked boxes (border, radius 16, padding 20):
- "About this directory": "Free to use, no account needed. This directory is new and still growing." Link "How we check listings".
- "Help build this": buttons "Add a program", "Claim your program".

---

## 7. Accessibility rules (every WP)
- WCAG 2.2 AA. One `h1` per view, which receives focus after navigation. Landmarks come from index.html. The skip link is JS-handled.
- Overlays (search, sports sheet, drawer, map, share): `role="dialog"`, `aria-modal`, a named heading, `trapFocus`, Escape closes, focus returns to the opener, and `#shell`, `#top` and `#foot` get `inert` while open. The closed phone drawer is `hidden` + `inert`.
- Toggles are `<button aria-pressed>`. Active links use `aria-current`. Never put `aria-pressed` on an `<a>`, never put `role="list"` on a chip row of links, and never use `role="img"` without a name.
- Images: `.fig` is always `aria-hidden`. Icon-only buttons have `aria-label`. The poster is `role="img"` with an aria-label.
- Contrast: only the pairings in section 2 (all measured at 4.5:1 or better for text). Tile tiers as in 4.17. Muted text is never lighter than #5F5D59.
- Targets: 44x44 minimum, primary buttons 48px. Inline links in paragraphs get 10px block padding.
- Text floor 15px (exceptions in 2.3). Body 17px or more.
- Motion: everything respects `prefers-reduced-motion`. Smooth scrolling only without reduced motion.
- Forced colors: `.fig` uses CanvasText; pills and chips keep borders.
- Reflow at 200% zoom and 320px width: no fixed heights on text, no horizontal scroll (except the intended scrollers), and the sticky toolbar goes static on short viewports.
- Live region: announce result counts after filtering, "Link copied", "Showing all N".
- Never use `alert()`. Every error is inline, and every error message says what to do.

---

## 8. Voice rules for every string
Plain, warm, short. No em dashes or en dashes in our copy (ranges read "8 to 18"). No codes or jargon (never show `type`, the raw `sportLabel`, freshness or quality). No pity, no "inspiring", no "warrior". No claim that the list is complete ("This directory is new and still growing"). No national counts. No donate, sponsor or money ask anywhere. One primary action per screen. Buttons use the CTA families: Find, View (avoid "Click"), Visit website, Apply on their site, Add, Claim, Suggest an update, Subscribe, Share. Never "No results"; empty states say what's missing and where to go next. Nothing Florida-first: no example places in the UI, and QA uses Tampa, Chicago, 60614, Madison WI and Illinois.

---

## 9. QA every builder runs before handing back
1. Serve with `cd /home/agentos/wt/asnm-design2/public && python3 -m http.server 88<NN> --bind 127.0.0.1` in the background (WP-A 8820, B 8821, C 8822, D 8823, E 8824, F 8825, G 8826). Note the PID and kill that PID when done; never pkill.
2. `node /tmp/asnm-launch/shoot.mjs http://127.0.0.1:88NN /tmp/asnm-r3b/<wp>/ <routes…>` (paths like `/design/r3/index.html#/near/Tampa%2C%20FL`). Read the PNGs.
3. Check:
   - no console errors
   - `document.documentElement.scrollWidth === 390` at 390px
   - every visible control is 44px or more
   - no computed font-size under 15px (except the 2.3 exceptions)
   - no text covered by a fixed element
   - grep the rendered text for "—", "–" in our strings, "@", "tel:", "donate", "score"
4. Required routes:
   - WP-B: `#/`, `#/sports`, `#/states`, `#/?open=menu`, `#/?open=search`
   - WP-C: `#/near/Tampa%2C%20FL`, `#/near/Tampa%20FL`, `#/near/St%20Pete`, `#/near/60614`, `#/near/Tampa%2C%20FL?s=tennis`, `#/near/Madison%2C%20WI?s=tennis`, `#/near/Atlantis`, `#/near/Tampa%2C%20FL?map=1`
   - WP-D: `#/sports/tennis`, `#/sports/basketball?st=IL`, `#/sports/multi`, `#/sports/tennis?t=grants`, `#/states/FL`, `#/states/WI`, `#/states/IL?s=basketball`, `#/states/FL?map=1`
   - WP-E: `#/programs/e29002d5-c892-5753-a6bd-d381220d9d51`, `#/programs/26513a7f-bcf3-47ef-9a51-6c000ab9be47`, `#/programs/debd9a05-3378-54fb-93ea-2563cc29ae17`, `#/programs/e29002d5-c892-5753-a6bd-d381220d9d51?share=1`
   - WP-F: `#/grants`, `#/grants?a=program`, `#/grants/08275279-2830-5647-bc8b-ade25a63c3f8`, `#/events`
   - WP-G: `#/add/program`, `#/add/event`, `#/update/e29002d5-c892-5753-a6bd-d381220d9d51?rel=run`, `#/help`, `#/about`, `#/resources`, `#/letter`
5. Karen checks (WP-C and WP-E together):
   - "Tampa FL" gives 4 In Tampa and about 6 within 25 miles.
   - Use my location with a Tampa fix lands on "Tampa, FL" in one tap.
   - Open a listing, then Back, and the scroll position is restored.
   - Illinois + Basketball shows the empty state with Basketball still selected, then "Nearest basketball outside Illinois" starting with Wisconsin.
   - The first grants screen shows no past deadline as open.

---

## 10. What NOT to carry from the concept files
The concept files (`r3-gallery.*`, `r3-clubhouse.*`, `r3-nearyou.*`, `r3-imagelab.html`, `d.html`) stay unchanged for reference. Do not import from them. Copy code only with these parts removed:
- **Near You:**
  - the floating Map pill
  - the per-card state stamp on result, state and sport lists
  - the athlete shrunk to 54%
  - 2-line name clamps and city ellipses (`slice(0,26)+"…"`)
  - the black beta bar
  - the black letter slab
  - `alert()`
  - `javascript:history.back()`
  - the non-inert drawer
  - the "Tampa" example chip
  - `normName` turning hyphens into spaces (this breaks "Egypt Lake-Leto")
  - expired grants shown as live
  - the 40px "+ Add" button
  - tile tiers with white text on #E38A57, 9 to 12px tile text
- **Clubhouse:**
  - national counts ("521 listed", "347 listed so far", drawer counts)
  - the ghost athlete behind banners
  - the inverted near-black house hero
  - letter copy that promises sport or place mail
  - word-match "In Tampa"
  - `isPlaced` that only rejects "statewide"
  - `aria-pressed` on links
  - `role="list"` on chip rows
  - `role="img"` banners
  - a Grants tab that implies 45 tennis grants
  - the "Near Me" drawer title
  - the text-only first screen
- **Gallery:**
  - greyed or low-opacity sport bar icons
  - place-as-headline plate text
  - the home hero floor stripe
  - 10 home rails
  - dark house plates
  - query-style hash routes (`#q=`, `#s=`, `#st=`, `#p=`, `#v=`)
  - the copy "Every listing says who checked it and when"
  - "Last checked" beside "Not yet verified"
  - the UNPLACED regex that drops "Athens / Clarke County"
  - "closest" fallback lists sorted by check date
  - "More tennis near Tampa" showing listings 160 miles away
  - "Basketball near Illinois" headings
  - the 21:9 desktop hero
  - missing h1s on the sport, state and grants views
- **D era:**
  - emoji nav
  - the pulsing dot
  - the 60-mile radius
  - the state silhouette as the main art
  - the old 3D icons and photos in any grid
  - `adaptive.svg` used as listing art

---

## 11. Production follow-ups (record only; not built here)
1. Add `listedAt` (and `verifiedMonth`) to `/api/directory`, so all 236 dateless rows meet the "date on every listing" bar.
2. Rank by city coordinates on the server (replacing the 1.5 MB gazetteer download), and restore the nearby ranking in `listPrograms`.
3. Render server pages with unique meta for `/sports/:key` (all 45), `/states/:st`, `/near?place=`, `/grants`, `/events`. Add robots.txt and a sitemap.
4. Per-listing and per-sport og:image (1200x630) and Instagram export (1080x1350) built from `<key>.png` with the poster layout, plus og:image:alt.
5. Remove grant email and phone from the grant API and page. Remove `freshness` and `quality` from the public payload.
6. Add a public add-an-event endpoint (Turnstile, honeypot, rate limit) feeding admin review.
7. Retag single-sport "multi" listings in the data rather than at display time.

---

## 12. Work packages (parallel)
| WP | Owns | Depends on |
|---|---|---|
| A | index.html, logo.svg, app.css, app.js (everything in section 1.4, 1.5, 2, 3, 4, 5, notFound) | nothing; ships first, but others code against section 1.5 |
| B | views/home, sports, states | A |
| C | views/near, map | A |
| D | views/sport, state | A |
| E | views/program (+ share sheet) | A |
| F | views/grants, grant, events | A |
| G | views/forms, help | A |

Until WP-A lands, view builders may stub `../app.js` locally (named exports returning placeholder strings) but must not commit the stub. Nobody edits another WP's files.