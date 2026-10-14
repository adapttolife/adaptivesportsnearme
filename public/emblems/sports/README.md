# Sport icons

The one place the site gets its sport, grant and event images. Both renderers
(the Worker's server pages and the app in `public/index.html`) pick the file
through `public/listing-art.js`, so nothing else should point at images by name.

- `<key>.svg` is what the site shows: an animated icon from the ASNM icon set,
  the Adapt To Life logo athlete posed for each sport and drawn in code
  (`scripts/icons`, nothing traced). Embedded as an `<img>`, it plays its motion
  twice on load and then rests; reduced-motion visitors see the still pose.
- `<key>.png` is that still pose at 512 px with a transparent background, for
  email and social cards.
- `<key>` is the sport's key in the D1 `sports` table, plus `multi`, `grant` and `event`.
- Google Drive, Website / ASNM Flat Vector Logo: Alec's original drawings
  (`<Name>.png`, `<Name> Transparent.png`) and a copy of each icon (`<Name>.svg`).

## Change or add an icon

These files are generated; do not edit them by hand.

1. Edit or add `scripts/icons/set/<key>.py` (the rules are in `scripts/icons/README.md`).
2. `/tmp/pv/bin/python scripts/icons/build.py <key>` writes the SVG and PNG here.
3. New key only: add it to `SPORTS` in `public/listing-art.js` and `KEYS` in `scripts/icons/build.py`.
4. `npm test` (every key has an SVG and a PNG, nothing orphaned, and every SVG
   keeps the icon contract in `test/sport-icons.test.js`), then open a PR.

Do not add a second copy of these images anywhere else in `public/`.

## Which Drive file is which key

Every sport key has its own icon (Alec, 2026-10-14: "extreme clarity"). The
Drive column names Alec's drawing for that sport, which set what the icon
shows; the icon's copy in Drive has the same name ending in `.svg`.

| Key | Drive file | Note |
|---|---|---|
| `amputeesports` | Amputee Sports.png |  |
| `archery` | Archery.png |  |
| `art-therapy` | Art Therapy.png |  |
| `baseball` | Baseball.png |  |
| `basketball` | Basketball.png |  |
| `beepbaseball` | Beep Baseball.png |  |
| `blindsports` | Blind Sports.png | new drawing: athlete and guide joined by a tether |
| `boccia` | Boccia.png |  |
| `climbing` | Climbing.png |  |
| `curling` | Curling.png |  |
| `cycling` | Cycling.png | new drawing: upright bike (Alec's cycling drawing is the handcycle) |
| `dance` | Wheelchair Dance.png |  |
| `equestrian` | Horseback Riding.png |  |
| `equestrianvaulting` | Equestrian Vaulting.png | new drawing: vaulter on a cantering horse |
| `equine-therapy` | Equine Therapy.png | new drawing: athlete stroking a horse |
| `event` | Events.png |  |
| `fencing` | Fencing.png |  |
| `football` | Wheelchair Football.png |  |
| `goalball` | Goalball.png |  |
| `golf` | Golfing.png |  |
| `grant` | Grants.png |  |
| `handball` | Handball.png |  |
| `handcycling` | Handcycling.png | from Alec's Cycling.png, which shows a handcycle |
| `lacrosse` | Lacrosse.png |  |
| `martialarts` | Martial Arts.png |  |
| `multi` | Multi Sport.png | one athlete juggling three balls |
| `nordicskiing` | Nordic Skiing.png |  |
| `pickleball` | Pickleball.png |  |
| `powerlifting` | Weightlifting.png |  |
| `rowing` | Rowing and paddle.png |  |
| `rugby` | Rugby.png |  |
| `running` | Racing.png |  |
| `sailing` | Sailing.png |  |
| `shooting` | Shooting Sports.png |  |
| `skiing` | Snow Skiing.png |  |
| `sledhockey` | Sled Hockey.png |  |
| `soccer` | Soccer.png |  |
| `softball` | Softball.png | a pitcher, so it differs from baseball's batter |
| `surfing` | Surfing.png | new drawing (no surfing image yet) |
| `swimming` | Swimming.png |  |
| `tennis` | Tennis.png |  |
| `trackfield` | Track and Field.png | new drawing: seated javelin throw |
| `triathlon` | Triathlon.png |  |
| `veteran-meetup` | Veteran Meetup.png |  |
| `volleyball` | Sitting Volleyball.png |  |
| `waterskiing` | Water Skiing.png |  |
| `wheelchairracing` | Wheelchair Racing.png | from Alec's Track and Field.png, which shows a racing chair |
