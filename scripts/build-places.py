#!/usr/bin/env python3
"""Build public/data/places.json, the city table for typed searches and for
each listing's city center ("ST|city" -> [lat, lng]).

Source: the Census Bureau's 2023 places gazetteer
(https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_place_national.zip).
Unzip it and run:

  python3 scripts/build-places.py 2023_Gaz_place_national.txt

Names are lowercased with periods dropped, "saint" -> "st" and "fort" -> "ft",
and the place-type suffix ("city", "town", "CDP"...) removed, the same way
src/geo.js cityCenter() and public/app/app.js normCity() read a typed city.
Consolidated governments ("Nashville-Davidson", "Augusta-Richmond County",
"Louisville/Jefferson County") are also listed under their first name. When two
places in a state share a name, the larger one by land area wins.
"""
import json, pathlib, re, sys

SUFFIX = re.compile(r" (city|town|village|cdp|borough|municipality|city and borough|consolidated government|"
                    r"metropolitan government|unified government|urban county|metro government|plantation|"
                    r"comunidad|zona urbana|corporation)( \(balance\))?$")


def norm(s):
    s = re.sub(r"\s*\(balance\)\s*$", "", s).lower().replace(".", "")
    s = re.sub(r"\bsaint\b", "st", s)
    s = re.sub(r"\bfort\b", "ft", s)
    return SUFFIX.sub("", re.sub(r"\s+", " ", s).strip())


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    best = {}
    lines = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8", errors="replace").splitlines()[1:]
    for line in lines:
        c = line.split("\t")
        if len(c) < 12:
            continue
        st, name, land = c[0], norm(c[3]), float(c[6] or 0)
        lat, lng = round(float(c[10]), 3), round(float(c[11].strip()), 3)
        for n in {name, re.split(r"[-/]", name)[0].strip()}:
            key = f"{st}|{n}"
            if n and (key not in best or land > best[key][0]):
                best[key] = (land, [lat, lng])
    out = {k: v[1] for k, v in sorted(best.items())}
    root = pathlib.Path(__file__).resolve().parents[1]
    (root / "public/data/places.json").write_text(json.dumps(out, separators=(",", ":")))
    print(f"{len(out)} places")


if __name__ == "__main__":
    main()
