#!/usr/bin/env bash
# Pre-class preflight — run ~1 hour before presenting the RCOS pitch.
# Checks every surface the presentation depends on and says PASS/FAIL loudly.
# No credentials needed; reads only public HTTP, like the audience will.
set -u
fail=0
check() { # label url must_contain
  if [ -z "${3:-}" ]; then
    curl -sf --max-time 20 -o /dev/null "$2" \
      && echo "ok    $1" || { echo "FAIL  $1 — $2 unreachable"; fail=1; }
    return
  fi
  body=$(curl -sf --max-time 20 "$2" 2>/dev/null)
  if [ $? -ne 0 ]; then echo "FAIL  $1 — $2 unreachable"; fail=1; return; fi
  if ! grep -q "$3" <<<"$body"; then
    echo "FAIL  $1 — '$3' missing from $2"; fail=1; return
  fi
  echo "ok    $1"
}

echo "== ASNM class preflight, $(date) =="
check "pitch page"        "https://adaptivesportsnearme.com/rcos/"            "The scoreboard"
check "pitch hero image"  "https://adaptivesportsnearme.com/rcos/asnm-live-home.jpg" ""
check "portraits"         "https://adaptivesportsnearme.com/rcos/karen.jpg"   ""
check "live site gated"   "https://adaptivesportsnearme.com/api/config"       '"prelaunch":true'
check "live homepage"     "https://adaptivesportsnearme.com/"                 "adaptive sports"
check "practice site up"  "https://asnm-staging.adapt-to-life.workers.dev/api/config" '"prelaunch":false'
check "practice data"     "https://asnm-staging.adapt-to-life.workers.dev/api/stats"  '"programs":'

echo "== four doors =="
node "$(dirname "$0")/four-doors-check.mjs" | tail -6

if [ $fail -eq 0 ]; then echo "== PREFLIGHT PASS — go teach =="; else
  echo "== PREFLIGHT FAIL — fix before class; backup PDF is in Drive =="; fi
exit $fail
