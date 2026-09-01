import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkPublicDescription,
  isOperatorNote,
  splitPublicDescription,
  splitSentences,
} from "../src/description-contract.js";

// Every string below is real text that was live on the tester in Aug 2026.
// If a future change makes any of these publishable again, this file fails.

const REAL_MEMOS = [
  'Official https://abilityfirstsports.org/ is still that Chico adapted-sports nonprofit.',
  'Do not invent a gym or practice clock.',
  'Do not write a city from the 916 area code.',
  'Official 916-228-1755 is NWBA roster chrome, not a City of Sacramento Access Leisure desk, not stored.',
  'Listed https://carplb.tripod.com/index.htm is dead this pass (NXDOMAIN / pipeline HTTP 530).',
  'Child of already-listed SoCal Adaptive Sports (f7384a71-ef3a-4138-ba9c-9d9cfd45084a).',
  'Not Adaptive Sports Arizona (invented name).',
  'Not SEWASP (Alpine Valley / East Troy).',
  'Distinct from Shasta Disabled Sports USA.',
  'Email and phone not printed on the official chapter page.',
  'Official leftover Summer Camp 2026 is past.',
  'Remaining 2026 dated clinic lives on the Ability360 Wheelchair Curling child (Wed Sept 23-Oct 28, 2026).',
];

const REAL_COPY = [
  'Indoor pickleball club at 6895 Sierra Center Pkwy, Reno. Listed by USA Pickleball for Sunday adaptive/wheelchair pickleball (11am-1pm, $5).',
  'Goalball program of Adaptive Sports Northwest serving Oregon and SW Washington. 2026 practices listed at the WA State School for the Blind gymnasium; coach Jen Armbruster.',
  'USWRA wheelchair rugby team (the Rhinos) practicing in Wooster. Open to athletes with loss of function in at least three limbs.',
  'Recreational wheelchair tennis (manual or power chair) in Wooster, Youngstown, and Cleveland throughout the summer, with optional tournament play.',
];

test("real pipeline memos are refused as public copy", () => {
  for (const m of REAL_MEMOS) {
    assert.equal(isOperatorNote(m), true, `should have been refused: ${m}`);
    assert.ok(checkPublicDescription(m).reasons.length > 0, `no reason given for: ${m}`);
  }
});

test("real human copy passes untouched", () => {
  for (const c of REAL_COPY) {
    assert.equal(isOperatorNote(c), false, `should have passed: ${c}`);
    assert.equal(splitPublicDescription(c).description, c);
    assert.equal(splitPublicDescription(c).internalNotes, null);
  }
});

test("empty and missing input is not an error", () => {
  for (const v of ["", "   ", null, undefined, 42]) {
    assert.equal(isOperatorNote(v), false);
  }
});

test("sentence splitter survives street addresses and abbreviations", () => {
  const t = "Main Office 5025 E. Washington St., Ste. 200, Phoenix, AZ 85034. Open to all ages.";
  assert.deepEqual(splitSentences(t), [
    "Main Office 5025 E. Washington St., Ste. 200, Phoenix, AZ 85034.",
    "Open to all ages.",
  ]);
});

test("a mixed record keeps its copy and sheds its memo", () => {
  const mixed =
    "501(c)(3) year-round adaptive sports in Southern Wisconsin and the Chicago area. " +
    "Not SEWASP (Alpine Valley / East Troy). Phone not printed on the official contact page.";
  const out = splitPublicDescription(mixed);
  assert.equal(
    out.description,
    "501(c)(3) year-round adaptive sports in Southern Wisconsin and the Chicago area."
  );
  assert.match(out.internalNotes, /SEWASP/);
  assert.match(out.internalNotes, /not printed/);
  assert.equal(out.movedSentences, 2);
  assert.equal(out.keptSentences, 1);
});

test("the repair is idempotent — repaired copy never needs repairing again", () => {
  for (const m of [...REAL_MEMOS, ...REAL_COPY]) {
    const once = splitPublicDescription(m).description;
    if (!once) continue;
    assert.equal(isOperatorNote(once), false, `still contaminated after repair: ${once}`);
    assert.equal(splitPublicDescription(once).description, once, "second pass changed the text");
  }
});

test("a memo can never be published through the admin apply whitelist", async () => {
  // Guards the contract at the boundary the pipeline actually writes through.
  const src = await import("node:fs").then((fs) =>
    fs.readFileSync(new URL("../src/admin.js", import.meta.url), "utf8")
  );
  assert.match(src, /rejectMemoDescription\(fields\)/, "new-org path is unguarded");
  assert.match(src, /rejectMemoDescription\(applyFields\)/, "existing-org apply path is unguarded");
});

test("internal_notes is never exposed by the public API", async () => {
  const src = await import("node:fs").then((fs) =>
    fs.readFileSync(new URL("../src/data.js", import.meta.url), "utf8")
  );
  const cols = src.match(/const LIST_COLS = `([^`]+)`/)[1];
  assert.equal(/internal_notes/.test(cols), false, "internal_notes leaked into the public column list");
});
