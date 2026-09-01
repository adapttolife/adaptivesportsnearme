import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkPublicDescription,
  isOperatorNote,
  repairPublicText,
  looksLikeNavigationLabel,
  splitPublicDescription,
  splitSentences,
  stripOperatorVocabulary,
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

// ---------------------------------------------------------------------------
// The Aug 2026 full-table sweep. Clara found the memos in `description`; the
// sweep found the same voice in `cost_note` and `ages`, which are public too.
// Every string below was live on the tester.

const REAL_MEMOS_OTHER_FIELDS = [
  "Upper bound not printed.",
  "Numeric floor/ceiling not printed.",
  "Dollar fee not printed on the official pages opened.",
  "Same legal org as extra 4fabebde (folded).",
  "Do not mark inactive from a historic timeout.",
  "Winter 2026-27 ski HOLD.",
  "Ability Challenge March 28, 2026 / Gala May 16, 2026 are past.",
  "Angel City Games June 26-28 are past and stay on this parent.",
  "Ride & Row Sept 23 stays on the HCAS row.",
  "Mesa CAF / Move United extra fold into this parent.",
  "Listed ipky.org is DNS-dead; this row is the live CAL Lexington page.",
  "No official replacement URL stored.",
  "Louisville and Western Kentucky offices are not written onto this statewide row.",
  "Historic 2016 archive (530) 925-1531 is not written as current desk.",
  "Those pages do not print a Warriors Unlimited calendar - none invented.",
  "Not CAF-Far-North / CAF-Shasta (invented names).",
  "Office hours 8:30am-7:15pm are desk hours, not class hours.",
  // Survivors of the first live repair, caught by reading the live corpus:
  "Org is not marked gone from a dead Tripod host alone.",
  "Org is not marked inactive from the 404 alone.",
  "Chapters index does not print Reno / Nevada this pass.",
  "Listing kept as stale.",
];

test("the memo voice is refused in every public field, not just description", () => {
  for (const m of REAL_MEMOS_OTHER_FIELDS) {
    assert.equal(isOperatorNote(m), true, `should have been refused: ${m}`);
  }
});

test("operator vocabulary is stripped, not the facts underneath it", () => {
  const cases = [
    ["Official cycling $20; mountain biking $40; hiking FREE.",
     "Cycling $20; mountain biking $40; hiking FREE."],
    ["Official: $25.00 includes a TOPS t-shirt.",
     "$25.00 includes a TOPS t-shirt."],
    ["Official cycling / kayaking: Ages 8+. Official mountain biking: Ages 18+.",
     "Cycling / kayaking: Ages 8+. Mountain biking: Ages 18+."],
    ["Kickball ages 5 and older (official). Upper bound not printed.",
     "Kickball ages 5 and older."],
    ["Open to all ages (official). Numeric floor/ceiling not printed.",
     "Open to all ages."],
  ];
  for (const [before, after] of cases) {
    assert.equal(repairPublicText(before).value, after, `repairing: ${before}`);
  }
});

test("a price or an age range is never thrown away by the repair", () => {
  // The regression that mattered: "Official: $65" was being emptied because the
  // colon form was not handled, discarding real fee data.
  for (const s of ["Official: $65.", "Official: registration fee is $50.", "Official: ages 5 and up."]) {
    const out = repairPublicText(s).value;
    assert.ok(out && /\d/.test(out), `lost the number in: ${s} -> ${out}`);
  }
});

test('"Not X" is a dedupe note only when it is short', () => {
  // Exactly one real organisation is called "Not Forgotten Outreach". Bound the
  // rule by length so real prose about it survives.
  assert.equal(isOperatorNote("Not SEWASP (Alpine Valley / East Troy)."), true);
  assert.equal(isOperatorNote("Not Tucson / Phoenix / Mesa Miracle League (no second AZ chapter opened)."), true);
  assert.equal(
    isOperatorNote(
      "Not Forgotten Outreach runs year round adaptive programs for veterans and their families across northern New Mexico."
    ),
    false
  );
});

test("a UUID inside a URL is not a record id", () => {
  assert.equal(
    isOperatorNote("Register at https://www.springfieldparks.org/b1a3e6aa-9015-4b80-8fe6-b69a28a6f995/special-needs/."),
    false
  );
  assert.equal(isOperatorNote("Child of already-listed SoCal Adaptive Sports (f7384a71-ef3a-4138-ba9c-9d9cfd45084a)."), true);
});

test("stripping is idempotent", () => {
  for (const m of [...REAL_MEMOS_OTHER_FIELDS, ...REAL_COPY]) {
    const once = stripOperatorVocabulary(m);
    assert.equal(stripOperatorVocabulary(once), once, `second strip changed: ${m}`);
  }
});

test("navigation labels are not organisations", () => {
  // All eight were live listings on the tester, scraped from the CAF directory.
  for (const n of ["Blog","Donate","Events Calendar","History","Our Team","Partner","Programs","Volunteer"]) {
    assert.equal(looksLikeNavigationLabel(n), true, `should be refused: ${n}`);
  }
  // Real organisation names that contain those words must still pass.
  for (const n of ["Achilles International","Adaptive Sports Ohio","Move United",
                   "Programs for Parity","Volunteers of America Adaptive Sports",
                   "History Makers Wheelchair Basketball"]) {
    assert.equal(looksLikeNavigationLabel(n), false, `should have passed: ${n}`);
  }
});

test("a navigation label cannot be approved into the directory", async () => {
  const src = await import("node:fs").then((fs) =>
    fs.readFileSync(new URL("../src/admin.js", import.meta.url), "utf8")
  );
  assert.match(src, /looksLikeNavigationLabel\(fields\.name\)/, "new-org path is unguarded");
});
