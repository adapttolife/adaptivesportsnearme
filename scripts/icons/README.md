# Icon scripts

- `trace.py`: Alec's sport drawings (PNGs in Drive, Website / ASNM Flat Vector
  Logo) to `public/emblems/sports/<key>.svg` and `<key>.png`. One clean path per
  icon on a 512 grid, `fill="currentColor"`. Each trace is checked against its
  PNG and the run stops if it does not cover the same pixels (IoU 0.985 or
  better; the current set scores 0.992 to 0.998).
- `brand.py`: every site file that shows the Adapt To Life mark (favicon, app
  icons, the generic listing stamp), built from the official logo in `brand/`
  (brand identity of 2 Sep 2026, Drive: Logos / FINAL Logo).

```sh
pip install pillow fonttools numpy        # plus potrace, rsvg-convert, pngquant
python3 scripts/icons/trace.py ~/asnm-pngs            # all icons
python3 scripts/icons/trace.py ~/asnm-pngs soccer     # one icon
python3 scripts/icons/brand.py
```

The key to Drive file map is the table in `public/emblems/sports/README.md`.
