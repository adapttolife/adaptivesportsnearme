// The failure ledger: one `send_failures` row for every email that did not go
// out, or that Resend later reports as bounced, complained or failed.
//
// Same table name and columns as the one the adapt-to-life Worker writes, so a
// single alert query reads both sites. Ours lives in the INTAKE database
// (atl-intake in production, asnm-db-staging on staging): db/intake-schema.sql.
//
// Fail open, always: a broken ledger must never turn a swallowed confirmation
// failure back into a thrown one, or un-save a submission. A missing table or
// binding is logged and ignored.
export async function recordSendFailure(env, route, toAddr, err, id) {
  try {
    if (!env?.INTAKE) return false;
    const result = await env.INTAKE.prepare(
      "INSERT OR IGNORE INTO send_failures (id, ts, route, to_addr, error) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(
        id || crypto.randomUUID(),
        Math.floor(Date.now() / 1000),
        String(route).slice(0, 80),
        String(toAddr || "").slice(0, 320),
        String(err?.message || err || "").slice(0, 2000),
      )
      .run();
    return Number(result?.meta?.changes ?? result?.changes ?? 0) > 0;
  } catch (e) {
    console.error("send_failures insert failed", {
      route,
      reason: String(e?.message || "").slice(0, 120),
    });
    return false;
  }
}
