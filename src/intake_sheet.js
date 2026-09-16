// The intake table, mirrored into the Adapt To Life CRM as rows a person reads.
//
// Alec, 2026-09-15: "we should get an email then adds to Google Sheets so we
// have a boring, easy and repeatable process." The email is the notification and
// the sheet is the record, and BOTH come off the same row: submit writes the
// row, the notification stamps it, this stamps it again when the row reaches the
// sheet. Nothing is parsed out of an email, because a subject line that changes
// would stop the sheet filling and nobody would notice for a month.
//
// This runs on the intake cron, never on the request path: appending to Sheets
// in front of a member of the public puts a third-party API between them and
// their confirmation.
//
// Read before write. The append is claimed by stamping sheet_synced_at AFTER it
// lands, so a crash in between is reconciled on the next tick (the id is already
// in the tab, so the row is skipped) instead of appended twice.

import { googleToken } from "./google.js";
import { bookId, ensureTab, readGrid, appendRow, text } from "./sheets.js";

export const CRM_TAB_DEFAULT = "Form Submissions";
export const crmTab = (env) => (env && env.CRM_TAB) || CRM_TAB_DEFAULT;

// Column order is the contract with the tab. Intake ID last and always written:
// it is what makes this job idempotent.
export const CRM_HEADERS = [
  "Received (UTC)", "Site", "Form", "Name", "Email", "Phone",
  "Summary", "Details", "Source", "Status", "Notified", "Intake ID",
];

function detailLines(row) {
  let payload = {};
  try { payload = JSON.parse(row.payload || "{}"); } catch { payload = {}; }
  return Object.entries(payload)
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

export function sheetRow(row) {
  return [
    row.received_at || "", row.site || "", row.kind || "",
    text(row.name || ""), text(row.email || ""), text(row.phone || ""),
    text(row.summary || ""), text(detailLines(row)),
    text(row.source || ""), row.status || "new",
    row.notified_at || "", row.id,
  ];
}

/**
 * Mirror every unsynced, non-synthetic intake row into the CRM tab.
 * Returns { appended, skipped, error } — never throws, because it shares a cron
 * tick with the notification sweep and must not take that down with it.
 */
export async function syncIntakeToSheet(env, limit = 50) {
  if (!env.INTAKE) return { appended: 0, skipped: 0, error: "no INTAKE binding" };
  if (!env.GOOGLE_SA_JSON) {
    // Loud on purpose: the record stays in D1, so this is recoverable, but a
    // silent skip here is how a CRM quietly stops filling.
    console.error("intake sheet: GOOGLE_SA_JSON is unset — rows are recorded but not mirrored");
    return { appended: 0, skipped: 0, error: "no GOOGLE_SA_JSON" };
  }

  let rows = [];
  try {
    const res = await env.INTAKE.prepare(
      `SELECT * FROM intake
        WHERE sheet_synced_at IS NULL AND (is_canary IS NULL OR is_canary = 0)
        ORDER BY received_at ASC LIMIT ?`
    ).bind(limit).all();
    rows = res.results || [];
  } catch (err) {
    console.error("intake sheet: query failed:", err);
    return { appended: 0, skipped: 0, error: String(err) };
  }
  if (!rows.length) return { appended: 0, skipped: 0 };

  try {
    const token = await googleToken(env);
    const sheetId = bookId(env, "atlCrm");
    const tab = crmTab(env);
    await ensureTab(token, sheetId, tab, CRM_HEADERS);

    // The tab is the source of truth for "is it already there".
    const grid = await readGrid(token, sheetId, tab, "A1:L2000");
    const idCol = (grid[0] || []).findIndex((h) => String(h).trim().toLowerCase() === "intake id");
    const present = new Set(
      idCol < 0 ? [] : grid.slice(1).map((r) => String(r[idCol] || "").trim()).filter(Boolean)
    );

    let appended = 0, skipped = 0;
    for (const row of rows) {
      if (!present.has(row.id)) {
        await appendRow(token, sheetId, tab, sheetRow(row));
        appended++;
      } else {
        skipped++;
      }
      await env.INTAKE.prepare(`UPDATE intake SET sheet_synced_at = ? WHERE id = ?`)
        .bind(new Date().toISOString(), row.id).run();
    }
    return { appended, skipped };
  } catch (err) {
    console.error("intake sheet: append failed:", err);
    return { appended: 0, skipped: 0, error: String(err) };
  }
}
