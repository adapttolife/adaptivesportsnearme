#!/usr/bin/env node
// The four-doors check — the definition of done for Fall 2026.
//
// Karen's test, as machinery. She names a place. She says yes only when she can
// find, near that place: a real program, an event (it can be far), a grant she
// could use, and the letter. If those doors fail, we are not open.
//
// This script runs that test the way she would — over public HTTP against the
// tester, with no credentials and no database access. It reads the product,
// not the plan. Any student can run it a minute after cloning:
//
//   node tools/four-doors-check.mjs
//   node tools/four-doors-check.mjs --place WI
//   node tools/four-doors-check.mjs --base https://adaptivesportsnearme.com
//
// Exit code 0 only when all four doors open. It is expected to fail today;
// the semester is over when it stops failing and Karen agrees with it.
//
// A listing counts as ACTIONABLE only if a stranger could act on it tonight:
// it names a place (city or zip) AND offers a route in (website or phone or
// email). A name alone is not a door — it is a locked one.

const args = process.argv.slice(2);
function opt(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
}
const BASE = (opt("base", "https://asnm-staging.alec-af3.workers.dev")).replace(/\/$/, "");
// Default place: Karen's home state. Override with --place.
const PLACE = (opt("place", "WI")).toUpperCase();

async function getJson(path) {
  const res = await fetch(BASE + path, { redirect: "follow" });
  if (!res.ok) return { __status: res.status };
  try { return await res.json(); } catch { return { __status: res.status, __notJson: true }; }
}
async function getStatus(path) {
  const res = await fetch(BASE + path, { redirect: "follow" });
  return res.status;
}

const actionable = (p) =>
  (p.city || p.zip) && (p.website || p.phone || p.email);

const doors = [];

// Door 1 — a real program near the place.
{
  const data = await getJson(`/api/programs?state=${PLACE}&limit=100`);
  const items = data.items ?? [];
  const usable = items.filter(actionable);
  doors.push({
    door: "Programs",
    open: usable.length > 0,
    detail: usable.length
      ? `${usable.length} actionable listing(s) in ${PLACE} (of ${data.total ?? items.length} returned) — e.g. "${usable[0].name}"`
      : `${items.length} listing(s) in ${PLACE}, none a stranger could act on (need city/zip + website/phone/email)`,
  });
}

// Door 2 — an event to show up to. It can be far; it cannot be imaginary.
{
  const data = await getJson(`/api/events`);
  const items = data.items ?? [];
  const upcoming = items.filter((e) => !e.starts_at || Date.parse(e.starts_at) >= Date.now() - 86400000);
  doors.push({
    door: "Events",
    open: upcoming.length > 0,
    detail: upcoming.length
      ? `${upcoming.length} upcoming event(s) — e.g. "${upcoming[0].title}"`
      : "events API answers but lists nothing upcoming",
  });
}

// Door 3 — a grant she could use, open now, with a way to apply.
{
  const data = await getJson(`/api/grants`);
  const items = data.items ?? [];
  const usable = items.filter((g) => g.isOpen && (g.applicationUrl || g.email || g.phone));
  doors.push({
    door: "Grants",
    open: usable.length > 0,
    detail: usable.length
      ? `${usable.length} open grant(s) with an application route — e.g. "${usable[0].name}"`
      : items.length
        ? `${items.length} grant(s) listed, none open with an application route`
        : `grants API missing or empty (status ${data.__status ?? "?"})`,
  });
}

// Door 4 — the letter. A human-written page that tells someone leaving rehab
// that sport is still possible. Not a form, not a feed. Alec and Karen's words.
{
  const status = await getStatus(`/letter`);
  doors.push({
    door: "The letter",
    open: status === 200,
    detail: status === 200 ? "/letter answers" : `/letter -> ${status} (the page does not exist yet)`,
  });
}

// ---- report ----
console.log(`\nFour-doors check — ${BASE}  (place: ${PLACE})\n`);
let openCount = 0;
for (const d of doors) {
  const mark = d.open ? "OPEN  " : "CLOSED";
  if (d.open) openCount++;
  console.log(`  ${mark}  ${d.door.padEnd(12)} ${d.detail}`);
}
console.log(`\n  ${openCount} of 4 doors open.`);
console.log(
  openCount === 4
    ? "  Every door opens. Now ask Karen — this script is the rehearsal, she is the test.\n"
    : "  Not open yet. That is the honest state, and closing these is the semester.\n"
);
process.exit(openCount === 4 ? 0 : 1);
