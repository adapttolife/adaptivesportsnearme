#!/usr/bin/env bash
# One deploy path for ASNM. Usage: scripts/deploy.sh sandbox|staging|prod
# Wraps `cfrun wrangler deploy` and smoke-tests the deployed worker.
# Lanes: sandbox = v2-milestone workshop (deploy from the v2 branch);
#        staging = what's next (deploy from main); prod = the live site (gated).
set -euo pipefail
cd "$(dirname "$0")/.."

target="${1:-}"
case "$target" in
  sandbox) args=(--env sandbox); url="https://asnm-sandbox.alec-af3.workers.dev" ;;
  staging) args=(--env staging); url="https://asnm-staging.alec-af3.workers.dev" ;;
  prod)    args=();              url="https://adaptivesportsnearme.com" ;;
  *) echo "usage: scripts/deploy.sh sandbox|staging|prod" >&2; exit 1 ;;
esac

cfrun wrangler deploy "${args[@]}"

echo "— smoke test: $url"
sleep 3
code=$(curl -s -o /dev/null -w '%{http_code}' "$url/")
cfg=$(curl -s "$url/api/config")
echo "  / -> $code"
echo "  /api/config -> $cfg"
[ "$code" = "200" ] || { echo "FAIL: homepage not 200" >&2; exit 1; }
echo "$cfg" | grep -q '"ok":true' || { echo "FAIL: /api/config not ok" >&2; exit 1; }
progs=$(curl -s "$url/api/programs?limit=1")
echo "  /api/programs?limit=1 -> $(echo "$progs" | head -c 120)..."
echo "$progs" | grep -q '"ok":true' || { echo "FAIL: /api/programs not ok" >&2; exit 1; }
echo "OK: $target deployed and healthy"
