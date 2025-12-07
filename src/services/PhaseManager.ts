import { calculateRomanHours as calculateRomanHoursUtil } from '../utils/sunTimeUtils';

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

// Default location (Amsterdam) for fallback
const DEFAULT_LOCATION = {
  latitude: 52.3676,
  longitude: 4.9041,
  timezone: 'Europe/Amsterdam',
};

class PhaseManager {
  private userLocation: { latitude: number; longitude: number; timezone: string } | null = null;
  private isInitialized = false;

  /**
   * Initialize PhaseManager with user location
   */
  initialize(latitude: number, longitude: number, timezone: string): void {
    try {
      this.userLocation = { latitude, longitude, timezone };
      this.isInitialized = true;
      // console.log(
      // `✅ PhaseManager initialized: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}, ${timezone}`
      // );
    } catch (error) {
      console.error('❌ PhaseManager initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check if PhaseManager is initialized
   */
  getInitializationStatus(): {
    isInitialized: boolean;
    location: { latitude: number; longitude: number; timezone: string } | null;
  } {
    return {
      isInitialized: this.isInitialized,
      location: this.userLocation,
    };
  }

  /**
   * Ensure location is set, use defaults if needed
   */
  private ensureLocation(): { latitude: number; longitude: number; timezone: string } {
    if (!this.userLocation) {
      console.warn(
        `⚠️  PhaseManager not initialized. Using default location (${DEFAULT_LOCATION.latitude}, ${DEFAULT_LOCATION.longitude})`
      );
      return DEFAULT_LOCATION;
    }
    return this.userLocation;
  }

  /**
   * Calculate Roman hours (0-23) based on solar times.
   * 0-11: Daylight hours (sunrise to sunset divided by 12)
   * 12-23: Night hours (sunset to next sunrise divided by 12)
   */
  private calculateRomanHours(date: Date): RomanHour[] {
    const location = this.ensureLocation();
    const { latitude, longitude } = location;
    return calculateRomanHoursUtil(date, latitude, longitude);
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
  calculatePhasesForDate(date: Date): WuXingPhase[] {
    try {
      const romanHours = this.calculateRomanHours(date);
      return this.mapHoursToPhases(romanHours);
    } catch (error) {
      console.error('❌ Error calculating phases for date:', error);
      throw error;
    }
  }

  /**
   * Get today's phases and determine current phase.
   */
  calculateTodayPhases(): WuXingPhase[] {
    return this.calculatePhasesForDate(new Date());
  }

  /**
   * Get current phase based on current time.
   */
  getCurrentPhase(): WuXingPhase {
    try {
      const phases = this.calculateTodayPhases();
      const now = new Date();

      const currentPhase = phases.find(p => now >= p.startTime && now < p.endTime);

      if (currentPhase) return currentPhase;

      // Fallback to last phase if nothing found
      const lastPhase = phases[phases.length - 1];
      if (lastPhase) {
        // console.warn(
        // `⚠️  Current time not in any phase range. Using last phase: ${lastPhase.name}`
        // );
        return lastPhase;
      }

      throw new Error('No phases calculated');
    } catch (error) {
      console.error('❌ Error getting current phase:', error);
      throw error;
    }
  }
}

export const phaseManager = new PhaseManager();
