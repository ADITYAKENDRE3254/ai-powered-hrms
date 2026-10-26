/**
 * IST (Indian Standard Time) timezone utilities.
 * Always display times in Asia/Kolkata (GMT+5:30) regardless of where the server or browser is.
 */

export const IST_TIMEZONE = 'Asia/Kolkata';

/** Format a stored UTC or ISO timestamp as a time string in IST. e.g. "09:49 PM" */
export function toISTTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: IST_TIMEZONE,
  });
}

/** Format a stored UTC or ISO timestamp as a date string in IST. e.g. "26 Oct 2026" */
export function toISTDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: IST_TIMEZONE,
  });
}

/** Format a stored UTC or ISO timestamp as date + time in IST. e.g. "26 Oct, 09:49 PM" */
export function toISTDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-IN', {
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
