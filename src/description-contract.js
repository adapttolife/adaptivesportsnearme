// The description contract.
//
// `organizations.description` is PUBLIC COPY. It is rendered, unmodified, to a
// disabled athlete deciding whether a program is for them. It is the only piece
// of free text on the card they read.
//
// The pipeline also produces something that LOOKS like prose but is not copy:
// verification memos written for the next pass — "Official ... is still that
// program", "Do not invent a gym", "Not SEWASP", "NXDOMAIN this pass". Those
// memos are valuable. They are what stops a later run from re-merging two orgs
// that share a name. But they belong in `internal_notes`, never in
// `description`.
//
// In Aug 2026 an RCOS student read the live tester and found that 282 of 356
// populated descriptions were memos rather than copy, and that many more were
// good copy with a memo tail welded on. This module is the machinery that makes
// that class of bug impossible to repeat, instead of a note asking people to be
// careful. It is deliberately sentence-level: a record is rarely all-memo or
// all-copy, and throwing away the whole field would discard real work.

// A sentence matching any of these was written to a machine, not to a person.
const MEMO_PATTERNS = [
  [/\bdo not (invent|write|add|store|smash|guess|make up|fabricate)\b/i, "operator instruction"],
  [/\bthis pass\b/i, "pipeline-run jargon"],
  [/\bnot stored\b/i, "storage decision"],
  [/\bnot printed\b/i, "extraction outcome"],
  [/\bis still (that|the)\b/i, "verification voice"],
  [/\bis still [A-Z][\w'&.-]*,\s*not\b/, "verification voice"],
  [/^\s*official\b/i, "verification voice (leading \"Official\")"],
  [/^not\b/i, "dedupe note (sentence opens \"Not …\")"],
  [/[.;)]\s+not\s+(a\s+|an\s+|the\s+)?[A-Z0-9]/i, "dedupe note (\"Not X\")"],
  [/\bnot\s+(a|an)\s+\w+\s+(parent|child|row|affiliate)\b/i, "dedupe note"],
  [/\bstays a\s+\w+\s+row\b/i, "internal record-shape note"],
  [/\bare not HQ\b|\bas HQ\b/i, "internal HQ disambiguation"],
  [/\bhours are\s+\w+\s+hours\b/i, "internal field-meaning note"],
  [/\bnot a (second|third|fourth|fifth)\b/i, "dedupe note"],
  [/\bchild of\b/i, "parent/child relationship"],
  [/\blives on the\b[^.]*\bchild\b/i, "internal record-shape note"],
  [/\b(child|parent)\s+row\b/i, "internal record-shape note"],
  [/\b\w+\s+child\b(?!ren)/i, "internal record-shape note"],
  [/\bdistinct from\b/i, "disambiguation aside"],
  [/\(invented name\)/i, "negative-space note"],
  [/\bNXDOMAIN\b/i, "raw DNS diagnostic"],
  [/\bHTTP \d{3}\b/, "raw HTTP status"],
  [/\b\d{3}s\b(?=[^.]*\b(redirect|Cloudflare|chrome)\b)/i, "raw status jargon"],
  [/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, "raw record UUID"],
  [/\(\s*[0-9a-f]{8}\s*\)/i, "raw record id fragment"],
  [/\bremaining[^.]{0,40}\bclock\b/i, "pipeline scheduling jargon"],
  [/\bleftover\b/i, "pipeline triage jargon"],
  [/\bchrome\b/i, "scraper jargon"],
  [/\bfirst-party URL\b/i, "scraper jargon"],
  [/\bextracted\b/i, "pipeline verb"],
];

// Split on sentence boundaries without breaking decimals, abbreviations that
// matter here (St., Ste., Dr., Rd., Blvd., P.O.), or time ranges.
const ABBREV = new Set([
  "st","ste","dr","rd","blvd","ave","ct","ln","pkwy","hwy","mt","jr","sr","no",
  "inc","co","corp","dept","univ","approx","vs","etc","apt","fl","rm","pl","ter",
  "p.o","u.s","a.m","p.m","est","cst","mst","pst",
]);

// Split on sentence boundaries. Guards, in order of how they bit us in Aug 2026:
//  - "5025 E. Washington St." — never break after a single capital letter
//  - "Ste. 200" / "P.O. Box" — never break after a known abbreviation
//  - never break when the next word is lowercase (mid-sentence period)
export function splitSentences(text) {
  const s = (typeof text === "string" ? text : "").trim();
  if (!s) return [];
  const out = [];
  let buf = "";
  const tokens = s.split(/(\s+)/);
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    buf += tok;
    if (!/[.!?]["')]?$/.test(tok)) continue;
    const bare = tok.replace(/["')\]]+$/, "").replace(/[.!?]+$/, "").toLowerCase();
    if (/^[a-z]$/i.test(bare)) continue;              // "E." in 5025 E. Washington
    if (ABBREV.has(bare)) continue;                    // "Ste." "P.O." "St."
    const next = tokens[i + 2];                        // i+1 is whitespace
    if (next && !/^["'(]?[A-Z0-9]/.test(next)) continue; // next word is lowercase
    out.push(buf.trim());
    buf = "";
  }
  if (buf.trim()) out.push(buf.trim());
  return out.filter(Boolean);
}

function sentenceMemoReasons(sentence) {
  const reasons = [];
  for (const [re, why] of MEMO_PATTERNS) if (re.test(sentence)) reasons.push(why);
  return reasons;
}

// Returns { ok, reasons[] } — the gate. `ok:false` means this text may not be
// published as-is.
export function checkPublicDescription(text) {
  const sentences = splitSentences(text);
  if (!sentences.length) return { ok: true, reasons: [] };
  const reasons = new Set();
  for (const s of sentences) for (const r of sentenceMemoReasons(s)) reasons.add(r);
  return { ok: reasons.size === 0, reasons: [...reasons] };
}

export function isOperatorNote(text) {
  return !checkPublicDescription(text).ok;
}

// The repair. Separates one mixed field into the two fields it should always
// have been: what a person reads, and what the pipeline remembers.
export function splitPublicDescription(text) {
  const sentences = splitSentences(text);
  const publicParts = [];
  const notesParts = [];
  const reasons = new Set();
  for (const s of sentences) {
    const r = sentenceMemoReasons(s);
    if (r.length) {
      notesParts.push(s);
      for (const x of r) reasons.add(x);
    } else {
      publicParts.push(s);
    }
  }
  return {
    description: publicParts.join(" ").trim() || null,
    internalNotes: notesParts.join(" ").trim() || null,
    reasons: [...reasons],
    movedSentences: notesParts.length,
    keptSentences: publicParts.length,
  };
}
