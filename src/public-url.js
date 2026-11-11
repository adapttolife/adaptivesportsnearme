const MAX_URL_LENGTH = 500;

function ipv4Address(hostname) {
  const parts = hostname.split(".");
  return (
    parts.length === 4 &&
    parts.every(
      (part) =>
        /^\d+$/.test(part) && Number(part) >= 0 && Number(part) <= 255,
    )
  );
}

export function isPublicHostname(hostname) {
  const host = String(hostname || "").toLowerCase().replace(/\.$/, "");
  if (!host || host === "localhost" || host.endsWith(".localhost")) return false;
  if (host.includes(":") || ipv4Address(host)) return false;
  return host.includes(".");
}

export function normalizePublicUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (raw.length > MAX_URL_LENGTH || raw.startsWith("//"))
    throw new Error("url-invalid");
  const suppliedScheme = /^[a-z][a-z\d+.-]*:/i.test(raw);
  let url;
  try {
    url = new URL(suppliedScheme ? raw : `https://${raw}`);
  } catch {
    throw new Error("url-invalid");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    !isPublicHostname(url.hostname)
  )
    throw new Error("url-invalid");
  const normalized = url.toString();
  if (normalized.length > MAX_URL_LENGTH) throw new Error("url-invalid");
  return normalized;
}
