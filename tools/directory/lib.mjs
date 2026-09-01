/** Shared helpers for Adaptive Sports Near Me pile scripts. Tester writes only via callers. */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = HERE;
export const WORKER_DIR = join(HERE, "../..");
export const AUDIT_DIR = join(HERE, ".local");
export const STAGING_DB = "asnm-db-staging";
export const LIVE_DB = "asnm-db";
export const LIVE_PUBLIC_EXPECTED = 1544;
export const TESTER = "https://asnm-staging.alec-af3.workers.dev";
export const LIVE = "https://adaptivesportsnearme.com";

export function sqlQuote(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  return `'${String(v).replace(/'/g, "''")}'`;
}

export function parseJson(v) {
  if (!v) return {};
  if (typeof v === "object") return v;
  try { return JSON.parse(v); } catch { return {}; }
}

export function d1(db, sql, { env } = {}) {
  const args = ["d1", "execute", db];
  if (env) args.push("--env", env);
  args.push("--remote", "--command", sql, "--json");
  const raw = execFileSync("wrangler", args, {
    cwd: WORKER_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const parsed = JSON.parse(raw);
  return parsed?.[0]?.results || parsed?.result?.[0]?.results || parsed?.results || [];
}

export function staging(sql) {
  return d1(STAGING_DB, sql, { env: "staging" });
}

export function live(sql) {
  if (!/^\s*select/i.test(sql)) throw new Error("refusing asnm-db write — live stays locked; public count must stay 1544");
  return d1(LIVE_DB, sql);
}

export function count(rows) {
  return Number(rows[0]?.n ?? rows[0]?.COUNT ?? 0);
}

export function loadNever() {
  return JSON.parse(readFileSync(`${ROOT}/never-touch.json`, "utf8"));
}

export function isNeverTouch(id, extra = []) {
  if (!id) return false;
  const never = loadNever();
  const s = String(id);
  const extraSet = extra instanceof Set ? extra : new Set(Array.isArray(extra) ? extra : []);
  if ((never.ids || []).includes(s) || extraSet.has(s)) return true;
  return (never.prefixes || []).some((p) => s === p || s.startsWith(`${p}-`) || s.startsWith(p));
}

export function checkUrl(url, { timeout = 10 } = {}) {
  let href = url || "";
  if (href && !/^https?:/i.test(href)) href = `https://${href}`;
  try {
    const out = execFileSync("curl", [
      "-sS", "-o", "/dev/null", "-w", "%{http_code} %{url_effective}",
      "-L", "--max-time", String(timeout),
      "-A", "ASNM-Tools/1 (+https://adaptivesportsnearme.com)",
      href,
    ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    const space = out.indexOf(" ");
    const code = space === -1 ? out : out.slice(0, space);
    const final = space === -1 ? href : out.slice(space + 1);
    return { ok: code === "200", status: Number(code) || code, final, url: href };
  } catch (e) {
    return { ok: false, status: "err", final: href, url: href, error: String(e.stderr || e.message).slice(0, 160) };
  }
}

export function originHome(url) {
  try {
    const u = new URL(/^https?:/i.test(url) ? url : `https://${url}`);
    return `${u.protocol}//${u.host}/`;
  } catch {
    return null;
  }
}


export function inventedName(name) {
  return /^Adaptive Sports\s/i.test(name || "");
}

export function guessedCafParent(name) {
  return /^CAF[- ]/i.test(name || "") || /^Challenged Athletes Foundation[- ]/i.test(name || "");
}

export function lintCard(card) {
  const errors = [];
  const extra = new Set(card.do_not_touch || []);
  if (!card.pile?.name) errors.push("pile.name missing");
  for (const fill of card.fills || []) {
    if (!fill.id) errors.push("fill missing id");
    if (!/^https:\/\//i.test(fill.source_url || "")) errors.push(`fill ${fill.id} needs https source_url`);
    if (isNeverTouch(fill.id, extra)) errors.push(`fill ${fill.id} is never-touch`);
    if (inventedName(fill.fields?.name || fill.name)) errors.push(`invented name: ${fill.fields?.name || fill.name}`);
  }
  for (const add of card.adds || []) {
    if (!add.name) errors.push("add missing name");
    if (!/^https:\/\//i.test(add.source_url || add.website_url || "")) errors.push(`add ${add.name} needs https source`);
    if (inventedName(add.name)) errors.push(`invented name: ${add.name}`);
    if (guessedCafParent(add.name) && !/^https:\/\//i.test(add.official_caf_region_url || "")) {
      errors.push(`guessed CAF parent: ${add.name}`);
    }
  }
  for (const fold of card.folds || []) {
    for (const hid of fold.hide || []) {
      if (isNeverTouch(hid, extra)) errors.push(`fold hides never-touch ${hid}`);
    }
  }
  return errors;
}
