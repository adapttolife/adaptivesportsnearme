# Sport icons: placement and sizing (direction C, Oct 14, 2026)

Alec: "The icons all get cutoff in some way, especially on mobile - let's take the time to get this right."

## The rule
Each of Alec's 47 drawings sits centered in a square file. `fig()` passes the drawing's
share of its square (`--w`, `--h`, their geometric mean `--g`, diagonal `--diag`, ink density
`--dk`, centroid offset `--cx`). CSS sizes the square (`--B`) so the DRAWING, not the square,
meets every limit of the spot it is in:

| Limit | Meaning |
|---|---|
| `--A` | optical size: every drawing has the same visual weight in a spot |
| `--Hm`, `--Wm` | the drawing's height and width as a share of the spot |
| `--Hx`, `--Wx` | the drawing's height and width as lengths (room left beside a button or stamp) |
| `--Cm` | the drawing's box fits a circle (round avatars) |

Placement uses the drawing's own edges (`.fig--pin`), and the centroid nudge can never push ink
past an edge. Spots: home hero (a band above the headline on phones, beside it on desktop),
home doors and bands, sport tiles, cards (centered under the badge band), rows, avatars, the
listing hero (the athlete stands above the place stamp and below the back and share buttons),
sport banners, the share poster, three-athlete groups, and the veteran pages.

## The checks
Serve `public/` and run against it:

- `icon-audit.mjs <base>`: every icon in 16 spots at 10 widths (320 to 1440). Measures pixels cut
  off by any clipping box or the screen, pixels outside a circle, and any overlap with a headline,
  button, place stamp or Verified pill. On the build before this change it failed in 12 places
  (the screenshots Alec sent); now: 0.
- `icon-audit-trios.mjs <base>`: ten three-athlete groups in cards, listing heroes and posters.
- `icon-ratio.mjs <base> <width>`: how close each icon gets to its spot's visual size target.
- `check-search-fold.mjs <base>`: the home search box stays in the first screen on phones.

Needs `window.ASNM_FIG`, `ASNM_PLATE` and `ASNM_ICON_KEYS` (exposed by `public/design/c2/app.js`).
The page `#/lab` shows every icon in every spot for eyes.
