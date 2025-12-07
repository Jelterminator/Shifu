import SunCalc from 'suncalc';

export interface RomanHour {
  hour: number;
  startTime: Date;
  endTime: Date;
}

export interface WuXingPhase {
  name: 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER';
  startTime: Date;
  endTime: Date;
  color: string;
  romanHours: number[];
  qualities: string;
  idealTasks: string[];
}

const PHASE_MAP = {
  WOOD: {
    color: '#4A7C59',
    romanHours: [21, 22, 23, 0, 1],
    qualities: 'Growth, Planning, Vitality. Spiritual centering & movement.',
    idealTasks: ['spiritual', 'planning', 'movement'],
  },
  FIRE: {
    color: '#E63946',
    romanHours: [2, 3, 4, 5, 6],
    qualities: 'Peak energy, expression. Deep work & execution.',
    idealTasks: ['deep_work', 'creative', 'pomodoro'],
  },
  EARTH: {
    color: '#C49551',
    romanHours: [7, 8],
    qualities: 'Stability, nourishment. Lunch & restoration.',
    idealTasks: ['rest', 'integration', 'light_tasks'],
  },
  METAL: {
    color: '#A8AAAD',
    romanHours: [9, 10, 11, 12],
    qualities: 'Precision, organization. Admin & review.',
    idealTasks: ['admin', 'planning', 'study'],
  },
  WATER: {
    color: '#457B9D',
    romanHours: [13, 14, 15, 16, 17, 18, 19, 20],
    qualities: 'Rest, consolidation. Wind-down & recovery.',
    idealTasks: ['rest', 'reflection', 'recovery'],
  },
};

class PhaseManager {
  private userLocation: { latitude: number; longitude: number; timezone: string } | null = null;

  async initialize(latitude: number, longitude: number, timezone: string) {
    this.userLocation = { latitude, longitude, timezone };
  }

  /**
   * Calculate Roman hours (0-23) based on solar times.
   * 0-11: Daylight hours (sunrise to sunset divided by 12)
   * 12-23: Night hours (sunset to next sunrise divided by 12)
   */
  private async calculateRomanHours(date: Date): Promise<RomanHour[]> {
    if (!this.userLocation) throw new Error('Location not initialized');

    const { latitude, longitude } = this.userLocation;

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
  }

  /**
   * Convert Roman hours to Wu Xing phases.
   */
  private mapHoursToPhases(romanHours: RomanHour[]): WuXingPhase[] {
    const phases: WuXingPhase[] = [];

    for (const [phaseName, config] of Object.entries(PHASE_MAP)) {
      const phaseHours = romanHours.filter(rh => config.romanHours.includes(rh.hour));

      if (phaseHours.length === 0) continue;

      const firstHour = phaseHours[0];
      const lastHour = phaseHours[phaseHours.length - 1];

      if (!firstHour || !lastHour) continue;

      // Determine phase start and end times
      let startTime = firstHour.startTime;
      let endTime = lastHour.endTime;

      // Special handling for WOOD wraparound (21-23 then 0-2)
      if (
        phaseName === 'WOOD' &&
        config.romanHours.some(h => h >= 21) &&
        config.romanHours.some(h => h <= 2)
      ) {
        const nightHours = phaseHours.filter(rh => rh.hour >= 21);
        const dayHours = phaseHours.filter(rh => rh.hour <= 2);
        
        const firstNight = nightHours[0];
        const lastDay = dayHours[dayHours.length - 1];

        if (firstNight && lastDay) {
          startTime = firstNight.startTime;
          endTime = lastDay.endTime;
        }
      }

      phases.push({
        name: phaseName as keyof typeof PHASE_MAP,
        startTime,
        endTime,
        color: config.color,
        romanHours: config.romanHours,
        qualities: config.qualities,
        idealTasks: config.idealTasks,
      });
    }

    return phases;
  }

  /**
   * Calculate Wu Xing phases for a given date.
   */
  async calculatePhasesForDate(date: Date): Promise<WuXingPhase[]> {
    const romanHours = await this.calculateRomanHours(date);
    return this.mapHoursToPhases(romanHours);
  }

  /**
   * Get today's phases and determine current phase.
   */
  async calculateTodayPhases(): Promise<WuXingPhase[]> {
    return this.calculatePhasesForDate(new Date());
  }

  /**
   * Get current phase based on current time.
   */
  async getCurrentPhase(): Promise<WuXingPhase> {
    const phases = await this.calculateTodayPhases();
    const now = new Date();

    const currentPhase = phases.find(p => now >= p.startTime && now < p.endTime);
    
    if (currentPhase) return currentPhase;
    
    // Fallback to last phase if nothing found (shouldn't happen with correct coverage)
    const lastPhase = phases[phases.length - 1];
    if (lastPhase) return lastPhase;
    
    // Absolute fallback if phases are somehow empty (e.g. location not init)
    throw new Error('Could not calculate current phase');
  }
}

export const phaseManager = new PhaseManager();
