#!/usr/bin/env node
/**
 * Split a resolve card into obvious same-org twins vs shared-website holds.
 * Writes the safe folds back onto the card. Does not write the database.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { staging, isNeverTouch, ROOT } from "./lib.mjs";

const SHARED = [
  "specialolympics.org", "moveunitedsport.org", "challengedathletes.org",
  "teamusa.org", "paralympic.org", "va.gov", "usrowing.org", "usoc.org",
  "disabledsportsusa.org",
];

function host(url) {
  try {
    const u = new URL(/^https?:/i.test(url) ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch { return ""; }
}
function sharedNat(h) {
  return SHARED.some((s) => h === s || h.endsWith(`.${s}`));
}
function norm(name) {
  return String(name || "").toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}
function core(name) {
  return norm(name)
    .replace(/\bparalympic sport\b.*/g, "")
    .replace(/\b(inc|incorporated|llc|foundation|association|club|program|department)\b/g, "")
    .replace(/\s+/g, " ").trim();
}
function tokens(s) {
  return new Set(core(s).split(" ").filter((t) => t && t.length > 1));
}
function ratio(a, b) {
  const A = tokens(a), B = tokens(b);
  if (!A.size && !B.size) return 1;
  if (!A.size || !B.size) return 0;
  let n = 0;
  for (const t of A) if (B.has(t)) n++;
  return (2 * n) / (A.size + B.size);
}

const file = process.argv[2] || `${ROOT}/inbox/queue-resolve.json`;
const card = JSON.parse(readFileSync(file, "utf8"));
const ids = new Set();
for (const f of card.folds || []) {
  ids.add(f.keep);
  for (const h of f.hide || []) ids.add(h);
}
const orgs = new Map();
const list = [...ids];
for (let i = 0; i < list.length; i += 80) {
  const part = list.slice(i, i + 80);
  const rows = staging(`SELECT id, name, city, state, website_url FROM organizations WHERE id IN (${part.map((id) => `'${id}'`).join(",")})`);
  for (const r of rows) orgs.set(r.id, r);
}

const safe = [];
const holds = [];
for (const f of card.folds || []) {
  const keep = orgs.get(f.keep);
  const hides = (f.hide || []).map((id) => orgs.get(id)).filter(Boolean);
  const label = { keep: keep?.name, hide: hides.map((h) => h.name), reason: f.reason };
  if (!keep) { holds.push({ ...label, reason: "keep missing" }); continue; }
  if (isNeverTouch(f.keep) || (f.hide || []).some((id) => isNeverTouch(id))) {
    holds.push({ ...label, reason: "never-touch" }); continue;
  }
  const kh = host(keep.website_url);
  if (sharedNat(kh)) { holds.push({ ...label, reason: `national site ${kh}` }); continue; }

  let ok = true;
  let why = "same name, same place";
  for (const h of hides) {
    if (sharedNat(host(h.website_url))) { ok = false; why = `national site ${host(h.website_url)}`; break; }
    const sameState = !!(keep.state && h.state && keep.state === h.state);
    const sameCity = !!(keep.city && h.city && keep.city.toLowerCase() === h.city.toLowerCase());
    const r = ratio(keep.name, h.name);
    const contained = core(keep.name).includes(core(h.name)) || core(h.name).includes(core(keep.name));
    const close = r >= 0.8 || (contained && r >= 0.75);
    const childBits = ["special olympics", "veterans", "wheelchair", "football", "goalball", "cycling", "sled", "hockey", "weekend", "2026", "fall sports", "summer", "bowl", "region", "classic", "clinic", "expo"];
    const hideCore = core(h.name);
    const keepCore = core(keep.name);
    const extraChild = childBits.some((b) => hideCore.includes(b) && !keepCore.includes(b));
    const genericKeep = /^(university of|city of|chicago park|special olympics|ymca)\b/.test(keepCore);
    if (genericKeep && hideCore !== keepCore) { ok = false; why = `parent vs program: ${keep.name} vs ${h.name}`; break; }
    if (extraChild) { ok = false; why = `sport or event line: ${h.name}`; break; }
    if (!(sameState || sameCity)) { ok = false; why = `no shared place: ${keep.city} ${keep.state} vs ${h.city} ${h.state}`; break; }
    if (keep.city && h.city && !sameCity) { ok = false; why = `different city: ${keep.city} vs ${h.city}`; break; }
    if (keep.state && h.state && !sameState) { ok = false; why = `different state: ${keep.state} vs ${h.state}`; break; }
    if (!close) { ok = false; why = `different program (${r.toFixed(2)}): ${keep.name} vs ${h.name}`; break; }
  }
  if (ok) safe.push({ ...f, keep_name: keep.name, hide_names: hides.map((h) => h.name), where: [keep.city, keep.state].filter(Boolean).join(", ") });
  else holds.push({ ...label, reason: why });
}

card.folds = safe.map(({ keep, hide, reason }) => ({ keep, hide, reason }));
card.holds = holds;
card.queue = {
  approve: safe.map((s) => Number(String(s.reason).match(/queue (\d+)/)?.[1])).filter(Boolean),
  reject: [],
};
writeFileSync(file, JSON.stringify(card, null, 2) + "\n");
writeFileSync(`${ROOT}/twin-review.json`, JSON.stringify({
  when: new Date().toISOString(),
  safe: safe.length,
  hold: holds.length,
  groups: safe,
  holds,
}, null, 2) + "\n");

console.log(`safe twins: ${safe.length}`);
console.log(`held: ${holds.length}`);
for (const s of safe) {
  console.log(`KEEP ${s.keep_name} — ${s.where}`);
  for (const n of s.hide_names) console.log(`  hide ${n}`);
}
