// A per-address limit on sign-in links, on top of the per-IP form limiter.
// Without it anyone could make us mail one address over and over from many IPs.
// It counts the links already issued to that address, read from the token
// table each sign-in kind already writes, so it needs no new table.
export const LINKS_PER_WINDOW = 3;
export const WINDOW_MINUTES = 15;

const TABLES = {
  admin: "admin_login_tokens",
  beta: "beta_login_tokens",
  organization: "organization_login_tokens",
  profile: "profile_login_tokens",
};

// True when this address already has LINKS_PER_WINDOW links from the last
// WINDOW_MINUTES. Fails open on a read error: the per-IP limiter still applies,
// and nobody should be locked out of signing in by a counting fault.
export async function signInLinkLimited(db, kind, email, now = Date.now()) {
  const table = TABLES[kind];
  if (!table) throw new Error("Unknown sign-in kind");
  try {
    const since = new Date(now - WINDOW_MINUTES * 60_000).toISOString();
    const row = await db
      .prepare(
        `SELECT COUNT(*) AS n FROM ${table} WHERE email = ? COLLATE NOCASE AND created_at > ?`,
      )
      .bind(String(email).toLowerCase(), since)
      .first();
    return Number(row?.n || 0) >= LINKS_PER_WINDOW;
  } catch (err) {
    console.error("sign-in limit check failed", {
      kind,
      reason: String(err?.message || "").slice(0, 80),
    });
    return false;
  }
}

export const SIGN_IN_LIMITED_MESSAGE = `We've sent a few sign-in links to that address already. Use the newest one, or try again in ${WINDOW_MINUTES} minutes.`;
