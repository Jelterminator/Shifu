import { getWeekStart, getWeekdayName, parseISODate, toISODate } from '../src/utils/dateHelpers';

describe('dateHelpers', () => {
  it('toISODate should return YYYY-MM-DD', () => {
    const d = new Date('2025-01-01T12:00:00Z');
    expect(toISODate(d)).toBe('2025-01-01');
  });

  it('parseISODate should return correct Date object', () => {
    const d = parseISODate('2025-01-01');
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(0); // Jan is 0
    expect(d.getDate()).toBe(1);
  });

  it('getWeekStart should return previous Monday', () => {
    // 2025-01-01 is Wednesday
    const wed = new Date('2025-01-01T12:00:00');
    getWeekStart(wed); // Should be Mon Dec 29 2024? No wait.
    // Wed Jan 1. Monday of that week is Dec 30 2024.

    // Let's use specific dates.
    // Jan 1 2025 is Wednesday.
    // Jan 6 2025 is Monday.

    const mon = new Date('2025-01-06T10:00:00');
    const startMon = getWeekStart(mon);
    expect(startMon.getDate()).toBe(6);
    expect(startMon.getHours()).toBe(0);

    const sun = new Date('2025-01-12T10:00:00'); // Sunday
    const startSun = getWeekStart(sun);
    // Should be Mon Jan 6
    expect(startSun.getDate()).toBe(6);
  });

  it('getWeekdayName should return lowercased english day', () => {
    const d = new Date('2025-01-01T12:00:00'); // Wednesday
    expect(getWeekdayName(d)).toBe('wednesday');
  });
});
