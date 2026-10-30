// Organization descriptions: the checks every draft passes before a person reads it,
// and the SQL the data lane runs (docs/specs/organization-descriptions.md).
import test from "node:test";
import assert from "node:assert/strict";
import {
  check,
  verifyQuotes,
  norm,
} from "../tools/directory/describe-check.mjs";
import {
  pickCandidates,
  proposalSql,
  exportSql,
} from "../tools/directory/describe.mjs";

// From the pilot Alec approved on 2026-10-18 ("all good").
const GOOD = {
  id: "11111111-2222-4333-8444-555555555555",
  description:
    "Golf 4 The Disabled runs adaptive golf clinics at Broken Tee Golf Course in Englewood, with group and individual instruction on the driving range, chipping area, and putting green. Its adaptive trained coaches teach people of all ages with a variety of disabilities, using the group's own adaptive clubs and carts.",
  source_url: "https://golf4thedisabled.org/",
  from_page: ["adaptive golf clinics"],
};
const withText = (description) => ({ ...GOOD, description });

test("a good draft from the pilot passes", () => {
  assert.deepEqual(check(GOOD), []);
});

test("each rule rejects a real kind of bad draft", () => {
  const cases = [
    [withText("Golf clinics."), /characters/],
    [
      withText(GOOD.description + " It also runs tennis. And swimming."),
      /sentences/,
    ],
    [
      withText(
        GOOD.description.replace("Englewood", "Englewood (call 303-555-0100)"),
      ),
      /contact detail/,
    ],
    [
      withText(GOOD.description.replace(", with group", " — with group")),
      /a dash/,
    ],
    [
      withText(
        GOOD.description.replace("Its adaptive", "Its inspiring adaptive"),
      ),
      /inspiring/,
    ],
    [
      withText(
        GOOD.description.replace(
          "people of all ages",
          "people with special needs",
        ),
      ),
      /special needs/,
    ],
    [
      withText(
        GOOD.description.replace("clinics at", "clinics every September at"),
      ),
      /date word/,
    ],
    [
      withText(GOOD.description.replace("clinics at", "clinics for $40 at")),
      /price/,
    ],
    [
      withText(
        "The Achievers is a group based in Orange County that has been around for a long time. It welcomes people of all ages with a variety of disabilities and their families too.",
      ),
      /no sport/,
    ],
    [{ ...GOOD, from_page: [] }, /no quotes/],
  ];
  for (const [draft, reason] of cases)
    assert.ok(
      check(draft).some((f) => reason.test(f)),
      `${reason} should fail: ${check(draft).join("; ")}`,
    );
});

test("quotes must be on the page the draft says it read", async () => {
  const page =
    "<p>Adaptive&nbsp;golf clinics &ndash; for &ldquo;everyone&rdquo;</p>";
  const read = async () => page;
  assert.deepEqual(
    await verifyQuotes(
      { ...GOOD, from_page: ["adaptive golf clinics", "for “everyone”"] },
      read,
    ),
    [],
  );
  assert.equal(
    (
      await verifyQuotes(
        { ...GOOD, from_page: ["lunar volleyball on the moon"] },
        read,
      )
    ).length,
    1,
  );
  assert.equal(norm("Ages 3 – 19"), "ages 3 19");
});

test("hidden notes come first, and each candidate keeps the text on record", () => {
  const rows = [
    { id: "a", name: "A", description: null },
    { id: "b", name: "B", description: "Questions: info@example.org." },
    { id: "c", name: "C", description: "Wheelchair basketball for kids." },
  ];
  const out = pickCandidates(rows, 10);
  assert.deepEqual(
    out.map((r) => [r.id, r.was]),
    [
      ["b", "hidden"],
      ["a", "empty"],
    ],
  );
  assert.equal(out[0].from, "Questions: info@example.org.");
  assert.equal(out[1].from, null);
});

test("a proposal records who approved it, or waits as pending", () => {
  const approved = proposalSql(
    { ...GOOD, from: null },
    { approvedBy: "Alec", now: "2026-10-18T12:00:00Z" },
  );
  assert.match(approved, /'describe'/);
  assert.match(
    approved,
    /'approved', '2026-10-18T12:00:00Z', '2026-10-18T12:00:00Z', 'Alec'\);$/,
  );
  assert.match(
    proposalSql({ ...GOOD, from: null }),
    /'pending', '[^']+', NULL, NULL\);$/,
  );
});

test("the live SQL keeps the old text and never overwrites a changed description", () => {
  const rows = [
    {
      organization_id: "x1",
      resolved_by: "Alec",
      proposed_change: JSON.stringify({
        description: { from: null, to: "New one." },
      }),
    },
    {
      organization_id: "x2",
      resolved_by: "Karen",
      proposed_change: JSON.stringify({
        description: { from: "Old note: call 303-555-0100.", to: "New two." },
        from_updated_at: "2026-10-14T01:02:03Z",
      }),
    },
  ];
  const sql = exportSql(rows, { today: "2026-10-18" });
  assert.match(
    sql,
    /WHERE id = 'x1' AND \(description IS NULL OR trim\(description\) = ''\);/,
  );
  assert.match(
    sql,
    /'Old description, moved 2026-10-18: ' \|\| description\), description = 'New two\.'.*WHERE id = 'x2' AND description IS NOT NULL AND updated_at = '2026-10-14T01:02:03Z';/,
  );
  assert.doesNotMatch(
    sql,
    /303-555-0100/,
    "the old note's text is never in the file",
  );
  assert.match(sql, /-- Read back: expect 2\./);
  assert.doesNotMatch(sql, /DELETE/i);
});

test("an export that would carry a contact detail is refused", () => {
  const rows = [
    {
      organization_id: "x3",
      resolved_by: "Alec",
      proposed_change: JSON.stringify({
        description: {
          from: null,
          to: "Email us at info@example.org for golf.",
        },
      }),
    },
  ];
  assert.throws(() => exportSql(rows), /contact detail/);
});
