/**
 * Convert Date to ISO date string (YYYY-MM-DD)
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0] || '';
}

/**
 * Parse ISO date string to Date
 */
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Month is 0-indexed in JS Date
  return new Date(year!, month! - 1, day);
}

/**
 * Get start of week (Monday)
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust to Monday (1) being start.
  // If Sunday (0), we go back 6 days. If Monday (1), we go back 0.
  // diff = date - day + (day == 0 ? -6:1);
  // Standard JS: Sunday is 0.
  // We want Monday as 0 index logic for "start of week" relative to previous Monday.

  // Logic:
  // Mon (1) -> diff 0.
  // Tue (2) -> diff -1.
  // Sun (0) -> diff -6.

  // User provided logic: const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  // Let's verify:
  // if today is Mon 9th. day=1. diff = 9 - 1 + 1 = 9. Correct.
  // if today is Tue 10th. day=2. diff = 10 - 2 + 1 = 9. Correct.
  // if today is Sun 15th. day=0. diff = 15 - 0 + (-6) = 9. Correct.

  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get weekday name from Date
 */
export function getWeekdayName(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()]!;
}
