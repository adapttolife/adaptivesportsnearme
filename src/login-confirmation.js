import { parseCookieHeader } from "./profile.js";

export const LOGIN_NONCE_SECONDS = 60 * 15;

export function newLoginNonce() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function serializeLoginNonce(name, nonce) {
  return `${name}=${nonce}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${LOGIN_NONCE_SECONDS}`;
}

export function readLoginNonce(request, name) {
  return parseCookieHeader(request.headers.get("Cookie"), name);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function loginConfirmationHtml({ action, token, title }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title><style>body{margin:0;background:#efe8dc;color:#1a1a1a;font-family:system-ui,sans-serif;display:grid;min-height:100vh;place-items:center}.card{box-sizing:border-box;width:min(92vw,32rem);background:#f9f7f2;border:1px solid #d9d0c2;border-radius:15px;padding:2rem}h1{margin:0 0:.7rem}p{line-height:1.5}button{background:#1a1a1a;color:#f9f7f2;border:0;border-radius:8px;padding:.8rem 1rem;font:inherit;font-weight:700;cursor:pointer}</style></head><body><main class="card"><h1>${escapeHtml(title)}</h1><p>Confirm that you want to sign in on this browser.</p><form method="post" action="${escapeHtml(action)}"><input type="hidden" name="token" value="${escapeHtml(token)}"><button type="submit">Sign in</button></form></main></body></html>`;
}
