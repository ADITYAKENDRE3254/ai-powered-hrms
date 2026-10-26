/**
 * IST (Indian Standard Time) timezone utilities.
 * Always display times in Asia/Kolkata (GMT+5:30) regardless of where the server or browser is.
 *
 * KEY RULE: If the API returns a datetime string with NO timezone indicator (no Z, no +05:30),
 * JavaScript treats it as LOCAL time — which breaks display. We force-treat all such strings
 * as UTC, then convert to IST for display. This correctly handles both:
 *   - Old records stored as raw UTC:  "2026-10-26T16:41:00" → treat as UTC → show 10:11 PM IST ✅
 *   - New records with offset:        "2026-10-26T22:11:00+05:30" → already correct → show 10:11 PM IST ✅
 */

export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Normalize a datetime string so JavaScript parses it as UTC (not local time).
 * If the string already has Z or a +/- offset, leave it alone.
 * If it has no timezone info, append 'Z' to force UTC interpretation.
 */
function asUTC(dateStr: string): string {
  // Already has timezone: Z at end, or +HH:MM / -HH:MM at end
  if (/Z$/.test(dateStr) || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  // No timezone → treat as UTC
  return dateStr + 'Z';
}

/** Format a stored UTC or ISO timestamp as a time string in IST. e.g. "10:11 PM" */
export function toISTTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(asUTC(dateStr)).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: IST_TIMEZONE,
  });
}

/** Format a stored UTC or ISO timestamp as a date string in IST. e.g. "26 Oct 2026" */
export function toISTDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(asUTC(dateStr)).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: IST_TIMEZONE,
  });
}

/** Format a stored UTC or ISO timestamp as date + time in IST. e.g. "26 Oct, 10:11 PM" */
export function toISTDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(asUTC(dateStr)).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: IST_TIMEZONE,
  });
}

/** Format a live Date object (e.g. from setInterval) as a time string in IST. */
export function liveISTTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: IST_TIMEZONE,
  });
}
