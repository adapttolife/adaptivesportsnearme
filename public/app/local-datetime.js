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
  const text = String(value).trim();
  const stored = original == null ? "" : String(original);
  // Compare the field text to the wall time we would display before parsing.
  // On the DST fall-back hour the same digits name two instants, and Date
  // picks the earlier one, which would move 06:30Z to 05:30Z on an unchanged save.
  if (stored.trim() !== "") {
    const shown = toDateTimeLocal(stored);
    // Browsers omit :00 seconds. A minute-only value is unchanged only then.
    // :45 shown as 11:30 must become :00, not the stored :45.
    if (shown && (text === shown || (/:00$/.test(shown) && text === shown.slice(0, 16)))) return stored;
  }
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return "";
  let chosen = parsed;
  if (stored.trim() !== "") {
    const prior = new Date(stored);
    if (!Number.isNaN(prior.getTime())) {
      // Date picks the earlier instant of a repeated wall time. The repeat is
      // an hour in New York and 30 minutes on Lord Howe: the offset here minus
      // the offset a few hours later. No difference means there is no repeat.
      const ahead = new Date(parsed.getTime() + 3 * 60 * 60 * 1000);
      const shiftMin = parsed.getTimezoneOffset() - ahead.getTimezoneOffset();
      if (shiftMin !== 0) {
        const later = new Date(parsed.getTime() - shiftMin * 60 * 1000);
        if (toDateTimeLocal(later) === toDateTimeLocal(parsed) && Math.abs(later.getTime() - prior.getTime()) < Math.abs(parsed.getTime() - prior.getTime())) {
          chosen = later;
        }
      }
      if (prior.getTime() === chosen.getTime()) return stored;
    }
  }
  return chosen.toISOString();
}
