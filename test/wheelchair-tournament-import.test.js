import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { listEvents, eventsToIcs } from "../src/events.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const sql = read("db/maintenance/wheelchair_tournaments_2026_2027.sql");
const VEGAS = "4e5606d8-3fd4-5b13-8f42-537dc05b96ca";
const PVA = "cfee537a-7f69-588e-a0e4-898a73e7c090";
const vegasUrl = "https://pickleballtournaments.com/tournaments/usa-pickleball-golden-ticket-las-vegas-1";

function database(t) {
  const db = new DatabaseSync(":memory:");
  t.after(() => db.close());
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(read("db/schema.sql"));
  db.exec(read("data/sports-seed.sql"));
  return db;
}

function seed(db, { id = "existing", title = "Existing event", date = "2027-02-23", state = "NV", city = "Las Vegas", url = "", status = "scheduled", visible = 1 } = {}) {
  db.prepare(`INSERT INTO events
    (id,title,starts_at,state,city,url,status,is_public,description,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,'Human-edited description','2026-01-01','2026-01-02')`)
    .run(id, title, date, state, city, url, status, visible);
}

function d1(sqlite) {
  return { prepare(sql) {
    const stmt = sqlite.prepare(sql);
    return { bind(...args) { return { async all() { return { results: stmt.all(...args) }; } }; } };
  } };
}

test("imported events reach the calendar and ICS with inclusive all-day end dates", async (t) => {
  t.mock.method(Date, "now", () => Date.UTC(2026, 10, 3));
  const db = database(t);
  db.exec(sql);
  const result = await listEvents(d1(db), new URLSearchParams("sport=pickleball"));
  assert.deepEqual(result.items.map(e => e.id), [VEGAS, PVA]);
  assert.ok(result.items.every(e => e.all_day === 1 && e.series === null));
  assert.match(result.items[0].description, /\$50 flat fee/);
  assert.doesNotMatch(result.items[0].description, /\$95|\$45/);
  assert.match(result.items[1].description, /non-medal exhibition/);
  assert.doesNotMatch(result.items[1].description, /free|clinic|singles/i);
  const ics = eventsToIcs(result.items);
  assert.match(ics, /DTSTART;VALUE=DATE:20270223\r\nDTEND;VALUE=DATE:20270301/);
  assert.match(ics, /DTSTART;VALUE=DATE:20270424\r\nDTEND;VALUE=DATE:20270426/);
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
});

test("reruns preserve human edits, unrelated rows and all other tables", (t) => {
  const db = database(t);
  seed(db);
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('events','sqlite_sequence') ORDER BY name").all().map(r => r.name);
  const snapshot = () => tables.map(name => db.prepare(`SELECT * FROM "${name}" ORDER BY rowid`).all());
  const before = snapshot();
  db.exec(sql);
  db.prepare("UPDATE events SET is_public=0, status='cancelled', description='Reviewed by a human' WHERE id=?").run(VEGAS);
  const events = db.prepare("SELECT * FROM events ORDER BY id").all();
  db.exec(sql);
  assert.deepEqual(db.prepare("SELECT * FROM events ORDER BY id").all(), events);
  assert.equal(events.length, 3);
  assert.deepEqual(snapshot(), before);
});

test("alternate IDs, names and registration URL forms do not duplicate hidden or cancelled editions", (t) => {
  const db = database(t);
  seed(db, { title: "USA Pickleball Golden Ticket - Las Vegas", visible: 0, status: "cancelled" });
  seed(db, { id: "other-pva", state: "WI", date: "2027-04-24", url: "https://events.blackthorn.io/Ho1cSeR7/5a2FUi1TjM9/?ref=calendar" });
  const before = db.prepare("SELECT * FROM events ORDER BY id").all();
  db.exec(sql);
  assert.deepEqual(db.prepare("SELECT * FROM events ORDER BY id").all(), before);
});

test("reused URLs in past years do not suppress the new edition; same-year aliases do", (t) => {
  const db = database(t);
  seed(db, { date: "2026-02-23", url: vegasUrl });
  seed(db, { id: "pva-by-name", title: "2027 PVA Wheelchair Pickleball Invitational", date: "2027-04-24", state: "WI", city: "Franklin" });
  db.exec(sql);
  assert.ok(db.prepare("SELECT id FROM events WHERE id=?").get(VEGAS));
  assert.equal(db.prepare("SELECT id FROM events WHERE id=?").get(PVA), undefined);
  assert.equal(db.prepare("SELECT count(*) AS n FROM events").get().n, 3);
});

test("a similarly named Wisconsin tournament elsewhere or later does not suppress Franklin", (t) => {
  const db = database(t);
  const title = "PVA Wheelchair Pickleball Tournament 2027";
  seed(db, { id: "other-city", title, date: "2027-04-24", state: "WI", city: "Madison" });
  seed(db, { id: "other-month", title, date: "2027-08-24", state: "WI", city: "Franklin" });
  const before = db.prepare("SELECT * FROM events ORDER BY id").all();
  db.exec(sql);
  assert.ok(db.prepare("SELECT id FROM events WHERE id=?").get(PVA));
  assert.equal(db.prepare("SELECT count(*) AS n FROM events").get().n, 4);
  assert.deepEqual(db.prepare("SELECT * FROM events WHERE id IN ('other-city','other-month') ORDER BY id").all(), before);
});
