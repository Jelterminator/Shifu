import { calculateRomanHours, RomanHour } from '../../src/utils/sunTimeUtils';

describe('sunTimeUtils', () => {
  const TEST_DATE = new Date('2023-01-01T12:00:00Z');
  const AMSTERDAM_COORDS = { latitude: 52.3676, longitude: 4.9041 };

  describe('calculateRomanHours', () => {
    it('should return 24 roman hours and handle invalid date', () => {
      const validHours = calculateRomanHours(TEST_DATE, AMSTERDAM_COORDS.latitude, AMSTERDAM_COORDS.longitude);
      expect(validHours).toHaveLength(24);
      expect(validHours.map(h => h.hour)).toEqual(expect.arrayContaining([...Array(24).keys()]));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      // @ts-ignore
      const invalidHours = calculateRomanHours('invalid-date' as any, 0, 0);
      expect(invalidHours).toHaveLength(24);
      consoleSpy.mockRestore();
    });

    it('should handle extreme latitudes gracefully (fallback)', () => {
      const hours = calculateRomanHours(TEST_DATE, 85, 0);
      expect(hours).toHaveLength(24);
    });

    it('should have continuous time ranges', () => {
      const hours = calculateRomanHours(TEST_DATE, AMSTERDAM_COORDS.latitude, AMSTERDAM_COORDS.longitude);
      for (let i = 0; i < hours.length - 1; i++) {
        const current = hours[i] as RomanHour;
        const next = hours[i + 1] as RomanHour;
        const currentEnd = current.endTime.getTime();
        const nextStart = next.startTime.getTime();
        expect(Math.abs(currentEnd - nextStart)).toBeLessThan(1000);
      }
    });
  });
});
