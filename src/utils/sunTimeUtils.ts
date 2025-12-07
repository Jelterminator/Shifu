import SunCalc from 'suncalc';

export interface RomanHour {
  hour: number;
  startTime: Date;
  endTime: Date;
}

/**
 * Validate that a date object is valid
 */
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Safely calculate sun times with fallback for edge cases
 */
function getSafeSunTimes(
  date: Date,
  latitude: number,
  longitude: number
): { sunrise: Date; sunset: Date } {
  try {
    const sunData = SunCalc.getTimes(date, latitude, longitude);

    // Validate the sun times
    if (!isValidDate(sunData.sunrise) || !isValidDate(sunData.sunset)) {
      throw new Error('Invalid sun times calculated');
    }

    // Check for extreme latitudes where sun might not rise/set
    if (sunData.sunrise.getTime() === sunData.sunset.getTime()) {
      console.warn('⚠️ Sunrise equals sunset - using fallback times');
      throw new Error('Sun does not rise/set at this location and date');
    }

    return {
      sunrise: sunData.sunrise,
      sunset: sunData.sunset,
    };
  } catch (error) {
    console.warn('⚠️ SunCalc failed, using fallback times:', error);

    // Fallback: Use fixed times based on date
    const fallbackSunrise = new Date(date);
    fallbackSunrise.setHours(6, 0, 0, 0);

    const fallbackSunset = new Date(date);
    fallbackSunset.setHours(18, 0, 0, 0);

    return {
      sunrise: fallbackSunrise,
      sunset: fallbackSunset,
    };
  }
}

/**
 * Calculate Roman hours (0-23) based on solar times.
 * 0-11: Daylight hours (sunrise to sunset divided by 12)
 * 12-23: Night hours (sunset to next sunrise divided by 12)
 */
export const calculateRomanHours = (
  date: Date,
  latitude: number,
  longitude: number
): RomanHour[] => {
  try {
    // Validate inputs
    if (!isValidDate(date)) {
      throw new Error('Invalid date provided');
    }

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      throw new Error('Invalid coordinates provided');
    }

    // Get sun times for current day
    const { sunrise, sunset } = getSafeSunTimes(date, latitude, longitude);

    const romanHours: RomanHour[] = [];

    // Daylight hours: 0-11
    const dayDuration = (sunset.getTime() - sunrise.getTime()) / 12;

    if (dayDuration <= 0) {
      throw new Error('Invalid day duration calculated');
    }

    for (let h = 0; h < 12; h++) {
      romanHours.push({
        hour: h,
        startTime: new Date(sunrise.getTime() + h * dayDuration),
        endTime: new Date(sunrise.getTime() + (h + 1) * dayDuration),
      });
    }

    // Night hours: 12-23
    // Calculate next day's sunrise for accurate night duration
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const { sunrise: nextSunrise } = getSafeSunTimes(nextDay, latitude, longitude);

    const nightDuration = (nextSunrise.getTime() - sunset.getTime()) / 12;

    if (nightDuration <= 0) {
      throw new Error('Invalid night duration calculated');
    }

    for (let h = 12; h < 24; h++) {
      const nightIdx = h - 12;
      romanHours.push({
        hour: h,
        startTime: new Date(sunset.getTime() + nightIdx * nightDuration),
        endTime: new Date(sunset.getTime() + (nightIdx + 1) * nightDuration),
      });
    }

    // Validate all calculated hours
    const hasInvalidHours = romanHours.some(
      rh => !isValidDate(rh.startTime) || !isValidDate(rh.endTime)
    );

    if (hasInvalidHours) {
      throw new Error('Invalid Roman hours calculated');
    }

    return romanHours;
  } catch (error) {
    console.error('❌ Failed to calculate Roman hours:', error);

    // Return fallback Roman hours with equal 1-hour segments
    console.warn('⚠️ Using fallback equal-hour segments');
    return createFallbackRomanHours(date);
  }
};

/**
 * Create fallback Roman hours with equal 1-hour segments
 * Used when solar calculations fail
 */
function createFallbackRomanHours(date: Date): RomanHour[] {
  const romanHours: RomanHour[] = [];
  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);

  for (let h = 0; h < 24; h++) {
    const startTime = new Date(baseDate);
    startTime.setHours(h);

    const endTime = new Date(baseDate);
    endTime.setHours(h + 1);

    romanHours.push({
      hour: h,
      startTime,
      endTime,
    });
  }

  return romanHours;
}
