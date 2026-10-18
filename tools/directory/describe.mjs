#!/usr/bin/env node
/**
 * Organization descriptions (docs/specs/organization-descriptions.md).
 * Two plain sentences per organization, drafted only from its own website,
 * approved by a person, applied to live by the data lane. Tester only; live stays locked.
 *
 *   node describe.mjs batch [--size 50] [--state CA]   next organizations to draft → inbox/describe-<date>.json
 *   (draft them with describe-prompt.md, into a drafts file)
 *   node describe.mjs check <drafts.json>              every rule + every quote re-read on the live site
 *   node describe.mjs review <drafts.json>             a phone-friendly review page → inbox/describe-review.html
 *   node describe.mjs file <drafts.json> [--approved-by NAME --except 3,7] [--apply]
 *                                                      drafts → tester review_queue (pending, or approved by NAME)
 *   node describe.mjs export [--out FILE]              approved, not yet applied → SQL for the data lane to run on live
 *
 * Dry-run is the default: without --apply nothing is written anywhere.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { ROOT, staging, sqlQuote } from "./lib.mjs";
import { check, verifyQuotes, fetchPage } from "./describe-check.mjs";
import { contactIn } from "../../src/public-text.js";

export const LANE = "describe";
const INBOX = `${ROOT}/inbox`;

/** Organizations that need a description: public, active, a website, and nothing a visitor can read. */
export function candidatesSql({ state = "", size = 50 } = {}) {
  return `SELECT o.id, o.name, o.website_url AS website, o.city, o.state, o.sport, o.description, o.updated_at
FROM organizations o
WHERE o.is_public = 1 AND o.status = 'active' AND o.website_url IS NOT NULL AND trim(o.website_url) <> ''
${state ? `  AND o.state = ${sqlQuote(state)}\n` : ""}  AND NOT EXISTS (SELECT 1 FROM review_queue q WHERE q.organization_id = o.id AND q.lane = '${LANE}' AND q.status IN ('pending', 'approved'))
ORDER BY o.state, o.name
LIMIT ${Math.max(1, Math.min(Number(size) || 50, 2000)) * 6}`;
}

/** Keep empty descriptions and ones hidden for contact details; hidden ones first (their pages lost text). */
export function pickCandidates(rows, size = 50) {
  const needs = rows.map((r) => ({ ...r, was: !r.description || !String(r.description).trim() ? "empty" : contactIn(r.description) ? "hidden" : null })).filter((r) => r.was);
  needs.sort((a, b) => (a.was === b.was ? 0 : a.was === "hidden" ? -1 : 1));
  // `from` is the text on record now: the live UPDATE only runs if it is still the same.
  return needs.slice(0, size).map(({ description, updated_at, ...r }) => ({ ...r, from: description && String(description).trim() ? description : null, from_updated_at: updated_at ?? null }));
}

/** One review_queue row per draft. approvedBy: the person who read and approved it, or null for pending. */
export function proposalSql(draft, { approvedBy = null, now = new Date().toISOString() } = {}) {
  const change = { description: { from: draft.from ?? null, to: draft.description }, from_updated_at: draft.from_updated_at ?? null };
  const evidence = { source_url: draft.source_url, pages_read: draft.pages_read || [], fetched_at: draft.fetched_at, from_page: draft.from_page };
  return `INSERT INTO review_queue (organization_id, lane, proposed_change, evidence, confidence, status, created_at, resolved_at, resolved_by) VALUES (${[
    sqlQuote(draft.id), sqlQuote(LANE), sqlQuote(JSON.stringify(change)), sqlQuote(JSON.stringify(evidence)), "NULL",
    sqlQuote(approvedBy ? "approved" : "pending"), sqlQuote(now), approvedBy ? sqlQuote(now) : "NULL", approvedBy ? sqlQuote(approvedBy) : "NULL",
  ].join(", ")});`;
}

/** SQL the data lane runs on live for approved rows. The old text moves to internal_notes, never deleted,
    and a row changed since the draft is left alone. The guard is the row's updated_at, never the old
    text: old notes can hold contact details, and this file is committed to a public repository. */
export function exportSql(rows, { today = new Date().toISOString().slice(0, 10) } = {}) {
  const lines = [`-- Organization descriptions: ${rows.length} approved in the tester review_queue (lane '${LANE}').`,
    `-- Written by tools/directory/describe.mjs export on ${today}. Run once on asnm-db; each UPDATE checks the old text first.`, ""];
  for (const r of rows) {
    const proposed = JSON.parse(r.proposed_change), change = proposed.description, from = change.from;
    if (from != null && !proposed.from_updated_at) throw new Error(`${r.organization_id}: no from_updated_at to guard the old note with`);
    const guard = from == null ? "(description IS NULL OR trim(description) = '')" : `description IS NOT NULL AND updated_at = ${sqlQuote(proposed.from_updated_at)}`;
    const moved = from == null ? "internal_notes" : `trim(coalesce(internal_notes, '') || char(10) || ${sqlQuote(`Old description, moved ${today}: `)} || description)`;
    lines.push(`-- ${r.organization_id} · approved by ${r.resolved_by}`);
    lines.push(`UPDATE organizations SET internal_notes = ${moved}, description = ${sqlQuote(change.to)}, updated_at = ${sqlQuote(today)} WHERE id = ${sqlQuote(r.organization_id)} AND ${guard};`);
  }
  lines.push("", `-- Read back: expect ${rows.length}.`,
    `SELECT count(*) AS written FROM organizations WHERE id IN (${rows.map((r) => sqlQuote(r.organization_id)).join(", ") || "''"}) AND description IS NOT NULL;`);
  const sql = lines.join("\n") + "\n";
  const leak = contactIn(sql);
  if (leak) throw new Error(`refusing to write the export: it contains a contact detail ("${leak}")`);
  return sql;
}

const arg = (name, fallback = null) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : fallback; };
const has = (name) => process.argv.includes(name);
const readDrafts = (f) => JSON.parse(readFileSync(f, "utf8"));
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

async function checkAll(drafts) {
  for (const d of drafts) {
    d.fails = d.status === "draft" ? check(d) : [];
    if (d.status !== "draft") continue;
    const missing = await verifyQuotes(d, fetchPage);
    if (missing.length) d.fails.push(`${missing.length} quote(s) not on the website today: "${String(missing[0]).slice(0, 60)}"`);
  }
  return drafts;
}

function reviewHtml(drafts) {
  const drafted = drafts.filter((d) => d.status === "draft"), clean = drafted.filter((d) => !d.fails.length);
  const items = drafts.map((d, i) => {
    const host = (() => { try { return new URL(d.source_url).hostname.replace(/^www\./, ""); } catch { return d.source_url || ""; } })();
    const body = d.status === "draft" ? `<p class="draft">${esc(d.description)}</p>` : `<p class="nodraft"><b>No draft.</b> ${esc(d.reason)}</p>`;
    const fails = d.fails.length ? `<p class="fail">Check: ${esc(d.fails.join("; "))}</p>` : d.status === "draft" ? `<p class="ok">Passes every check</p>` : "";
    const quotes = d.status === "draft" ? `<details><summary>What the site says</summary><ul>${(d.from_page || []).map((q) => `<li>${esc(q)}</li>`).join("")}</ul></details>` : "";
    return `<li class="item"><div class="num">${i + 1}</div><div><h2>${esc(d.name)}</h2><p class="meta">${esc(d.state || "")} · ${d.was === "hidden" ? "Note hidden for contact details" : "No description"} · <a href="${esc(d.source_url)}">${esc(host)}</a></p>${body}${fails}${d.note ? `<p class="note">${esc(d.note)}</p>` : ""}${quotes}</div></li>`;
  }).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Organization descriptions to review</title>
<style>body{margin:0;font:17px/1.55 system-ui,sans-serif;color:#1a1a1a;background:#f3f3f3}main{max-width:720px;margin:0 auto;padding:28px 20px 80px}ol{list-style:none;padding:0}.item{display:grid;grid-template-columns:40px 1fr;gap:6px;padding:20px 0;border-top:1px solid #dedbd4}.num{font-weight:700;color:#e0482a}h2{font-size:19px;margin:0}.meta{font-size:14px;color:#5f5d58}.draft{font-size:19px;background:#fff;border-left:4px solid #1a1a1a;padding:12px 14px}.nodraft{background:#fff;padding:12px 14px}.ok{color:#1d6b3a;font-size:14px}.fail{color:#a12d12;font-size:14px}.note,details{font-size:14px;color:#5f5d58}</style></head>
<body><main><h1>Organization descriptions to review</h1><p>${drafted.length} drafted · ${drafts.length - drafted.length} couldn't be drafted · ${clean.length} pass every check. Reply with the numbers you'd change, or "all good".</p><ol>${items}</ol></main></body></html>`;
}

async function main() {
  const [cmd, file] = process.argv.slice(2);
  mkdirSync(INBOX, { recursive: true });
  if (cmd === "batch") {
    const size = Number(arg("--size", 50));
    const rows = pickCandidates(staging(candidatesSql({ state: arg("--state", ""), size })), size);
    const out = `${INBOX}/describe-${new Date().toISOString().slice(0, 10)}.json`;
    writeFileSync(out, JSON.stringify(rows, null, 1));
    console.log(`${rows.length} organizations → ${out} (${rows.filter((r) => r.was === "hidden").length} hidden for contact details first)`);
  } else if (cmd === "check" || cmd === "review") {
    if (!file) throw new Error(`usage: describe.mjs ${cmd} <drafts.json>`);
    const drafts = await checkAll(readDrafts(file));
    for (const d of drafts) if (d.fails.length) console.log(`FAIL ${d.name}: ${d.fails.join("; ")}`);
    const n = drafts.filter((d) => d.status === "draft").length, bad = drafts.filter((d) => d.fails.length).length;
    console.log(`${n} drafts, ${bad} failing, ${drafts.length - n} no draft`);
    if (cmd === "review") { writeFileSync(`${INBOX}/describe-review.html`, reviewHtml(drafts)); console.log(`review page → ${INBOX}/describe-review.html`); }
    if (cmd === "check" && bad) process.exit(1);
  } else if (cmd === "file") {
    if (!file) throw new Error("usage: describe.mjs file <drafts.json> [--approved-by NAME --except 3,7] [--apply]");
    const by = arg("--approved-by"), except = new Set(String(arg("--except", "")).split(",").filter(Boolean).map(Number));
    const drafts = await checkAll(readDrafts(file));
    const bad = drafts.filter((d) => d.fails.length);
    if (bad.length) { for (const d of bad) console.error(`FAIL ${d.name}: ${d.fails.join("; ")}`); throw new Error("fix the failing drafts first; nothing filed"); }
    const sql = drafts.map((d, i) => ({ d, n: i + 1 })).filter(({ d }) => d.status === "draft")
      .map(({ d, n }) => proposalSql(d, { approvedBy: by && !except.has(n) ? by : null })).join("\n");
    if (!has("--apply")) { console.log(sql + "\n-- dry run: add --apply to write the tester review_queue"); return; }
    staging(sql);
    console.log(`filed ${sql.split("\n").length} proposals in the tester review_queue`);
  } else if (cmd === "export") {
    const rows = staging(`SELECT item_id, organization_id, proposed_change, resolved_by FROM review_queue WHERE lane = '${LANE}' AND status = 'approved' ORDER BY item_id`);
    const sql = exportSql(rows);
    const out = arg("--out");
    if (out) { writeFileSync(out, sql); console.log(`${rows.length} approved → ${out}`); } else process.stdout.write(sql);
  } else {
    console.log(readFileSync(new URL(import.meta.url), "utf8").split("*/")[0]);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((e) => { console.error(`describe: ${e.message}`); process.exit(1); });
