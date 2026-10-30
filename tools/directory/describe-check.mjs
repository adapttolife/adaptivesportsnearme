/**
 * The checks every organization description must pass before it is filed
 * (docs/specs/organization-descriptions.md, "The checks"). No network here except
 * verifyQuotes, which is handed a page reader so tests can run offline.
 */
import { contactIn } from "../../src/public-text.js";
import { checkPublicDescription } from "../../src/description-contract.js";

const SPORT =
  /\b(sport|sports|basketball|tennis|soccer|baseball|softball|ski|skis|skiing|snowboard\w*|skate\w*|swim\w*|cycl\w*|bike|biking|bicycl\w*|tandem|handcycle\w*|golf|karate|martial|triathlon|run|running|walk\w*|marathon|hockey|sled|rugby|football|bowling|archery|sail\w*|kayak\w*|paddl\w*|climb\w*|equestrian|horse\w*|riding|fitness|exercise|recreation|track|field|volleyball|pickleball|fencing|rowing|surf\w*|water|camp|camps|adventure|outdoor|games|athlet\w*|league|clinic\w*|yoga|dance|boxing|wrestling|judo|goalball|boccia|curling|shooting|hunting|fishing|hiking|kickball|cheer\w*|pool)\b/i;
const DATE_WORDS =
  /\b(January|February|March|April|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept?|Oct|Nov|Dec|spring|summer|autumn|winter|fall season|this fall)\b/;
const BANNED =
  /inspir\w*|\bsuffer\w*|confined|wheelchair[- ]bound|special needs|handicapped|victim/i;

export const MIN_CHARS = 120;
export const MAX_CHARS = 320;

/** Reasons a draft fails, or [] when it passes. */
export function check(draft) {
  const fails = [];
  const t = String(draft?.description || "").trim();
  if (!t) return ["no description"];
  const sentences = t.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(Boolean);
  if (sentences.length > 2)
    fails.push(`${sentences.length} sentences (at most 2)`);
  if (t.length < MIN_CHARS || t.length > MAX_CHARS)
    fails.push(`${t.length} characters (${MIN_CHARS} to ${MAX_CHARS})`);
  const contact = contactIn(t);
  if (contact) fails.push(`contact detail "${contact}"`);
  const memo = checkPublicDescription(t);
  if (!memo.ok)
    fails.push(`reads like a note to ourselves (${memo.reasons[0]})`);
  if (/[–—]/.test(t)) fails.push("a dash");
  const banned = t.match(BANNED);
  if (banned) fails.push(`the word "${banned[0]}"`);
  const date = t.match(DATE_WORDS);
  if (date) fails.push(`a date word "${date[0]}"`);
  if (/\b(19|20)\d{2}\b/.test(t)) fails.push("a year");
  if (/\$\s?\d|\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i.test(t))
    fails.push("a price or a time");
  if (!SPORT.test(t)) fails.push("no sport or activity named");
  if (!Array.isArray(draft.from_page) || !draft.from_page.length)
    fails.push("no quotes from the website");
  if (!/^https?:\/\//.test(String(draft.source_url || "")))
    fails.push("no source_url");
  return fails;
}

const NAMED = {
  amp: "&",
  nbsp: " ",
  rsquo: "'",
  lsquo: "'",
  ldquo: '"',
  rdquo: '"',
  ndash: "-",
  mdash: "-",
  quot: '"',
  apos: "'",
  hellip: "...",
};
/** Letters and numbers only: pages write quotes, dashes and spaces as entities or curly marks. */
export function norm(s) {
  return String(s ?? "")
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCodePoint(parseInt(n, 16)),
    )
    .replace(/&([a-z]+);/gi, (_, n) => NAMED[n.toLowerCase()] ?? " ")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Quotes not found on the pages the draft says it read. readPage(url) -> HTML or "". */
export async function verifyQuotes(draft, readPage) {
  const urls = [
    ...new Set([draft.source_url, ...(draft.pages_read || [])].filter(Boolean)),
  ];
  let all = "";
  for (const u of urls) all += " " + norm(await readPage(u));
  // A quote may join several bits of a page with " | " or "...": each bit must be there.
  return (draft.from_page || []).filter((q) =>
    String(q)
      .split(/\s\|\s|\.\.\.|…/)
      .map(norm)
      .filter((f) => f.length > 2)
      .some((f) => !all.includes(f)),
  );
}

export async function fetchPage(url) {
  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; ASNM-Describe/1; +https://adaptivesportsnearme.com)",
      },
      signal: AbortSignal.timeout(20000),
    });
    return await r.text();
  } catch {
    return "";
  }
}
