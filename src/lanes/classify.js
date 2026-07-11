// classify: gazetteer sport classification (Spec 72 T02).
// Contract: pure function classifyOrg(org, gazetteer) -> {sports: [sport_key...],
// hits: [{sport_key, term, field}]} | null, plus classifyLane({db, cursor}) that
// batches orgs whose sport is generic ('Multi-Sport') or NULL and proposes
//   { sport: {from,to}, sport_key: {from,to}, sports_json: {from,to} }
// confidence 0.85 (name hit) / 0.7 (description-only). sport_key in the proposal is
// the taxonomy row's icon_key (may be null) — never an unknown icon key, so
// classification can never break card imagery.

import { pendingOrgIds, proposeStmt, fetchText } from "../lane-utils.js";
import { GAZETTEER } from "../../data/gazetteer.js";

const CLASSIFY_BATCH = 15; // fetching lane since v2 (page classification) — budget like enrich

function escapeRegex(term) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Whole-word/phrase, case-insensitive matches of every gazetteer term against one
// field's text. Internal whitespace in a multi-word term matches flexibly (\s+); the
// \b anchors at the phrase's outer edges are what keeps "rowing" off "Growing" and
// "para nordic" off "Paradise ... Nordic-less" text — no bare ambiguous tokens ever
// reach this matcher because none exist in the gazetteer (test asserts that).
function findHits(text, gazetteer) {
  if (!text) return [];
  const hits = [];
  for (const entry of gazetteer) {
    for (const term of entry.terms) {
      const pattern = "\\b" + escapeRegex(term).replace(/\s+/g, "\\s+") + "\\b";
      const match = text.match(new RegExp(pattern, "i"));
      if (match) hits.push({ sport_key: entry.sport_key, term, index: match.index });
    }
  }
  hits.sort((a, b) => a.index - b.index);
  return hits;
}

export function classifyOrg(org, gazetteer) {
  const nameHits = findHits(org.name || "", gazetteer)
    .map(({ sport_key, term }) => ({ sport_key, term, field: "name" }));
  const descHits = findHits(org.description || "", gazetteer)
    .map(({ sport_key, term }) => ({ sport_key, term, field: "description" }));
  const hits = [...nameHits, ...descHits];
  if (!hits.length) return null;

  const sports = [];
  for (const hit of hits) {
    if (!sports.includes(hit.sport_key)) sports.push(hit.sport_key);
  }

  return { sports, hits, confidence: nameHits.length ? 0.85 : 0.7 };
}

const GAZETTEER_BY_KEY = new Map(GAZETTEER.map((entry) => [entry.sport_key, entry]));

// Page text is the primary sport signal in the real data (measured 2026-07-11: 0 of the
// 1,048 Multi-Sport orgs have a description, and names like "Ability360" carry no sport
// words — but 392 have websites, and an adaptive-sports org's homepage lists its
// programs). classifyPage runs the same gazetteer over tag-stripped homepage text.
// Still fully deterministic — no model anywhere.
function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

export function classifyPage(html, gazetteer) {
  const hits = findHits(stripTags(html), gazetteer)
    .map(({ sport_key, term }) => ({ sport_key, term, field: "page" }));
  if (!hits.length) return null;
  const sports = [];
  for (const hit of hits) {
    if (!sports.includes(hit.sport_key)) sports.push(hit.sport_key);
  }
  return { sports, hits, confidence: 0.7 };
}

// Subrequest budget: 15 orgs x at most 1 fetch + 3 D1 calls = 18 < 50. The page fetch
// happens only when name/description found nothing — the common case in the real data.
export async function classifyLane({ db, cursor }) {
  const { results: orgs } = await db.prepare(
    `SELECT id, name, description, website_url, sport, sport_key, sports_json FROM organizations
     WHERE status = 'active' AND (sport IS NULL OR sport = 'Multi-Sport') AND id > ?
     ORDER BY id LIMIT ?`
  ).bind(cursor, CLASSIFY_BATCH).all();
  if (!orgs.length) return { cursor: "", processed: 0, flagged: 0, detail: "cycle complete, cursor reset" };

  const pending = await pendingOrgIds(db, "classify", orgs.map((o) => o.id));
  const now = new Date().toISOString();
  const stmts = [];
  let flagged = 0, noSignal = 0, fatal = false;
  for (const org of orgs) {
    if (pending.has(org.id)) continue; // don't re-propose while one awaits review

    let result = classifyOrg(org, GAZETTEER);
    // Fetch the homepage only when name/description alone found nothing AND a site exists.
    if (!result && org.website_url) {
      const page = await fetchText(org.website_url);
      if (page?.fatal) { fatal = true; break; } // budget: stop, record nothing false
      if (page) result = classifyPage(page.text, GAZETTEER);
    }
    if (!result) { noSignal++; continue; }

    const entry = GAZETTEER_BY_KEY.get(result.sports[0]);
    if (!entry) continue; // defensive: every gazetteer sport_key is seeded, but never propose an unknown one

    flagged++;
    stmts.push(proposeStmt(db, org.id, "classify", {
      sport: { from: org.sport, to: entry.name },
      sport_key: { from: org.sport_key, to: entry.icon_key },
      sports_json: { from: org.sports_json ? JSON.parse(org.sports_json) : null, to: result.sports },
    }, {
      hits: result.hits,
      url: result.hits.some((h) => h.field === "page") ? org.website_url : undefined,
      method: "gazetteer v2",
    }, result.confidence, now));
  }
  if (stmts.length) await db.batch(stmts);
  return {
    cursor: orgs[orgs.length - 1].id, processed: orgs.length, flagged,
    detail: fatal ? "stopped early: subrequest limit" : (noSignal ? `${noSignal} without classifiable signal` : null),
  };
}
