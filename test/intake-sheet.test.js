import test from "node:test";
import assert from "node:assert/strict";
import { sheetRow, CRM_HEADERS, syncIntakeToSheet, crmTab } from "../src/intake_sheet.js";

const ROW = {
  id: "aaaaaaaa-1111-2222-3333-444444444444",
  received_at: "2026-09-16T03:15:20.148Z",
  site: "adaptivesportsnearme.com",
  kind: "program",
  name: null,
  email: "coach@example.org",
  phone: null,
  summary: "New program submitted: Cedar Rapids Adaptive Rowing",
  payload: JSON.stringify({ Program: "Cedar Rapids Adaptive Rowing", City: "Cedar Rapids", State: "IA", Notes: "" }),
  source: "asnm-add-a-program",
  status: "new",
  notified_at: "2026-09-16T03:15:21.000Z",
};

test("the row matches the tab's columns, one per header", () => {
  assert.equal(sheetRow(ROW).length, CRM_HEADERS.length);
  assert.equal(sheetRow(ROW)[CRM_HEADERS.indexOf("Intake ID")], ROW.id);
  assert.equal(sheetRow(ROW)[CRM_HEADERS.indexOf("Form")], "program");
});

test("details read as lines a person can scan, and empty fields are left out", () => {
  const details = sheetRow(ROW)[CRM_HEADERS.indexOf("Details")];
  assert.match(details, /Program: Cedar Rapids Adaptive Rowing/);
  assert.match(details, /City: Cedar Rapids/);
  assert.equal(/Notes:/.test(details), false);
});

test("a formula typed into a public form arrives as text, not a live formula", () => {
  const evil = sheetRow({ ...ROW, name: "=IMPORTXML(\"http://x\",\"//a\")", email: "+15550000000" });
  assert.equal(evil[CRM_HEADERS.indexOf("Name")].startsWith("'="), true);
  assert.equal(evil[CRM_HEADERS.indexOf("Email")].startsWith("'+"), true);
});

test("without the Google credential the rows stay in D1 and the miss is loud", async () => {
  const errs = [];
  const orig = console.error;
  console.error = (...a) => errs.push(a.join(" "));
  try {
    const out = await syncIntakeToSheet({ INTAKE: {} });
    assert.equal(out.error, "no GOOGLE_SA_JSON");
    assert.equal(out.appended, 0);
    assert.equal(errs.some((e) => /GOOGLE_SA_JSON/.test(e)), true);
  } finally { console.error = orig; }
});

test("a review lane can point at its own tab, so proving this never writes the real one", () => {
  assert.equal(crmTab({}), "Form Submissions");
  assert.equal(crmTab({ CRM_TAB: "Form Submissions (review)" }), "Form Submissions (review)");
});

// Canaries are the meter's own traffic. A person reading the CRM should never
// see them, and the query is the only place that can keep them out.
test("synthetic rows are excluded by the query, not by a later filter", async () => {
  let sql = "";
  const env = {
    GOOGLE_SA_JSON: "{}",
    INTAKE: { prepare(q) { sql = q; return { bind: () => ({ all: async () => ({ results: [] }) }) }; } },
  };
  await syncIntakeToSheet(env);
  assert.match(sql, /is_canary IS NULL OR is_canary = 0/);
  assert.match(sql, /sheet_synced_at IS NULL/);
});
