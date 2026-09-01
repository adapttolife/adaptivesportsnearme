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
  [/\bdo not\b/i, "operator instruction"],
  [/\bnone invented\b|\(invented names?\)/i, "negative-space note"],
  [/\bsame legal org\b/i, "internal merge note"],
  [/\bfolded\b/i, "internal merge note"],
  [/\bHOLD\b/, "internal triage marker"],
  [/\b(is|are|was|were)\s+past\b/i, "internal recency triage"],
  [/\bstays? on (this|the) parent\b/i, "internal record-shape note"],
  [/\bstays? on (this|the)\b[^.]*\b(row|parent)\b/i, "internal record-shape note"],
  [/\b(this|the) row\b/i, "internal record-shape note"],
  [/\bthis\s+[\w-]+\s+row\b/i, "internal record-shape note"],
  [/\b(this|the) parent\b/i, "internal record-shape note"],
  [/\bwritten onto\b|\benriches this\b/i, "internal record-shape note"],
  [/\bnot written as\b/i, "internal record-shape note"],
  [/\bnot marked (gone|inactive|dead|active)\b/i, "internal state-decision note"],
  [/\bdoes not print\b/i, "extraction outcome"],
  [/\b(listing|row|org) kept\b|\bkept as stale\b/i, "internal triage note"],
  [/^no\b[^.]*\bstored\b/i, "extraction outcome"],
  [/\bpages? opened\b/i, "extraction outcome"],
  [/^[\w\s&/'-]{0,40}\bpages?\.$/i, "source-reference stub"],
  [/\bDNS-dead\b|\bDNS\b/i, "raw DNS diagnostic"],
  [/^no\b[^.]*\b(printed|official pages?)\b/i, "extraction outcome"],
  [/\bprinted on the official\b/i, "extraction outcome"],
  [/\bfolds? into\b|\bfold into\b/i, "internal merge note"],
  [/\bas a (sports )?parent\b/i, "internal record-shape note"],
  [/\bsplit as new parents?\b/i, "internal record-shape note"],
  [/\bnot invented\b/i, "negative-space note"],
  [/\bwithout a printed\b|\breprints?\b/i, "extraction commentary"],
  [/\bare\s+\w+\s+hours\b|\bprinted\s+\w*\s*hours\b/i, "internal field-meaning note"],
  [/\bno official[^.]*\bprinted\b/i, "extraction outcome"],
  [/^(office card|sports desk|volunteer \/ [^:]*inbox)\s*:/i, "internal label"],
  [/(?<![\/\w-])(?=[a-f0-9]*\d)[0-9a-f]{8}(?![\/\w-])/, "bare record id"],
  [/\bthis pass\b/i, "pipeline-run jargon"],
  [/\bnot stored\b/i, "storage decision"],
  [/\bnot printed\b/i, "extraction outcome"],
  [/\bis still (that|the)\b/i, "verification voice"],
  [/\bis still [A-Z][\w'&.-]*,\s*not\b/, "verification voice"],
  [/^\s*official\b/i, "verification voice (leading \"Official\")"],
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
  [/(?<!\/)\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i, "raw record UUID"],
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

// Rules that need more than a pattern.
//
// A sentence opening "Not <Capitalised>" is how the pipeline records "this org
// is not that other org". Measured against the whole corpus in Aug 2026: 364
// such sentences, every one a dedupe note, longest 13 words. Exactly one real
// organisation is named "Not Forgotten Outreach", so the rule is bounded by
// length — a real sentence about that org runs longer than any dedupe note
// ever does, and its own description was memo end to end regardless.
const MEMO_PREDICATES = [
  [
    (sentence) =>
      /^Not\s+[A-Z0-9]/.test(sentence) && sentence.trim().split(/\s+/).length <= 14,
    'dedupe note (sentence opens "Not X")',
  ],
];

function sentenceMemoReasons(sentence) {
  const reasons = [];
  for (const [re, why] of MEMO_PATTERNS) if (re.test(sentence)) reasons.push(why);
  for (const [fn, why] of MEMO_PREDICATES) if (fn(sentence)) reasons.push(why);
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

// ---------------------------------------------------------------------------
// Operator vocabulary.
//
// `cost_note` and `ages` are public too, and they carry the same voice in a
// different shape: "Official cycling $20; mountain biking $40", "Kickball ages
// 5 and older (official). Upper bound not printed." The facts are correct and
// hard-won. Only the vocabulary is wrong, so these are stripped rather than
// moved — deleting the sentence would throw away real prices and real age
// ranges that nobody wants to re-source.

// Sentences (or semicolon clauses) that are purely a report on the extraction
// itself, carrying no fact a reader could use.
const EXTRACTION_OUTCOME = /^[^.;]*\b(not printed|not collapsed|not stored|this pass)\b[^.;]*$/i;

// Asides the pipeline adds to mark provenance.
const OPERATOR_ASIDE =
  /\s*\((?:official[^)]*|unofficial[^)]*|[^)]*\bnot (?:printed|stored|collapsed)\b[^)]*)\)/gi;

export function stripOperatorVocabulary(text) {
  let s = typeof text === "string" ? text : "";
  if (!s.trim()) return "";

  s = s.replace(OPERATOR_ASIDE, "");

  // Drop pure extraction-outcome clauses, keeping the useful ones beside them.
  s = splitSentences(s)
    .map((sentence) => {
      const clauses = sentence.split(/;\s*/).filter((c) => !EXTRACTION_OUTCOME.test(c.trim()));
      return clauses.join("; ").trim();
    })
    .filter((sentence) => sentence && !EXTRACTION_OUTCOME.test(sentence.replace(/[.!?]+$/, "")))
    .join(" ");

  // "Official cycling $20" -> "Cycling $20"; also mid-sentence after a period.
  s = s.replace(/(^|[.!?]\s+)official\s*:?\s+/gi, (m, lead) => lead);
  s = s.replace(/(^|[.!?]\s)(\p{Ll})/gu, (m, lead, ch) => lead + ch.toUpperCase());

  return s.replace(/\s{2,}/g, " ").replace(/\s+([.,;])/g, "$1").trim();
}

// The full repair for any public free-text field: strip the vocabulary first,
// then move whatever is still a memo into internal_notes.
export function repairPublicText(text) {
  const original = typeof text === "string" ? text : "";
  const stripped = stripOperatorVocabulary(original);
  const split = splitPublicDescription(stripped);
  const removedTail = original.trim() && !stripped.trim();
  return {
    value: split.description,
    internalNotes: split.internalNotes || (removedTail ? original.trim() : null),
    changed: (split.description || "") !== original.trim(),
    reasons: split.reasons,
  };
}

// ---------------------------------------------------------------------------
// Navigation labels are not organisations.
//
// A directory scrape walks a site's nav bar as readily as its member list, so
// "Donate", "Our Team" and "Events Calendar" arrived as listings with a URL and
// a data source, indistinguishable in shape from a real program. Eight were
// live on the tester in Aug 2026. A person spots these instantly; the pipeline
// never will, because they are structurally perfect rows.

const NAVIGATION_LABEL =
  /^(volunteer|donate|home|about( us)?|contact( us)?|events?( calendar)?|programs?|news|resources|staff|board|menu|search|log ?in|sign ?in|leadership|sponsors?|partners?|gallery|blog|faq|shop|store|careers?|jobs|press|media|privacy( policy)?|terms|sitemap|calendar|schedule|register|membership|newsletter|subscribe|give|support us|get involved|our team|our story|mission|history|donate now|learn more|read more|click here)\.?$/i;

export function looksLikeNavigationLabel(name) {
  return NAVIGATION_LABEL.test(String(name ?? "").trim());
}
