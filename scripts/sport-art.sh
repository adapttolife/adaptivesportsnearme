#!/usr/bin/env bash
# Turn Alec's sport symbols (black on white or transparent PNG/JPG) into the
# site's sport art: one square, padded, single-colour SVG per sport.
#   scripts/sport-art.sh <key> <image> [<key> <image> ...]
# Output: public/emblems/sports/<key>.svg, a preview at /tmp/sport-art-<key>.png,
# and public/emblems/sports/index.json (the keys that have art; the site reads it).
# Needs ImageMagick and potrace. The key is the sport's key from the sports
# table (tennis, sledhockey, multi, ...), so the site finds it by name.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/emblems/sports; mkdir -p "$OUT"
while [ $# -ge 2 ]; do
  key="$1"; img="$2"; shift 2
  [[ "$key" =~ ^[a-z][a-z0-9-]*$ ]] || { echo "bad key: $key" >&2; exit 2; }
  tmp=$(mktemp -d)
  # Flatten onto white (transparent PNGs too), threshold to pure black and white, trim.
  convert "$img" -background white -alpha remove -alpha off -colorspace gray -threshold 55% -trim +repage "$tmp/in.pbm"
  potrace "$tmp/in.pbm" -s -t 6 -a 1.0 -O 0.4 -o "$tmp/raw.svg"
  # Square viewBox with 6% margin around the drawing, fill in the site's ink.
  python3 - "$tmp/raw.svg" "$OUT/$key.svg" <<'PY'
import re, sys
s = open(sys.argv[1]).read()
w, h = [float(x) for x in re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', s).groups()]
side = max(w, h) * 1.12
ox, oy = (side - w) / 2, (side - h) / 2
body = s[s.index("<g"):s.rindex("</svg>")].replace('fill="#000000"', 'fill="#1A1A1A"')
open(sys.argv[2], "w").write(
  f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side:.0f} {side:.0f}" aria-hidden="true">'
  f'<g transform="translate({ox:.1f} {oy:.1f})">{body}</g></svg>\n')
PY
  rsvg-convert -w 300 -h 300 -b white "$OUT/$key.svg" -o "/tmp/sport-art-$key.png"
  echo "$key -> $OUT/$key.svg ($(wc -c < "$OUT/$key.svg") bytes)"
  rm -rf "$tmp"
done
# The list of sports that have art, so pages know which file to ask for.
python3 -c 'import json, pathlib, sys; d = pathlib.Path(sys.argv[1]); json.dump(sorted(p.stem for p in d.glob("*.svg")), open(d / "index.json", "w")); print(open(d / "index.json").read())' "$OUT"
