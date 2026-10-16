# Sport figures in motion

Every sport figure on the site plays a short move of its sport: a shot, a stroke, a
swing, then rest. The moves are made of Alec's drawings themselves. Nothing is
redrawn: each moving part is one of the shapes of the sport's SVG in
`public/emblems/sports`, so at rest a figure is the drawing exactly.

```sh
python3 scripts/motion/build.py      # specs -> public/emblems/motion/*.json + public/app/motion-index.js
npm test                             # test/sport-motion.test.js holds the result to the drawings
```

No dependencies beyond Python 3.

## How it plays

- `public/app/app.js` loads the player (`public/app/motion.js`) after the first page
  draws, and never for anyone who asks for reduced motion.
- The player upgrades a figure (the `.fig` mask from `fig()`) in place to the same
  drawing as inline SVG, in the mask's exact square, then plays it with the Web
  Animations API. Its data (`/emblems/motion/<drawing>.json`, about 5 KB compressed)
  loads only when that figure plays.
- Big figures (the home banner, sport tiles, page banners, heroes) play once when they
  come into view and again on hover. Figures in lists (cards, rows, avatars) play
  only on hover. The home banner's athlete plays each time it changes.
- Nothing moves and nothing loads for reduced motion, data saver, or forced colours.

## Changing a move

Each spec in `specs/` (one per drawing; `pilots.py` and batches `b1`..`b7`) names
which of the drawing's shapes move together (`tree`), where each group turns
(`origins`, in the drawing's 512 units) and its keyframes (`keys`: percent, transform,
easing). Edit the spec, run the build, check it in a browser, and run the tests. The
build stops if a drawing's shape is missing or used twice, or if a group that turns
has no pivot.

Techniques the specs use, for parts the drawing joins together:

- **bend**: a limb drawn into the body turns at the shoulder by weight, so it curves
  instead of breaking (swimming's arm, climbing's reach). Keys may also shift the
  limb, so a hand can stay on a hold while the body leans.
- **joint**: a rigid part held in a round fist turns about the fist (baseball's bat).
- **cut** and **clip**: one shape split along a circle or along its own lines
  (handball's ball out of the hand; archery's arrow, string and bow).
- `lib/swing3d.py`: a bat swung around the batter's spine, seen from the side
  (softball, beep baseball); a bowstring that stretches without thinning.
- `lib/meval.py`: keyframes evaluated like the browser does, so a ball can ride a
  pocket or a hand until it is thrown.

## When a drawing changes

`test/sport-motion.test.js` fails when a sport's SVG no longer matches the drawing
its move was built from. Rebuild; if the new drawing's shapes changed, update its
spec's shape ids first (`lib/mv.py` `load()` lists them).

Reference videos of every move: Google Drive, Website / ASNM Flat Vector Logo /
Animations (one per sport, named like its SVG).
