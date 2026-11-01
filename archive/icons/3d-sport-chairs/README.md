# Retired: 3D sport icons

**Status: retired 2026-10-29. Kept, not deleted, so they can come back. Not used anywhere on the site.**

Eleven 3D renders, one per sport: a sport wheelchair carrying that sport's equipment, on a transparent background, about 160 px. They came in on 2026-06-27 ("Rebuild around the 11 sports we have icons for") and drew the cards, category bar, map and list until Alec's flat sport drawings in `public/emblems/sports/` replaced them. They were resized on 2026-08-25 and moved into `public/assets/sport-icons/3d/` on 2026-10-14. After that, nothing referenced them.

They moved out of `public/` on 2026-10-29 (to `design/retired/3d-sport-icons/`, then here the same night, so there is one archive), so they no longer ship with every deploy. Their old URLs (`/assets/sport-icons/3d/<sport>.png`) stop resolving after the next deploy.

| File | Sport |
|---|---|
| `baseball.png` | Baseball |
| `basketball.png` | Wheelchair basketball |
| `cycling.png` | Cycling |
| `football.png` | Football |
| `goalball.png` | Goalball (dark studio background, never re-exported transparent) |
| `pickleball.png` | Pickleball |
| `rugby.png` | Wheelchair rugby |
| `skiing.png` | Skiing |
| `sledhockey.png` | Sled hockey |
| `tennis.png` | Wheelchair tennis |
| `waterskiing.png` | Water skiing (dark studio background, never re-exported transparent) |

## Bringing them back

Copy the files back under `public/` and point `public/listing-art.js` at them. The map of every icon and logo is [docs/ICONS-AND-LOGOS.md](../../../docs/ICONS-AND-LOGOS.md). That file is the one place the site picks a sport image.
