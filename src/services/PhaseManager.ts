import { PHASE_CONFIG } from '../constants/phases';
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
      this.userLocation = { latitude, longitude, timezone };
      this.isInitialized = true;
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
  /**
   * Convert Roman hours to Wu Xing phases by grouping contiguous blocks.
   */
  private mapHoursToPhases(romanHours: RomanHour[]): WuXingPhase[] {
    const phases: WuXingPhase[] = [];
    if (romanHours.length === 0) return phases;

    // Helper to find phase name for a given hour
    const getPhaseName = (hour: number): keyof typeof PHASE_CONFIG | null => {
      for (const [name, config] of Object.entries(PHASE_CONFIG)) {
        if (config.romanHours.includes(hour)) return name;
      }
      return null;
    };

    let currentPhaseName: keyof typeof PHASE_CONFIG | null = null;
    let currentBlock: RomanHour[] = [];

    // Iterate sorted hours (0..23)
    for (const rh of romanHours) {
      const phaseName = getPhaseName(rh.hour);
      if (!phaseName) continue;

      if (phaseName !== currentPhaseName) {
        // Close previous block
        if (currentPhaseName && currentBlock.length > 0) {
          this.pushPhaseBlock(phases, currentPhaseName, currentBlock);
        }
        // Start new block
        currentPhaseName = phaseName;
        currentBlock = [rh];
      } else {
        // Continue block
        currentBlock.push(rh);
      }
    }

    // Close final block
    if (currentPhaseName && currentBlock.length > 0) {
      this.pushPhaseBlock(phases, currentPhaseName, currentBlock);
    }

    return phases;
  }

  private pushPhaseBlock(
    phases: WuXingPhase[],
    name: keyof typeof PHASE_CONFIG,
    block: RomanHour[]
  ): void {
    const config = PHASE_CONFIG[name];
    if (!config) return;

    const first = block[0];
    const last = block[block.length - 1];

    if (!first || !last) return;

    phases.push({
      name: name as WuXingPhase['name'],
      startTime: first.startTime,
      endTime: last.endTime,
      color: config.color,
      romanHours: block.map(h => h.hour),
      qualities: config.qualities,
      idealTasks: config.idealTasks,
    });
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
   * Calculate phases for a continuous Gregorian day (00:00 to 23:59).
   * Stitches phases from the previous day's cycle (covering early morning)
   * and current day's cycle.
   */
  getPhasesForGregorianDate(date: Date): WuXingPhase[] {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // 1. Get phases for "Yesterday" (Solar)
      // yesterday's solar cycle: Sunrise(Yesterday) -> Sunrise(Today)
      // This covers the period from 00:00 Today until Sunrise Today.
      const yesterday = new Date(date);
      yesterday.setDate(date.getDate() - 1);
      const phasesYesterday = this.calculatePhasesForDate(yesterday);

      // 2. Get phases for "Today" (Solar)
      // today's solar cycle: Sunrise(Today) -> Sunrise(Tomorrow)
      const phasesToday = this.calculatePhasesForDate(date);

      // 3. Combine and Filter
      // We want parts of phases that overlap with [00:00, 23:59] of input date.
      const allPhases = [...phasesYesterday, ...phasesToday];
      const result: WuXingPhase[] = [];

      for (const p of allPhases) {
        // Find intersection of Phase [p.start, p.end] and Day [startOfDay, endOfDay]
        const rangeStart = p.startTime < startOfDay ? startOfDay : p.startTime;
        const rangeEnd = p.endTime > endOfDay ? endOfDay : p.endTime;

        if (rangeStart < rangeEnd) {
          result.push({
            ...p,
            startTime: rangeStart,
            endTime: rangeEnd,
          });
        }
      }

      // Sort by start time just in case
      result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      // Merge adjacent phases with same name
      const merged: WuXingPhase[] = [];
      for (const p of result) {
        if (merged.length === 0) {
          merged.push(p);
          continue;
        }

        const last = merged[merged.length - 1];
        if (!last) continue; // Should not happen given check above

        if (last.name === p.name) {
          // Extend last phase
          last.endTime = p.endTime > last.endTime ? p.endTime : last.endTime;
          // Merge roman hours (dedupe?)
          last.romanHours = [...new Set([...last.romanHours, ...p.romanHours])];
          // Keep other props from last (color, etc are same)
        } else {
          merged.push(p);
        }
      }

      return merged;
    } catch (error) {
      console.error('❌ Error calculating Gregorian phases:', error);
      return [];
    }
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
