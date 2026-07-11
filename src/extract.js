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

export function extractJsonLd(html) {
  throw new Error("not implemented — Spec 72 T03");
}

export function extractEmails(html) {
  throw new Error("not implemented — Spec 72 T03");
}

export function extractPhones(html) {
  throw new Error("not implemented — Spec 72 T03");
}

export function extractAddress(html) {
  throw new Error("not implemented — Spec 72 T03");
}

export function extractContactLinks(html, baseUrl) {
  throw new Error("not implemented — Spec 72 T03");
}

export function extractContacts(html, baseUrl) {
  throw new Error("not implemented — Spec 72 T03");
}
