#!/usr/bin/env python3
"""Build public/assets/data/zcta.json from the US Census ZCTA gazetteer.

Spec 72 T05 — the zip->centroid geocode lane needs a vendored lookup table
(no external API calls from the Worker, ever). This script downloads the
Census Gazetteer ZCTA national file, parses the tab-delimited gazetteer
format, and emits a compact JSON map:

    {"00601": [18.1804, -66.7522], ...}

Stdlib only. Run manually / on refresh; the Worker never fetches this itself.
"""

import io
import json
import sys
import urllib.error
import urllib.request
import zipfile
from pathlib import Path

# Try newest first; Census publishes one Gazetteer zip per year and the exact
# name/path can shift, so probe a few known-good variants and use the first
# that resolves. Print which one we used — format drift must be visible.
CANDIDATE_URLS = [
    "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_Gaz_zcta_national.zip",
    "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_zcta_national.zip",
    "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2022_Gazetteer/2022_Gaz_zcta_national.zip",
]

OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "assets" / "data" / "zcta.json"

REQUIRED_COLUMNS = ["GEOID", "INTPTLAT", "INTPTLONG"]


def fetch_zip_bytes():
    last_err = None
    for url in CANDIDATE_URLS:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "ASNM-Bot/1.0 build-zcta.py"})
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            print(f"Downloaded: {url} ({len(data)} bytes)")
            return url, data
        except urllib.error.HTTPError as e:
            print(f"probe failed ({e.code}): {url}")
            last_err = e
        except urllib.error.URLError as e:
            print(f"probe failed ({e.reason}): {url}")
            last_err = e
    print(f"FATAL: all Census gazetteer probes failed. Last error: {last_err}", file=sys.stderr)
    sys.exit(2)


def parse_gazetteer(zip_bytes):
    zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
    names = [n for n in zf.namelist() if n.lower().endswith(".txt")]
    if not names:
        print(f"FATAL: no .txt file found inside gazetteer zip. Contents: {zf.namelist()}", file=sys.stderr)
        sys.exit(2)
    member = names[0]
    raw = zf.read(member)
    # Gazetteer files are historically latin-1/ascii; decode tolerantly.
    text = raw.decode("latin-1")
    lines = text.splitlines()
    if not lines:
        print("FATAL: gazetteer file is empty.", file=sys.stderr)
        sys.exit(2)

    header = [h.strip() for h in lines[0].split("\t")]
    missing = [c for c in REQUIRED_COLUMNS if c not in header]
    if missing:
        print(
            f"FATAL: gazetteer header is missing required column(s) {missing} — format drift. "
            f"Header was: {header}",
            file=sys.stderr,
        )
        sys.exit(2)

    idx = {c: header.index(c) for c in REQUIRED_COLUMNS}
    table = {}
    for line in lines[1:]:
        if not line.strip():
            continue
        fields = line.split("\t")
        if len(fields) <= max(idx.values()):
            continue
        geoid = fields[idx["GEOID"]].strip()
        lat_raw = fields[idx["INTPTLAT"]].strip()
        lng_raw = fields[idx["INTPTLONG"]].strip()
        if not geoid or not lat_raw or not lng_raw:
            continue
        try:
            lat = round(float(lat_raw), 4)
            lng = round(float(lng_raw), 4)
        except ValueError:
            continue
        table[geoid] = [lat, lng]
    return table


def main():
    url, zip_bytes = fetch_zip_bytes()
    table = parse_gazetteer(zip_bytes)
    if not table:
        print("FATAL: parsed zero ZCTA rows — refusing to write an empty table.", file=sys.stderr)
        sys.exit(2)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(table, separators=(",", ":"), sort_keys=True)
    OUTPUT_PATH.write_text(payload)

    size = OUTPUT_PATH.stat().st_size
    print(f"Source: {url}")
    print(f"ZCTA count: {len(table)}")
    print(f"Output: {OUTPUT_PATH} ({size} bytes, {size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
