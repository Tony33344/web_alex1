/**
 * Parse a leading day count from a duration string, e.g. "2 days", "2-days", "1day".
 * Returns number of days, or null if no leading digit is present.
 */
export function parseDurationDays(duration: string | null | undefined): number | null {
  if (!duration) return null;
  const m = duration.match(/^\s*(\d+)\s*-?\s*(?:day|d)/i);
  if (m) return parseInt(m[1], 10);
  const first = duration.match(/^\s*(\d+)/);
  return first ? parseInt(first[1], 10) : null;
}

/**
 * Compute end date from start date + number of days (inclusive).
 * e.g. start=2026-05-18, days=2 -> 2026-05-19 (2 days = 18 & 19).
 */
export function computeEndDate(start: Date | string, days: number): Date {
  const d = new Date(start);
  d.setDate(d.getDate() + Math.max(0, days - 1));
  return d;
}

/**
 * Format a human-readable date range.
 *  - Same month:  "18–19 May 2026"
 *  - Same year:   "30 May – 2 June 2026"
 *  - Different:   "30 Dec 2025 – 2 Jan 2026"
 *  - No end:      single date
 */
export function formatDateRange(
  start: Date | string,
  end: Date | string | null | undefined,
  locale: string,
): string {
  const s = new Date(start);
  if (!end) return s.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) {
    return s.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  }
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const sameYear = s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    const monthYear = s.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    return `${s.getDate()}–${e.getDate()} ${monthYear}`;
  }
  if (sameYear) {
    return `${s.toLocaleDateString(locale, { day: 'numeric', month: 'long' })} – ${e.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  }
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return `${s.toLocaleDateString(locale, opts)} – ${e.toLocaleDateString(locale, opts)}`;
}

/**
 * Format a date range with time (hours).
 *  - Same day: "18 May 2026, 09:00–17:00"
 *  - Different: "18 May 2026, 09:00 – 19 May 2026, 17:00"
 *  - No end: single date with time
 */
export function formatDateRangeWithTime(
  start: Date | string,
  end: Date | string | null | undefined,
  locale: string,
): string {
  const s = new Date(start);
  const startTime = s.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  
  if (!end) {
    return `${s.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}, ${startTime}`;
  }
  
  const e = new Date(end);
  const endTime = e.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  
  if (s.toDateString() === e.toDateString()) {
    return `${s.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}, ${startTime}–${endTime}`;
  }
  
  return `${s.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}, ${startTime} – ${e.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}, ${endTime}`;
}
