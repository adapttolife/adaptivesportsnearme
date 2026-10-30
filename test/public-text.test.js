// "An organization's address, phone number and email show only when the
// organization says yes" (How we check listings). Notes in free text follow the
// same rule as the email and phone columns: src/public-text.js.
import test from "node:test";
import assert from "node:assert/strict";
import { publicText, hasContact, contactIn } from "../src/public-text.js";

// Real shapes from the directory (2026-10-18), with the details changed.
const MAMMOTH =
  "Operator is Access Example (formerly Disabled Sports Example; 501(c)(3) Fed Tax ID 31-1234567). Bring your own equipment or use ours. Open to adaptive riders of all experience levels. HQ: 1 Minaret Rd, PO Box 7275, Mammoth Lakes, CA 93546; 760-555-0191; info@example.org; © 2026.";
const BORP =
  "San Jose series: Free of Charge; Adaptive Cycles Provided; sjcycling@example.org. Questions: info@example.org / 510-555-4663.";
const COORD =
  "EPIC Program Coordinator Pat Example example73uniforms@gmail.com; official footer repeats the region.";

test("without consent, a note with contact details is not shown", () => {
  for (const note of [MAMMOTH, BORP, COORD])
    assert.equal(publicText(note, false), null, note);
});

test("with consent, the text is untouched", () => {
  assert.equal(publicText(MAMMOTH, true), MAMMOTH);
});

test("text with no contact details is untouched, and empty stays empty", () => {
  const plain = "Wheelchair basketball for ages 8 to 18. Chairs provided.";
  assert.equal(publicText(plain, false), plain);
  assert.equal(publicText(null, false), null);
});

test("years, ages, prices and tax IDs are not phone numbers", () => {
  for (const s of [
    "Founded in 2004.",
    "Ages 8-18.",
    "Member $135 / non-member $270.",
    "EIN 41-3213344",
    "Sat 1–4 pm",
  ])
    assert.ok(!hasContact(s), s);
});

test("the API passes notes through the rule", async () => {
  const src = (await import("node:fs")).readFileSync(
    new URL("../src/data.js", import.meta.url),
    "utf8",
  );
  assert.match(src, /desc: publicText\(r\.description, publicityConsent\)/);
  assert.match(src, /cost: publicText\(r\.cost_note, publicityConsent\)/);
});

test("each kind of contact detail is found", () => {
  assert.equal(contactIn("Questions: info@example.org."), "info@example.org");
  assert.equal(contactIn("Call (915) 555-4770 today"), "(915) 555-4770");
  assert.equal(
    contactIn("HQ: 1420 Kettner Blvd. Suite 201"),
    "1420 Kettner Blvd",
  );
  assert.equal(contactIn("Mail P.O. Box 2491, Keller"), "P.O. Box 2491");
});
