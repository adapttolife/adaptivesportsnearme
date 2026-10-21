#!/usr/bin/env python3
"""Build public/data/places.json, the city table for typed searches and for
each listing's city center ("ST|city" -> [lat, lng]).

Source: the Census Bureau's 2023 places gazetteer
(https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_place_national.zip).
Unzip it and run:

  python3 scripts/build-places.py 2023_Gaz_place_national.txt [2023_Gaz_cousubs_national.txt]

The optional second file is the county subdivisions gazetteer
(https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_cousubs_national.zip).
New England and much of the Northeast and Midwest live in towns and townships, which
the places file leaves out (Killington, VT; Newbury, NH; Glastonbury, CT). Towns with
a working government (FUNCSTAT A) fill in only names no place already has, so a city
never moves; statistical areas ("CCD", "unorganized territory") are never added.

Names are lowercased with periods dropped, "saint" -> "st" and "fort" -> "ft",
and the place-type suffix ("city", "town", "CDP"...) removed, the same way
src/geo.js cityCenter() and public/app/app.js normCity() read a typed city.
Consolidated governments ("Nashville-Davidson", "Augusta-Richmond County",
"Louisville/Jefferson County") are also listed under their first name, a name
with another in brackets ("San Buenaventura (Ventura)") under both, and the few
places the Census names differently from everyone else ("Boise City", "Urban
Honolulu") under their everyday name too. When two places in a state share a
name, the larger one by land area wins; an extra name never replaces a real one.
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


# The Census name -> what people call it (only where no place already has that name).
EVERYDAY = {("ID", "boise city"): "boise", ("HI", "urban honolulu"): "honolulu"}


def names_for(st, name):
    out = {name, re.split(r"[-/]", name)[0].strip()}
    m = re.match(r"^(.*?) \((.*?)\)$", name)
    if m:
        out |= {m.group(1).strip(), m.group(2).strip()}
    if (st, name) in EVERYDAY:
        out.add(EVERYDAY[(st, name)])
    return out


TOWN_SUFFIX = re.compile(r" (charter township|township|town|plantation|gore|grant|location|purchase|village|city|borough)$")


def towns(path, best):
    """Fill gaps from the county subdivisions file: real towns only, never over a place."""
    added = {}
    lines = pathlib.Path(path).read_text(encoding="utf-8", errors="replace").splitlines()[1:]
    for line in lines:
        c = line.split("\t")
        if len(c) < 11 or c[4] != "A":
            continue
        raw = c[3].lower().replace(".", "")
        if re.search(r"unorganized|not defined|\bdistrict\b|\bccd\b|reservation", raw):
            continue
        st, land = c[0], float(c[5] or 0)
        name = TOWN_SUFFIX.sub("", norm(c[3]))
        name = re.sub(r"\bsaint\b", "st", name)
        if not name:
            continue
        key = f"{st}|{name}"
        if key in best:
            continue
        lat, lng = round(float(c[9]), 3), round(float(c[10].strip()), 3)
        if key not in added or land > added[key][0]:
            added[key] = (land, [lat, lng], True)
    best.update(added)
    return len(added)


def main():
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    best = {}
    lines = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8", errors="replace").splitlines()[1:]
    for line in lines:
        c = line.split("\t")
        if len(c) < 12:
            continue
        st, name, land = c[0], norm(c[3]), float(c[6] or 0)
        lat, lng = round(float(c[10]), 3), round(float(c[11].strip()), 3)
        for n in names_for(st, name):
            key = f"{st}|{n}"
            real = n == name
            if not n:
                continue
            if key not in best or (real and not best[key][2]) or (real == best[key][2] and land > best[key][0]):
                best[key] = (land, [lat, lng], real)
    extra = towns(sys.argv[2], best) if len(sys.argv) == 3 else 0
    out = {k: v[1] for k, v in sorted(best.items())}
    root = pathlib.Path(__file__).resolve().parents[1]
    (root / "public/data/places.json").write_text(json.dumps(out, separators=(",", ":")))
    print(f"{len(out)} places ({extra} from towns)")


if __name__ == "__main__":
    main()
