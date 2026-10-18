#!/usr/bin/env bash
# Rebuild the staging database as an exact copy of production's directory (Alec, 2026-10-18:
# "get this set up now"). Staging keeps its database id, so no config or test changes. Its INTAKE
# binding points at the same database, so the empty intake tables are added from atl-intake.
#
#   scripts/rebuild-staging-from-production.sh                     # dry run: changes nothing
#   scripts/rebuild-staging-from-production.sh --fire              # back up staging, then replace it
#   scripts/rebuild-staging-from-production.sh --restore <backup>  # put a backup back
#
# Safe by construction: the drop and the load are ONE import, and D1 runs an import all or
# nothing, so staging is either fully replaced or left exactly as it was. Run it only after
# staging_only_into_production.sql, or staging's own listings are lost. Exporting production
# holds it for a few seconds: run it at a quiet hour.
set -euo pipefail
SOURCE_DB="${SOURCE_DB:-asnm-db}"; TARGET_DB="${TARGET_DB:-asnm-db-staging}"; INTAKE_DB="${INTAKE_DB:-atl-intake}"
WRANGLER="${WRANGLER:-npx wrangler}"; BACKUP_DIR="${BACKUP_DIR:-$HOME/asnm-db-backups}"
HERE="$(cd "$(dirname "$0")" && pwd)"; MODE="${1:-}"
if [ "$TARGET_DB" = "asnm-db" ] || [ "$TARGET_DB" = "$SOURCE_DB" ]; then
  echo "Refusing: the target would be $TARGET_DB. This script only ever replaces staging." >&2; exit 2
fi
json() { $WRANGLER d1 execute "$1" --remote --json --command="$2" 2>/dev/null | sed -n '/^\[/,$p'; }
count() { json "$1" "SELECT (SELECT COUNT(*) FROM organizations) AS o, (SELECT COUNT(*) FROM programs) AS p, (SELECT COUNT(*) FROM grants) AS g" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const r=JSON.parse(s)[0].results[0];console.log(`${r.o} organizations, ${r.p} programs, ${r.g} grants`)}catch(_){console.log("no directory tables")}})'; }
tables() { json "$1" "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s)[0].results.map(r=>r.name).join(" ")))'; }
replace_with() {   # $1 dump file, $2 extra schema file or -, $3 the target's own export (for its foreign keys)
  local file="$BACKUP_DIR/replace-$TARGET_DB-$stamp.sql"
  node "$HERE/lib/d1-replace-file.mjs" "$1" "$file" "$(tables "$TARGET_DB")" "$2" "$3"
  $WRANGLER d1 execute "$TARGET_DB" --remote --file "$file" --yes >/dev/null
}
mkdir -p "$BACKUP_DIR"; stamp="$(date -u +%Y%m%dT%H%M%SZ)"

if [ "$MODE" = "--restore" ]; then
  backup="${2:?Give the backup file: --restore <file>}"; [ -s "$backup" ] || { echo "No such backup: $backup" >&2; exit 2; }
  before="$BACKUP_DIR/$TARGET_DB-before-restore-$stamp.sql"; $WRANGLER d1 export "$TARGET_DB" --remote --output "$before" >/dev/null
  echo "Restoring $TARGET_DB from $backup (one import: all or nothing). Its state just before: $before"; replace_with "$backup" - "$before"
  echo "$TARGET_DB now: $(count "$TARGET_DB")"; exit 0
fi

echo "Source (copied from): $SOURCE_DB -> $(count "$SOURCE_DB")"
echo "Target (replaced):    $TARGET_DB -> $(count "$TARGET_DB")"
if [ "$MODE" != "--fire" ]; then
  echo "Dry run. With --fire: back up $TARGET_DB to $BACKUP_DIR, export $SOURCE_DB and the $INTAKE_DB tables, then replace"
  echo "$TARGET_DB in one all-or-nothing import, and check the counts match."; exit 0
fi
backup="$BACKUP_DIR/$TARGET_DB-$stamp.sql"; dump="$BACKUP_DIR/$SOURCE_DB-$stamp.sql"; intake="$BACKUP_DIR/$INTAKE_DB-schema-$stamp.sql"
echo "1/4 Backing up $TARGET_DB to $backup"; $WRANGLER d1 export "$TARGET_DB" --remote --output "$backup" >/dev/null
echo "2/4 Exporting $SOURCE_DB and the $INTAKE_DB tables"
$WRANGLER d1 export "$SOURCE_DB" --remote --output "$dump" >/dev/null
$WRANGLER d1 export "$INTAKE_DB" --remote --no-data --output "$intake" >/dev/null
grep -q '^CREATE TABLE' "$backup" || { echo "The backup has no tables: stopping, nothing changed." >&2; exit 3; }
grep -q '^CREATE TABLE organizations' "$dump" || { echo "The $SOURCE_DB export has no organizations table: stopping, nothing changed." >&2; exit 3; }
grep -q '^CREATE TABLE intake\b' "$intake" || { echo "The $INTAKE_DB export has no intake table: stopping, nothing changed." >&2; exit 3; }
echo "3/4 Replacing $TARGET_DB (one import: all or nothing)"; replace_with "$dump" "$intake" "$backup"
echo "4/4 Checking"; a="$(count "$SOURCE_DB")"; b="$(count "$TARGET_DB")"; echo "  $SOURCE_DB: $a"; echo "  $TARGET_DB: $b"
if [ "$a" != "$b" ]; then echo "Counts differ. Undo: $0 --restore $backup" >&2; exit 4; fi
echo "Done. $TARGET_DB matches $SOURCE_DB. Undo if ever needed: $0 --restore $backup"
