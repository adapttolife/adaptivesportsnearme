# Icon scripts

- `trace.py`: Alec's sport drawings (PNGs in Drive, Website / ASNM Flat Vector
  Logo) to `public/emblems/sports/<key>.svg` and `<key>.png`. Each outline is
  rebuilt the way an illustrator draws it: perfect circles, exact straight
  lines, true arcs, and the fewest smooth curves within 0.15 units of the
  drawing. One path per icon on a 512 grid, even-odd fill, `fill="currentColor"`.
  The run stops if an outline loses its shape or an icon stops covering the same
  pixels as its PNG (IoU 0.985 or better; the current set scores 0.988 to 0.997).
- `brand.py`: every site file that shows the Adapt To Life mark (favicon, app
  icons, the generic listing stamp), built from the official logo in `brand/`
  (brand identity of 2 Sep 2026, Drive: Logos / FINAL Logo).

```sh
pip install pillow numpy scikit-image      # plus rsvg-convert, pngquant
python3 scripts/icons/trace.py ~/asnm-pngs            # all icons
python3 scripts/icons/trace.py ~/asnm-pngs soccer     # one icon
python3 scripts/icons/brand.py
```

The key to Drive file map is the table in `public/emblems/sports/README.md`.
