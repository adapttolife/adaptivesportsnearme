# Alec Version 2 — AdaptiveSportsNearMe.com

The canonical site for **adaptivesportsnearme.com**. New design, shipped static first,
wired to the real directory data next.

## What's here

- `public/index.html` — the site. A self-contained design (tokens, hero search, filters,
  sport-colored program cards, detail view, email capture). Currently renders **sample data**
  via inline JS; the next step swaps that for the real 2,095-org dataset.
- `wrangler.jsonc` — Cloudflare assets-only Worker config (no server script).

## Deploy

Static, no build step. From the box:

```
cd /srv/alec-version-2
cfrun wrangler deploy        # → https://asnm.alec-af3.workers.dev
```

Preview lives on `workers.dev`; the apex `adaptivesportsnearme.com` is attached once the
design is signed off (see AgentOS spec 22).

## Where the data comes from (next phase)

The directory data is produced by the pipeline in the `asnm` repo
(`export-snapshot.sh` → `programs.json`). Wiring it into this design replaces the inline
sample data. Until then, listings shown here are illustrative.
