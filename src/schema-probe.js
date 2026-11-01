// Code that reads a column or table added by a migration, before that migration has run.
// A migration and the code that uses it don't always land at the same moment
// (staging deploys on merge; a migration is run by hand). Code that needs a
// newer column tries the newer query first; if the database answers "no such
// column" or "no such table", it remembers that (per database, per Worker
// isolate) and uses the older query for the next few minutes, then tries the newer
// one again. So the site behaves exactly as before until the migration runs, and
// lights up within minutes after, without a redeploy. A database that has the
// migration pays nothing extra.

const MISSING = new WeakMap(); // db -> Map(key -> when it was found missing)
const RECHECK_MS = 5 * 60 * 1000;

const isSchemaGap = (err) =>
  /no such (column|table)|has no column named/i.test(
    String((err && err.message) || err),
  );

/** Run `newer()`; when the database lacks what it needs (feature `key`), run `older()` instead. */
export async function newerOrOlder(db, key, newer, older) {
  const known = db && MISSING.get(db);
  if (known && known.has(key) && Date.now() - known.get(key) < RECHECK_MS)
    return older();
  try {
    return await newer();
  } catch (err) {
    if (!db || !isSchemaGap(err)) throw err;
    let seen = MISSING.get(db);
    if (!seen) {
      seen = new Map();
      MISSING.set(db, seen);
    }
    seen.set(key, Date.now());
    return older();
  }
}

/** true once `key` has been found missing on this database. */
export function knownMissing(db, key) {
  const at = db && MISSING.get(db)?.get(key);
  return !!at && Date.now() - at < RECHECK_MS;
}

/** For tests: forget what was learned about a database. */
export function _forget(db) {
  MISSING.delete(db);
}
