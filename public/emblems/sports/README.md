# Sport icons

The one place the site gets its sport, grant and event images. Both renderers
(the Worker's pages and the app) pick a file through `public/listing-art.js`, so
nothing else points at images by name.

- **Source of truth:** Google Drive, Website / ASNM Flat Vector Logo / **SVGs**: Alec's
  drawings as vectors, one file per sport, 512 x 512, one colour (`currentColor`), each
  drawing centered with its long side at 88% of the square.
- `<key>.svg` is copied from Drive unchanged (`SOURCES.tsv` holds each file's sha256).
- `<key>.png` is rendered from the SVG: 512 px, transparent, for email and social cards.
- `<key>` is the sport's key in the D1 `sports` table, plus `multi`, `grant` and `event`.
- Every sport has its own file, even when two sports use the same drawing (Alec,
  2026-10-14). Those files are copies titled for their sport; the table says which.

## Update

1. Change the drawing in Drive (keep one file per sport, titled for the sport).
2. Download the SVGs folder, then run `python3 scripts/sport-icons-sync.py <folder>`.
   It refuses a set with a missing file, a second colour, a script or outside reference,
   or a shared drawing that drifted apart.
3. Run the tests, then open a PR.

## Which Drive file is which key

| Key | Drive file (SVGs folder) | Note |
|---|---|---|
| `amputeesports` | Amputee Sports.svg |  |
| `archery` | Archery.svg |  |
| `art-therapy` | Art Therapy.svg |  |
| `baseball` | Baseball.svg |  |
| `basketball` | Basketball.svg |  |
| `beepbaseball` | Beep Baseball.svg |  |
| `blindsports` | Blind Sports.svg | same drawing as `goalball` |
| `boccia` | Boccia.svg |  |
| `climbing` | Climbing.svg |  |
| `curling` | Curling.svg |  |
| `cycling` | Cycling.svg |  |
| `dance` | Wheelchair Dance.svg |  |
| `equestrian` | Horseback Riding.svg |  |
| `equestrianvaulting` | Equestrian Vaulting.svg | same drawing as `equestrian` |
| `equine-therapy` | Equine Therapy.svg | same drawing as `equestrian` |
| `event` | Events.svg |  |
| `fencing` | Fencing.svg |  |
| `football` | Wheelchair Football.svg |  |
| `goalball` | Goalball.svg |  |
| `golf` | Golfing.svg |  |
| `grant` | Grants.svg |  |
| `handball` | Handball.svg |  |
| `handcycling` | Handcycling.svg | same drawing as `cycling` |
| `lacrosse` | Lacrosse.svg |  |
| `martialarts` | Martial Arts.svg |  |
| `multi` | Multi Sport.svg |  |
| `nordicskiing` | Nordic Skiing.svg |  |
| `pickleball` | Pickleball.svg |  |
| `powerlifting` | Weightlifting.svg |  |
| `rowing` | Rowing and paddle.svg |  |
| `rugby` | Rugby.svg |  |
| `running` | Racing.svg |  |
| `sailing` | Sailing.svg |  |
| `shooting` | Shooting Sports.svg |  |
| `skiing` | Snow Skiing.svg |  |
| `sledhockey` | Sled Hockey.svg |  |
| `soccer` | Soccer.svg |  |
| `softball` | Softball.svg |  |
| `surfing` | Surfing.svg | same drawing as `multi` |
| `swimming` | Swimming.svg |  |
| `tennis` | Tennis.svg |  |
| `trackfield` | Track and Field.svg |  |
| `triathlon` | Triathlon.svg |  |
| `veteran-meetup` | Veteran Meetup.svg |  |
| `volleyball` | Sitting Volleyball.svg |  |
| `waterskiing` | Water Skiing.svg |  |
| `wheelchairracing` | Wheelchair Racing.svg | same drawing as `trackfield` |
