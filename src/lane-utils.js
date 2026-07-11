// Shared lane plumbing. Every lane PROPOSES into review_queue via proposeStmt and
// records evidence; the only direct organization writes anywhere in the pipeline are
// the two documented evidence columns (last_ok_at, last_checked_at) in validate.

export const UA = "ASNM-Bot/1.0 (+https://adaptivesportsnearme.com/methodology)";

// One query: which of these orgs already have a pending item in this lane?
export async function pendingOrgIds(db, lane, ids) {
  if (!ids.length) return new Set();
  const marks = ids.map(() => "?").join(",");
  const { results } = await db.prepare(
    `SELECT DISTINCT organization_id FROM review_queue
     WHERE lane = ? AND status = 'pending' AND organization_id IN (${marks})`
  ).bind(lane, ...ids).all();
  return new Set(results.map((r) => r.organization_id));
}

export function proposeStmt(db, orgId, lane, change, evidence, confidence, now) {
  return db.prepare(
    `INSERT INTO review_queue (organization_id, lane, proposed_change, evidence, confidence, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`
  ).bind(orgId, lane, JSON.stringify(change), JSON.stringify(evidence), confidence, now);
}

// Liveness probe. HEAD first, GET fallback for servers that reject HEAD.
// fatal=true means WE ran out of platform budget — the caller must record nothing false.
export async function checkUrl(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": UA },
      });
      if (method === "HEAD" && (res.status === 405 || res.status === 403 || res.status >= 500)) continue;
      return { ok: res.status < 400, status: res.status, detail: res.ok ? null : `HTTP ${res.status}` };
    } catch (err) {
      const msg = String(err?.message || err);
      if (/too many subrequests/i.test(msg)) return { fatal: true };
      if (method === "GET") return { ok: false, status: null, detail: msg.slice(0, 200) };
    }
  }
  return { ok: false, status: null, detail: "unreachable" };
}

// Polite page fetch for extraction lanes. Returns null on any failure (fail soft);
// {fatal:true} on subrequest exhaustion so lanes can stop without recording falsehoods.
export async function fetchText(url, cap = 300000) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": UA },
    });
    if (!res.ok) return null;
    return { text: (await res.text()).slice(0, cap), finalUrl: res.url };
  } catch (err) {
    if (/too many subrequests/i.test(String(err?.message || err))) return { fatal: true };
    return null;
  }
}
