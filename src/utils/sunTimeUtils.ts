import SunCalc from 'suncalc';

export interface RomanHour {
  hour: number;
  startTime: Date;
  endTime: Date;
}

/**
 * Calculate Roman hours (0-23) based on solar times.
 * 0-11: Daylight hours (sunrise to sunset divided by 12)
 * 12-23: Night hours (sunset to next sunrise divided by 12)
 */
export const calculateRomanHours = (date: Date, latitude: number, longitude: number): RomanHour[] => {
  // Get accurate sun times using suncalc
  const sunData = SunCalc.getTimes(date, latitude, longitude);
  const { sunrise, sunset } = sunData;

  const romanHours: RomanHour[] = [];

  // Daylight hours: 0-11
  const dayDuration = (sunset.getTime() - sunrise.getTime()) / 12;
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
  const nextSunData = SunCalc.getTimes(nextDay, latitude, longitude);
  const nextSunrise = nextSunData.sunrise;

  const nightDuration = (nextSunrise.getTime() - sunset.getTime()) / 12;
  for (let h = 12; h < 24; h++) {
    const nightIdx = h - 12;
    romanHours.push({
      hour: h,
      startTime: new Date(sunset.getTime() + nightIdx * nightDuration),
      endTime: new Date(sunset.getTime() + (nightIdx + 1) * nightDuration),
    });
  }

  return romanHours;
};
