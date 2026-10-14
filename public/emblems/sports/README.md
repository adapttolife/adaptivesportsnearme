# Sport icons

The one place the site gets its sport, grant and event images. Both renderers
(the Worker's server pages and the app in `public/index.html`) pick the file
through `public/listing-art.js`, so nothing else should point at images by name.

- Master files: Google Drive, Website / ASNM Flat Vector Logo (Alec's drawings,
  1254 px PNGs). Each one also has a `<Name> Transparent.png` and a `<Name>.svg`
  copy of the icon here.
- `<key>.svg` is what the site shows: Alec's drawing as a clean vector (one
  path on a 512 grid, the drawing centred with a 6% margin, filled with
  `currentColor`), traced by `scripts/icons/trace.py`.
- `<key>.png` is the same icon at 512 px with a transparent background, for
  email and social cards.
- `<key>` is the sport's key in the D1 `sports` table, plus `multi`, `grant` and `event`.

## Add or replace an icon

These files are generated; do not edit them by hand.

1. Put the new PNG in the Drive folder and download the folder's PNGs to a directory.
2. New key only: add a row to the table below and the key to `SPORTS` in
   `public/listing-art.js` and `TITLES` in `scripts/icons/trace.py`.
3. `python3 scripts/icons/trace.py <png directory> <key>` writes the SVG and PNG
   here, and stops if the trace does not match the drawing.
4. `npm test` (every key has an SVG and a PNG, nothing orphaned, every SVG keeps
   the contract in `test/sport-icons.test.js`), then open a PR.

Do not add a second copy of these images anywhere else in `public/`.

## Which Drive file is which key

Every sport key has its own file, here and in Drive, even when two sports share
a picture (Alec, 2026-10-14). To give a sport its own drawing later, replace its
file; nothing else changes.

| Key | Drive file | Note |
|---|---|---|
| `amputeesports` | Amputee Sports.png |  |
| `archery` | Archery.png |  |
| `art-therapy` | Art Therapy.png |  |
| `baseball` | Baseball.png |  |
| `basketball` | Basketball.png |  |
| `beepbaseball` | Beep Baseball.png |  |
| `blindsports` | Blind Sports.png | same picture as goalball |
| `boccia` | Boccia.png |  |
| `climbing` | Climbing.png |  |
| `curling` | Curling.png |  |
| `cycling` | Cycling.png |  |
| `dance` | Wheelchair Dance.png |  |
| `equestrian` | Horseback Riding.png |  |
| `equestrianvaulting` | Equestrian Vaulting.png | same picture as horseback riding |
| `equine-therapy` | Equine Therapy.png | same picture as horseback riding |
| `event` | Events.png |  |
| `fencing` | Fencing.png |  |
| `football` | Wheelchair Football.png |  |
| `goalball` | Goalball.png |  |
| `golf` | Golfing.png |  |
| `grant` | Grants.png |  |
| `handball` | Handball.png |  |
| `handcycling` | Handcycling.png | same picture as cycling |
| `lacrosse` | Lacrosse.png |  |
| `martialarts` | Martial Arts.png |  |
| `multi` | Multi Sport.png |  |
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
| `softball` | Softball.png |  |
| `surfing` | Surfing.png | same picture as multi-sport (no surfing image yet) |
| `swimming` | Swimming.png |  |
| `tennis` | Tennis.png |  |
| `trackfield` | Track and Field.png |  |
| `triathlon` | Triathlon.png |  |
| `veteran-meetup` | Veteran Meetup.png |  |
| `volleyball` | Sitting Volleyball.png |  |
| `waterskiing` | Water Skiing.png |  |
| `wheelchairracing` | Wheelchair Racing.png | same picture as track and field |
