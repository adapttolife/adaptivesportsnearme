# Sport images (Alec's flat vector set)

The one place the site gets its sport, grant and event images. Both renderers
(the Worker's server pages and the app in `public/index.html`) pick the file
through `public/listing-art.js`, so nothing else should point at images by name.

- Master files: Google Drive, Website / ASNM Flat Vector Logo (1254 px PNGs, Alec's).
- `<key>.svg` is what the site shows (traced from the PNG, about 3 to 18 KB).
- `<key>.png` is 512 px with a transparent background, for email and social cards.
- `<key>` is the sport's key in the D1 `sports` table, plus `multi`, `grant` and `event`.

## Add or replace an image

1. Save the PNG from Drive (square, black on white or transparent).
2. `scripts/sport-art.sh <key> path/to/Image.png`
3. New key only: add it to `ART` in `public/listing-art.js`.
4. `npm test` (checks every key has an SVG and a PNG and nothing is orphaned), then open a PR.

Do not add a second copy of these images anywhere else in `public/`.

## Which Drive file is which key

| Key | Drive file |
|---|---|
| `amputeesports` | Amputee Sports.png |
| `archery` | Archery.png |
| `art-therapy` | Art Therapy.png |
| `baseball` | Baseball.png |
| `basketball` | Basketball.png |
| `beepbaseball` | Beep Baseball.png |
| `boccia` | Boccia.png |
| `climbing` | Climbing.png |
| `curling` | Curling.png |
| `cycling` | Cycling.png |
| `dance` | Wheelchair Dance.png |
| `equestrian` | Horseback Riding.png |
| `event` | Events.png |
| `fencing` | Fencing.png |
| `football` | Wheelchair Football.png |
| `goalball` | Goalball.png |
| `golf` | Golfing.png |
| `grant` | Grants.png |
| `handball` | Handball.png |
| `lacrosse` | Lacrosse.png |
| `martialarts` | Martial Arts.png |
| `multi` | Multi Sport.png |
| `nordicskiing` | Nordic Skiing.png |
| `pickleball` | Pickleball.png |
| `powerlifting` | Weightlifting.png |
| `rowing` | Rowing and paddle.png |
| `rugby` | Rugby.png |
| `running` | Racing.png |
| `sailing` | Sailing.png |
| `shooting` | Shooting Sports.png |
| `skiing` | Snow Skiing.png |
| `sledhockey` | Sled Hockey.png |
| `soccer` | Soccer.png |
| `softball` | Softball.png |
| `swimming` | Swimming.png |
| `tennis` | Tennis.png |
| `trackfield` | Track and Field.png |
| `triathlon` | Triathlon.png |
| `veteran-meetup` | Veteran Meetup.png |
| `volleyball` | Sitting Volleyball.png |
| `waterskiing` | Water Skiing.png |

Borrowed on purpose: `handcycling` uses cycling (Alec, 2026-10-14: the same image),
`wheelchairracing` uses trackfield (Alec: the same image), `equestrianvaulting` (skipped) and `equine-therapy`
use equestrian, `blindsports` uses goalball. `surfing` is skipped and shows multi.
