const CACHE_MS = 15_000;
const cache = new WeakMap();

export async function maintenanceModeEnabled(db) {
  if (!db) return false;
  const cached = cache.get(db);
  if (cached && cached.expiresAt > Date.now()) return cached.enabled;

  let enabled = false;
  try {
    const setting = await db
      .prepare("SELECT value FROM site_settings WHERE key = 'maintenance_mode'")
      .first();
    enabled = ["1", "true"].includes(String(setting?.value || "").toLowerCase());
  } catch {
    enabled = false;
  }

  cache.set(db, { enabled, expiresAt: Date.now() + CACHE_MS });
  return enabled;
}

export function clearMaintenanceModeCache(db) {
  if (db) cache.delete(db);
}
