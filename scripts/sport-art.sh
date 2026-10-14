#!/usr/bin/env bash
# Add or replace a sport image from Alec's flat vector set.
#   scripts/sport-art.sh <key> <image.png> [<key> <image.png> ...]
# <key> is the sport's key from the sports table (see public/emblems/sports/README.md).
# Writes public/emblems/sports/<key>.svg (what the site shows) and <key>.png
# (512 px, transparent, for email and social cards). Needs ImageMagick, potrace,
# librsvg (rsvg-convert) and pngquant: `brew install imagemagick potrace librsvg pngquant`.
# A new key must also be added to ART in public/listing-art.js; npm test checks both.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/emblems/sports
while [ $# -ge 2 ]; do
  key="$1"; img="$2"; shift 2
  [[ "$key" =~ ^[a-z][a-z0-9-]*$ ]] || { echo "bad key: $key" >&2; exit 2; }
  tmp=$(mktemp -d)
  # Flatten onto white, threshold to pure black and white, trim, trace.
  convert "$img" -background white -alpha remove -alpha off -colorspace gray -threshold 55% -trim +repage "$tmp/in.pbm"
  potrace "$tmp/in.pbm" -s -t 6 -a 1.0 -O 0.4 -o "$tmp/raw.svg"
  # Square viewBox with 6% margin around the drawing, in the site's ink.
  python3 - "$tmp/raw.svg" "$OUT/$key.svg" <<'PY'
import re, sys
s = open(sys.argv[1]).read()
w, h = [float(x) for x in re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', s).groups()]
side = max(w, h) * 1.12
ox, oy = (side - w) / 2, (side - h) / 2
body = s[s.index("<g"):s.rindex("</svg>")].replace('fill="#000000"', 'fill="#1A1A1A"')
body = re.sub(r"\s+", " ", body)
open(sys.argv[2], "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side:.0f} {side:.0f}"><g transform="translate({ox:.1f} {oy:.1f})">{body}</g></svg>\n')
PY
  rsvg-convert -w 512 -h 512 "$OUT/$key.svg" -o "$tmp/p.png"
  pngquant --force --quality 70-95 --output "$OUT/$key.png" "$tmp/p.png"
  echo "$key -> $OUT/$key.svg ($(wc -c < "$OUT/$key.svg") bytes), $OUT/$key.png"
  rm -rf "$tmp"
done
