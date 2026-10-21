// Editing an event fills a datetime-local input. That control has no timezone, so a
// stored UTC instant has to be shown in the viewer's zone and written back as UTC
// with a Z. Slicing "2026-11-01T15:00:00.000Z" to "2026-11-01T15:00" drops the Z;
// the browser then reads those digits as local time and the save shifts the instant
// by the viewer's offset (five hours in US Eastern on this date).
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { saveAdminItem } from "../src/admin-access.js";
import { updateManagedEvent } from "../src/organization-access.js";

const FILE = fileURLToPath(import.meta.url);
const STARTS = "2026-11-01T15:00:00.000Z";
const ENDS = "2026-11-01T18:30:00Z";
const EVENT_ID = "11111111-2222-4333-8444-555555555555";
const ORG_ID = "9fd14fc2-5d5d-472d-a0ca-a0a1de7651f6";

function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  sqlite.exec(`CREATE TABLE events (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', org_id TEXT, sport_key TEXT,
    venue TEXT, city TEXT, state TEXT, url TEXT, starts_at TEXT NOT NULL, ends_at TEXT,
    all_day INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'scheduled', is_public INTEGER NOT NULL DEFAULT 1,
    source TEXT NOT NULL DEFAULT 'admin', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`);
  const db = { prepare(sql) {
    let values = []; const statement = sqlite.prepare(sql);
    return {
      bind(...args) { values = args; return this; },
      async first() { return statement.get(...values) || null; },
      async all() { return { results: statement.all(...values) }; },
      async run() { return { meta: { changes: Number(statement.run(...values).changes) } }; },
    };
  } };
  return { sqlite, db };
}

async function runChild() {
  const { toDateTimeLocal, fromDateTimeLocal } = await import("../public/app/local-datetime.js");
  assert.equal(new Date(STARTS).getTimezoneOffset(), 300, "1 Nov 2026 in New York is five hours behind UTC");

  // 06:30Z is 1:30 AM after the clocks fall back. The same wall time also names 05:30Z,
  // and Date.parse picks that earlier instant. An unchanged field must keep 06:30Z.
  const fallBack = "2026-11-01T06:30:00.000Z";
  const fallShown = toDateTimeLocal(fallBack);
  assert.equal(fallShown, "2026-11-01T01:30:00", "the repeated hour is shown as 1:30");
  assert.equal(fromDateTimeLocal(fallShown, fallBack), fallBack, `DST fall-back save shifted ${fallBack} to ${fromDateTimeLocal(fallShown, fallBack)} (shown ${fallShown})`);
  assert.equal(fromDateTimeLocal(fallShown.slice(0, 16), fallBack), fallBack, "the minute form of that field keeps the stored instant");

  const shownStart = toDateTimeLocal(STARTS);
  const shownEnd = toDateTimeLocal(ENDS);
  const { sqlite, db } = database();
  try {
    sqlite.prepare(`INSERT INTO events (id, title, description, city, state, starts_at, ends_at, all_day, status, is_public, source, created_at, updated_at)
      VALUES (?, 'Fall clinic', 'Try the court', 'Troy', 'NY', ?, ?, 0, 'scheduled', 1, 'admin', '2026', '2026')`).run(EVENT_ID, STARTS, ENDS);
    const saved = await saveAdminItem(db, "events", EVENT_ID, {
      starts_at: fromDateTimeLocal(shownStart, STARTS),
      ends_at: fromDateTimeLocal(shownEnd, ENDS),
    });
    assert.equal(saved.starts_at, STARTS, `unchanged admin save shifted ${STARTS} to ${saved.starts_at} (shown ${shownStart})`);
    assert.equal(saved.ends_at, ENDS, `unchanged admin save shifted ${ENDS} to ${saved.ends_at} (shown ${shownEnd})`);
    assert.equal(shownStart, "2026-11-01T10:00:00", "the field shows the viewer's local time");
    assert.equal(shownEnd, "2026-11-01T13:30:00");
    assert.equal(fromDateTimeLocal("2026-11-01T10:00", STARTS), STARTS, "minute precision still names the same instant");
    assert.equal(fromDateTimeLocal("", ""), "");
    assert.equal(toDateTimeLocal(null), "");
    assert.equal(fromDateTimeLocal(toDateTimeLocal("2026-11-01T03:30:00.000Z"), "2026-11-01T03:30:00.000Z"), "2026-11-01T03:30:00.000Z");
    assert.equal(fromDateTimeLocal(toDateTimeLocal("2026-11-01T15:00:00.250Z"), "2026-11-01T15:00:00.250Z"), "2026-11-01T15:00:00.250Z");
    assert.equal(fromDateTimeLocal("2026-11-01T11:00:00", STARTS), "2026-11-01T16:00:00.000Z");
    const cleared = await saveAdminItem(db, "events", EVENT_ID, { ends_at: fromDateTimeLocal("", "") });
    assert.equal(cleared.ends_at, null);
    assert.equal(cleared.starts_at, STARTS);
    const edited = await saveAdminItem(db, "events", EVENT_ID, { starts_at: fromDateTimeLocal("2026-11-01T11:00:00", STARTS) });
    assert.equal(edited.starts_at, "2026-11-01T16:00:00.000Z");

    sqlite.prepare("INSERT INTO organizations (id, name, claim_email, created_at, updated_at) VALUES (?, 'Example', 'manager@example.test', '2026', '2026')").run(ORG_ID);
    sqlite.prepare(`INSERT INTO events (id, title, org_id, starts_at, ends_at, created_at, updated_at) VALUES (?, 'Fall clinic', ?, ?, ?, '2026', '2026')`)
      .run("22222222-3333-4444-8555-666666666666", ORG_ID, STARTS, ENDS);
    const managed = await updateManagedEvent(db, ORG_ID, "22222222-3333-4444-8555-666666666666", "manager@example.test", {
      title: "Fall clinic",
      starts_at: fromDateTimeLocal(toDateTimeLocal(STARTS), STARTS),
      ends_at: fromDateTimeLocal(toDateTimeLocal(ENDS), ENDS),
    });
    assert.equal(managed.starts_at, STARTS);
    assert.equal(managed.ends_at, ENDS);

    const fallId = "33333333-4444-4555-8666-777777777777";
    sqlite.prepare(`INSERT INTO events (id, title, description, starts_at, ends_at, created_at, updated_at)
      VALUES (?, 'Repeated hour', 'Clocks fell back', ?, NULL, '2026', '2026')`).run(fallId, fallBack);
    const fallSaved = await saveAdminItem(db, "events", fallId, { starts_at: fromDateTimeLocal(fallShown, fallBack) });
    assert.equal(fallSaved.starts_at, fallBack);
    const fallMinute = await saveAdminItem(db, "events", fallId, { starts_at: fromDateTimeLocal(fallShown.slice(0, 16), fallBack) });
    assert.equal(fallMinute.starts_at, fallBack);
  } finally {
    sqlite.close();
  }
  console.log(`ok ${fallBack} stayed put when shown as ${fallShown}`);
  console.log(`ok ${STARTS} stayed put when shown as ${shownStart}`);
}

if (process.env.EVENT_TIME_TZ_CHILD === "1") {
  runChild().then(() => process.exit(0), (error) => {
    console.error(error);
    process.exit(1);
  });
} else {
  test("a load-then-save with no edits keeps starts_at and ends_at in a US Eastern browser", () => {
    const result = spawnSync(process.execPath, [FILE], {
      env: { ...process.env, TZ: "America/New_York", EVENT_TIME_TZ_CHILD: "1" },
      encoding: "utf8",
    });
    assert.equal(result.status, 0, `${result.stdout || ""}${result.stderr || ""}`);
    assert.match(result.stdout, /2026-11-01T06:30:00\.000Z stayed put/);
    assert.match(result.stdout, /2026-11-01T15:00:00\.000Z stayed put/);
  });

  test("the admin and organization forms convert datetime-local instead of slicing the UTC text", () => {
    const admin = readFileSync(new URL("../public/app/views/admin.js", import.meta.url), "utf8");
    const manage = readFileSync(new URL("../public/app/views/manage.js", import.meta.url), "utf8");
    assert.match(admin, /toDateTimeLocal\(/);
    assert.match(admin, /fromDateTimeLocal\(/);
    assert.match(manage, /toDateTimeLocal\(/);
    assert.match(manage, /fromDateTimeLocal\(/);
    assert.doesNotMatch(admin, /slice\(0,\s*16\)/);
    assert.doesNotMatch(manage, /toISOString\(\)\.slice\(0,\s*16\)/);
  });
}
