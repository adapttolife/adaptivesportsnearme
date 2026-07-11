// Deterministic page extractors — pure functions over HTML strings so every one of them
// runs under `node --test` with vendored fixtures (this is why the pipeline does NOT use
// HTMLRewriter: workerd-only APIs can't be golden-tested off-platform).
// Implemented by Spec 72 T03. Contracts:
//
//   extractJsonLd(html)              -> object[]   parsed application/ld+json blocks
//                                       (malformed JSON skipped silently — fail soft;
//                                       @graph arrays flattened)
//   extractEmails(html)              -> string[]   deduped, lowercased, junk-filtered
//                                       (asset filenames, sentry/wixpress noise excluded)
//   extractPhones(html)              -> string[]   US formats, trimmed
//   extractAddress(html)             -> {city, state, zip} | null  ("City, ST 12345" or
//                                       JSON-LD PostalAddress — JSON-LD wins on conflict)
//   extractContactLinks(html, base)  -> string[]   absolute same-host URLs whose path or
//                                       anchor text says contact/about (max 3)
//   extractContacts(html, base)      -> {emails, phones, address, jsonld, contactLinks}
//                                       one-call aggregate of everything above

const STATE_ABBR = "AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|PR|GU|VI|AS|MP";
const ADDR_RE = new RegExp(`([A-Z][A-Za-z .'-]{2,30}),\\s*(${STATE_ABBR})[\\s,]+(\\d{5})(?:-\\d{4})?`);

const ASSET_EXT_RE = /\.(png|jpe?g|gif|svg|webp|ico|css|js|woff2?|ttf|eot|pdf|mp4|mp3)$/i;
const EMAIL_JUNK_RE = /(example\.|sentry|wixpress|@2x)/i;
const CONTACT_LINK_RE = /contact|about|get.?involved|connect/i;

// Strip <script>/<style> content (and everything else that isn't page text) so the
// "visible text" regex passes never see JSON-LD payloads, inline JS, or CSS as prose.
function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

// Decode &#NN; / &#xHH; / &amp; entities, then best-effort percent-decode. Used for
// mailto:/tel: href values, which sites encode inconsistently (entity OR percent OR both).
function decodeHrefValue(raw) {
  let s = raw
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&amp;/gi, "&");
  try {
    s = decodeURIComponent(s);
  } catch {
    // malformed % sequence — keep the entity-decoded form rather than throw
  }
  return s.trim();
}

function isJunkEmail(email) {
  return ASSET_EXT_RE.test(email) || EMAIL_JUNK_RE.test(email);
}

function normalizeTel(raw) {
  const decoded = decodeHrefValue(raw.split("?")[0]);
  return decoded.replace(/[^\d+xX]/g, "");
}

// Recursively flattens @graph arrays (and bare top-level arrays of nodes) into a flat
// list of plain objects. The @graph wrapper itself (no @type of its own, just context +
// graph) is never included — only its members are.
function flattenNode(node, out) {
  if (Array.isArray(node)) {
    for (const item of node) flattenNode(item, out);
    return;
  }
  if (node && typeof node === "object") {
    if (Array.isArray(node["@graph"])) {
      for (const item of node["@graph"]) flattenNode(item, out);
      return;
    }
    out.push(node);
  }
}

export function extractJsonLd(html) {
  const out = [];
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRe.exec(html)) !== null) {
    const attrs = m[1];
    if (!/type\s*=\s*["']?application\/ld\+json["']?/i.test(attrs)) continue;
    const content = m[2].trim();
    if (!content) continue;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      continue; // malformed JSON-LD — skip silently, fail soft
    }
    flattenNode(parsed, out);
  }
  return out;
}

export function extractEmails(html) {
  const found = [];

  const mailtoRe = /href\s*=\s*(["'])mailto:([^"']*)\1/gi;
  let m;
  while ((m = mailtoRe.exec(html)) !== null) {
    const addr = decodeHrefValue(m[2].split("?")[0]);
    if (addr) found.push(addr);
  }

  const text = stripTags(html);
  const textMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  found.push(...textMatches);

  const seen = new Set();
  const out = [];
  for (const raw of found) {
    const email = raw.toLowerCase();
    if (seen.has(email) || isJunkEmail(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}

export function extractPhones(html) {
  const found = [];

  const telRe = /href\s*=\s*(["'])tel:([^"']*)\1/gi;
  let m;
  while ((m = telRe.exec(html)) !== null) {
    const norm = normalizeTel(m[2]);
    if (norm) found.push(norm);
  }

  const text = stripTags(html);
  const textMatches = (text.match(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g) || [])
    .map((p) => p.trim());
  found.push(...textMatches);

  const seen = new Set();
  const out = [];
  for (const p of found) {
    if (seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  return out;
}

export function extractAddress(html) {
  const jsonld = extractJsonLd(html);
  for (const obj of jsonld) {
    const candidates = [obj, obj && obj.address].filter((c) => c && typeof c === "object");
    for (const c of candidates) {
      if (c.addressLocality || c.addressRegion || c.postalCode) {
        return {
          city: c.addressLocality ?? null,
          state: c.addressRegion ?? null,
          zip: c.postalCode ?? null,
        };
      }
    }
  }

  const text = stripTags(html);
  const m = text.match(ADDR_RE);
  if (m) {
    return { city: m[1].trim(), state: m[2], zip: m[3] };
  }
  return null;
}

export function extractContactLinks(html, baseUrl) {
  let base;
  try {
    base = new URL(baseUrl);
  } catch {
    return [];
  }

  const anchorRe = /<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  const out = [];
  const seen = new Set();
  let m;
  while ((m = anchorRe.exec(html)) !== null) {
    if (out.length >= 3) break;
    const href = m[2].trim();
    if (!href) continue;
    if (/^(mailto:|tel:|#|javascript:)/i.test(href)) continue;
    const text = stripTags(m[3]).trim();
    if (!CONTACT_LINK_RE.test(href) && !CONTACT_LINK_RE.test(text)) continue;

    let abs;
    try {
      abs = new URL(href, base);
    } catch {
      continue;
    }
    if (abs.hostname !== base.hostname) continue;
    if (abs.protocol !== "http:" && abs.protocol !== "https:") continue;

    const key = abs.href;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(abs.href);
  }
  return out;
}

export function extractContacts(html, baseUrl) {
  return {
    emails: extractEmails(html),
    phones: extractPhones(html),
    address: extractAddress(html),
    jsonld: extractJsonLd(html),
    contactLinks: extractContactLinks(html, baseUrl),
  };
}
