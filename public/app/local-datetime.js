// A datetime-local input has no timezone. The value is wall-clock time in the
// viewer's zone. Stored event times are UTC ISO instants ("2026-11-01T15:00:00.000Z").
// Slicing that text to 16 characters drops the Z, and the browser then reads
// 15:00 as local time, which moves the instant by the viewer's offset on save.
const pad = (number, width = 2) => String(number).padStart(width, "0");

/** UTC instant → the datetime-local value the viewer should see. */
export function toDateTimeLocal(value) {
  if (value == null || value === "") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const wall = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  const ms = date.getMilliseconds();
  return ms ? `${wall}.${pad(ms, 3)}` : wall;
}

/**
 * datetime-local value → UTC ISO with Z.
 * When the instant is unchanged, the original stored text is returned so a
 * load-then-save keeps starts_at and ends_at byte for byte.
 */
export function fromDateTimeLocal(value, original = "") {
  if (value == null || String(value).trim() === "") return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  if (original != null && String(original).trim() !== "") {
    const prior = new Date(original);
    if (!Number.isNaN(prior.getTime()) && prior.getTime() === parsed.getTime()) return String(original);
  }
  return parsed.toISOString();
}
