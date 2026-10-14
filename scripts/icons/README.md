# ASNM sport icons

One drawing system for every sport, grant and event icon on Adaptive Sports Near
Me. Each icon is the Adapt To Life logo athlete (head, swoosh back, torso, brush
wheel, S-curve leg) posed for its sport with one prop, drawn as clean Bezier
shapes and animated with CSS. Nothing is traced: the seated athlete is the
logo's own curves (brand identity of 2 Sep 2026, Drive: Logos / FINAL Logo /
090226_AdaptToLife_Icon.svg), and every other shape is built in code from the
parts in `figure.py`, so the whole set stays one family.

## Files

- `kit.py`: the engine. Brush strokes (a smooth centre line with a width at each
  point, ending round or in a point), circles, polygons, boolean ops, the
  automatic white gap, motion (CSS keyframes), and `render()`.
- `figure.py`: the athlete. `seated()` adds the whole wheelchair athlete in the
  logo's exact curves (`body()`, `leg()`, `wheel()`, `head()`); `torso()`,
  `back()`, `arm()` are brush strokes fitted to the logo for custom poses; `leg_points()`, `thigh()`, `shin()`, `blade()` for standing
  and running figures; `wave()`, `below()`, `swoosh()` for water and motion lines.
- `set/<key>.py`: one icon per sport key (`build()` returns an `Icon`). Shared
  parts by family: `set/_balls.py` (seamed balls, arms that stay merged with the
  body, flight arcs), `set/_props.py` (arm angles, sampled keyframes),
  `set/_water.py` (boats, sleds, skis), `set/_wheels.py` (spoked wheels, cranks,
  frames), `set/_standing.py` (standing, lying and climbing figures),
  `set/_horse.py` (the horse and its canter).
- `brand.py`: every site file that shows the Adapt To Life mark (favicon, app
  icons, the generic listing stamp), built from the official file in `brand/`.
- `dev.py`: build icons, write SVGs and a contact sheet; `--frames` previews motion.
- `frames.cjs`: browser truth: freezes the real CSS animation at 8 times and
  screenshots (Chromium and WebKit).
- `build.py`: writes `public/emblems/sports/<key>.svg` and `<key>.png`.

## The look (rules every icon follows)

1. **One athlete, one scale.** Use the figure parts at scale 1 (head r 6.1,
   wheel r 20.4, limbs 4 to 9 wide). Scenes with several people (meetup,
   triathlon) may shrink figures, never below 0.6. Props are drawn at the same
   stroke weights.
2. **Solid ink, brush shapes.** Bold filled shapes; flowing things (water, snow,
   ribbons, motion lines, the back) are brush strokes that taper to points; limbs
   end round; hands are round fists. Thin lines only for strings, nets, ropes,
   spokes (0.75 to 1.2 wide).
3. **The white gap.** Where shapes overlap, the one in front cuts a 2.4-unit gap
   (the logo's own gaps measure 1.9 to 2.6)
   into the one behind (automatic, in z order: add back to front). Parts that
   are one mass share a `merge` tag (an arm and the torso: `merge="body"`).
4. **Simple props.** A prop reads at 48 px: one silhouette, at most two or three
   details (ball seams, racket strings, a sail seam).
5. **120 x 120 grid.** `ic.finish()` centres the drawing; it must fit with a
   6-unit margin. Keep the figure the hero; props may reach the margin.
6. **No text, no gradients, one ink.** Class `i` is the ink (#1A1A1A, the
   site's ink). Class `a` (accent) marks the athlete's leg, the part the logo
   draws in coral (#FF5C39); it renders in the ink unless a page sets
   `--asnm-accent`, so the set can go two-tone without a redraw.

## Motion (rules)

- One loop says the sport: a swing, a throw, a stroke, a stride. 1.6 to 3.2 s.
- Frame 0 and frame 100 are the rest pose, and the rest pose is the clearest
  drawing (it is what static renders and reduced-motion users see).
- Move with `rotate()` about joints (shoulder, elbow, hip, knee, wheel hub) and
  `translate()`; fade with `opacity` (objects leave the frame by fading, never by
  crossing the edge). Anticipation, action, follow-through. Body rotations small
  (under about 40 degrees); implements can swing further.
- Moving parts keep the white gap: render() masks the ink behind a moving group
  with an animated copy of it. Parent/child groups (thigh then shin) nest with
  `Motion(parent=...)`; motions in one chain share duration and delay.
- Every icon plays `--asnm-loops` times (default 2, so motion stops within about
  5 s: WCAG 2.2.2), honours `prefers-reduced-motion`, and pauses with
  `--asnm-play: paused`. Inline SVG can set `--asnm-loops: infinite` for a hero
  (give the page a pause control).

## Using the icons on a page

- Prefer `<img src="/emblems/sports/<key>.svg" alt="">` next to a visible label.
  Each `<img>` is its own document, so ids never collide and motion just runs.
- Inline SVG works too (and takes `--asnm-ink`, `--asnm-accent`,
  `--asnm-loops`, `--asnm-play` from the page) but each inlined copy needs unique
  ids: masks are referenced by id, and a second copy with the same ids would
  borrow the first copy's moving gaps.

## Working on an icon

```sh
python3 -m venv /tmp/pv && /tmp/pv/bin/pip install skia-pathops fonttools pillow
/tmp/pv/bin/python dev.py tennis                 # SVG + contact sheet in $ASNM_DEV_OUT (/tmp/asnm-icons/dev)
/tmp/pv/bin/python dev.py --grid tennis          # with a 10-unit grid to place parts
/tmp/pv/bin/python dev.py --frames tennis        # quick motion preview (Python)
PLAYWRIGHT_CORE=/path/to/playwright node frames.cjs chromium out.png 8 /tmp/asnm-icons/dev/tennis.svg
/tmp/pv/bin/python build.py                      # write public/emblems/sports
```
