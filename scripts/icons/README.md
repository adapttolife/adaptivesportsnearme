# Icon scripts

- `../sport-icons-sync.py`: the one way sport icons come into the repo. It copies Alec's
  SVGs from Google Drive (Website / ASNM Flat Vector Logo / SVGs) unchanged into
  `public/emblems/sports`, renders the PNGs and records each file's sha256 in
  `SOURCES.tsv`. `test/sport-icons.test.js` fails if a file here stops matching Drive.
- `trace.py`: how those SVGs were made. It rebuilds Alec's drawings (the PNGs in the same
  Drive folder) as clean vectors: perfect circles, exact straight lines, true arcs and the
  fewest smooth curves within 0.15 units of the drawing; one path per icon on a 512 grid,
  even-odd fill, `fill="currentColor"`. It stops if an outline loses its shape or an icon
  stops covering the same pixels as its PNG (IoU 0.985 or better). When a drawing changes:
  trace the new PNG, put the SVG in Drive's SVGs folder (same name), then run the sync.
- `brand.py`: every site file that shows the Adapt To Life mark (favicon, app icons, the
  generic listing stamp), built from the official logo in `brand/` (brand identity of
  2 Sep 2026, Drive: Logos / FINAL Logo). The old Jul 31 drawing is retired.

```sh
pip install pillow numpy scikit-image      # plus rsvg-convert, pngquant
python3 scripts/icons/trace.py ~/asnm-pngs soccer      # one icon (writes public/emblems/sports)
python3 scripts/sport-icons-sync.py ~/asnm-svgs        # Drive SVGs into the repo
python3 scripts/icons/brand.py                         # favicon, app icons, listing stamp
```

The key to Drive file map is the table in `public/emblems/sports/README.md`.
