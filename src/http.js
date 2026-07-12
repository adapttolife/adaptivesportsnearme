// Shared response helper — one place for API response headers.
export function json(obj, status = 200, cache = "no-store") {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": cache },
  });
}

// Non-JSON response helper (XML/ICS/HTML) — json() covers /api/*, this covers
// everything else (feeds, server-rendered pages).
export function text(body, status = 200, contentType = "text/plain; charset=utf-8", cache = "no-store") {
  return new Response(body, {
    status,
    headers: { "Content-Type": contentType, "Cache-Control": cache },
  });
}
