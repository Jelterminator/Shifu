import { RELIGIOUS_PRACTICES } from '../../data/practices';
import { useUserStore } from '../../stores/userStore';
import { storage } from '../../utils/storage';
import { calculateRomanHours } from '../../utils/sunTimeUtils';
import { notificationService } from '../NotificationService';

export interface AnchorEvent {
  id: string;
  type: 'anchor';
  title: string;
  startTime: Date;
  durationMinutes: number;
  dateStr: string;
  description?: string;
  isPractice?: boolean;
}

const ANCHORS_STORAGE_KEY = 'shifu_anchors';
const LAST_CALCULATION_KEY = 'shifu_anchors_last_calc';

class AnchorsService {
  private initialized = false;

  initialize(latitude: number, longitude: number): void {
    try {
      if (!storage) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ AnchorsService: Storage not available, skipping initialization');
        return;
      }

      const lastCalcStr = storage.get(LAST_CALCULATION_KEY);
      const existingAnchors = this.getStoredAnchors();
      const now = new Date();
      let shouldCalculate = false;

      const userStoreState = useUserStore.getState();
      const hasPractices = (userStoreState.user.spiritualPractices || []).length > 0;

      // FIX #2: Refined Logic - Only force calc if:
      // A) Never calculated before (!lastCalcStr)
      // B) We have no anchors BUT we DO have practices selected (implies data loss or previous failed init)
      // This respects the valid "No Anchors Selected" state.
      if (!lastCalcStr || (existingAnchors.length === 0 && hasPractices)) {
        shouldCalculate = true;
      } else {
        const lastCalc = new Date(lastCalcStr);
        const startOfCurrentWeek = this.getStartOfWeek(now);

        // 1. If last calculation was before the start of the current week,
        // we need to refresh to ensure the full current week is available/correct.
        if (lastCalc < startOfCurrentWeek) {
          shouldCalculate = true;
        } else {
          // 2. Saturday Night Logic (Schedule Next Week)
          // If it is Saturday Night (>= 18:00) AND we haven't calculated since Sat 18:00
          // (i.e., we haven't "released" the new batch yet)
          const isSaturday = now.getDay() === 6;
          const isEvening = now.getHours() >= 18;

          if (isSaturday && isEvening) {
            // Check if we already ran the Sat night update
            const satNightStart = new Date(now);
            satNightStart.setHours(18, 0, 0, 0);

            if (lastCalc < satNightStart) {
              shouldCalculate = true;
            }
          }
        }
      }

      if (shouldCalculate) {
        this.calculateAndStoreAnchors(latitude, longitude);
      }

      this.initialized = true;
    } catch (error) {
      this.initialized = false;
    }
  }

  /**
   * Recalculates anchors for the future, preserving the past.
   * CALL THIS when Settings change.
   */
  recalculateFutureAnchors(latitude: number, longitude: number): void {
    try {
      const now = new Date();

      // 1. Generate fresh anchors for the standard window (Current Week + Next Week)
      const freshAnchors = this.generateAnchors(latitude, longitude);

      // 2. Get existing anchors
      const existingAnchors = this.getStoredAnchors();

      // 3. Merge: Keep PAST existing anchors, use FUTURE fresh anchors
      // "The past is the past and remains."
      const pastAnchors = existingAnchors.filter(a => a.startTime <= now);
      const futureAnchors = freshAnchors.filter(a => a.startTime > now);

      const merged = [...pastAnchors, ...futureAnchors];

      // 4. Store
      this.saveAnchors(merged);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ AnchorsService: Failed to recalculate future anchors:', error);
    }
  }

  private calculateAndStoreAnchors(latitude: number, longitude: number): void {
    try {
      const anchors = this.generateAnchors(latitude, longitude);

      // In a standard scheduled calc, we want to ensure retention of the *current* week history
      // if we are mid-week.
      // However, since generateAnchors(startOfWeek) regenerates the WHOLE current week (Mon-Sun)
      // plus the next week, it effectively "refreshes" the current week's schedule.
      // This is acceptable for a background refresh (unlike user settings change where we want strictly fixed past).
      // We will merge with *older* history if needed (e.g., from previous weeks),
      // but strictly adhering to "always want them scheduled in for the entire current week".

      // Let's keep existing anchors that are OLDER than the new generation start date (Last Week or older)
      // just in case we want to scroll back (though user didn't explicitly ask for infinite history).
      // Using startOfWeek as the cutoff.

      const startOfWeek = this.getStartOfWeek(new Date());
      const existingAnchors = this.getStoredAnchors();

      // Keep history strictly before this week
      const historicalAnchors = existingAnchors.filter(a => a.startTime < startOfWeek);

      const merged = [...historicalAnchors, ...anchors];

      this.saveAnchors(merged);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ AnchorsService: Failed to calculate and store anchors:', error);
      throw error;
    }
  }

  private generateAnchors(latitude: number, longitude: number): AnchorEvent[] {
    const anchors: AnchorEvent[] = [];
    const now = new Date();
    const startOfWeek = this.getStartOfWeek(now);

    // Schedule for 14 days from Start of Current Week
    // This covers: Current Week (Mon-Sun) + Next Week (Mon-Sun)
    // This satisfies "entire current week" + "new batch (next week)" availability.
    const DAYS_TO_SCHEDULE = 14;

    const userStoreState = useUserStore.getState();
    const selectedPracticeIds = userStoreState.user.spiritualPractices || [];

    const relevantPractices: {
      id: string;
      name: string;
      romanHour: number;
      durationMinutes: number;
    }[] = [];

    RELIGIOUS_PRACTICES.forEach(tradition => {
      tradition.categories.forEach(category => {
        category.practices.forEach(practice => {
          if (selectedPracticeIds.includes(practice.id)) {
            relevantPractices.push(practice);
          }
        });
      });
    });

    for (let i = 0; i < DAYS_TO_SCHEDULE; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0] || '';

      try {
        const romanHours = calculateRomanHours(date, latitude, longitude);

        for (const practice of relevantPractices) {
          const hourInfo = romanHours.find(rh => rh.hour === practice.romanHour);

          if (hourInfo) {
            anchors.push({
              id: `practice-${dateStr}-${practice.id}`,
              type: 'anchor',
              title: practice.name,
              startTime: hourInfo.startTime,
              durationMinutes: practice.durationMinutes,
              dateStr: dateStr,
              isPractice: true,
            });
          }
        }
      } catch (dayError) {
        // eslint-disable-next-line no-console
        console.warn(`⚠️ Failed to calculate Roman hours for ${dateStr}:`, dayError);
      }
    }
    return anchors;
  }

  private saveAnchors(anchors: AnchorEvent[]): void {
    // Deduplicate by ID just in case
    const map = new Map<string, AnchorEvent>();
    anchors.forEach(a => map.set(a.id, a));
    const unique = Array.from(map.values());

    storage.set(ANCHORS_STORAGE_KEY, JSON.stringify(unique));
    storage.set(LAST_CALCULATION_KEY, new Date().toISOString());

    // Sync notifications for future anchors
    void notificationService.syncAnchorNotifications(unique);
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    // 0 = Sunday, 1 = Monday.
    // If Sunday (0), we want previous Monday (-6 days).
    // If Monday (1), we want Today (-0 days implies setDate... wait).
    // Logic: diff = d.getDate() - day + (day == 0 ? -6 : 1);
    // Tue (2) -> d - 2 + 1 = d - 1. (Monday). Correct.
    // Mon (1) -> d - 1 + 1 = d. Correct.
    // Sun (0) -> d - 0 - 6 = d - 6. Correct.
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getStoredAnchors(): AnchorEvent[] {
    try {
      const json = storage.get(ANCHORS_STORAGE_KEY);
      if (!json) {
        return [];
      }

      const raw = JSON.parse(json) as Array<Omit<AnchorEvent, 'startTime'> & { startTime: string }>;
      return raw.map(item => ({
        ...item,
        startTime: new Date(item.startTime),
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Failed to parse stored anchors:', error);
      return [];
    }
  }

  getAnchorsForDate(date: Date): AnchorEvent[] {
    // FIX #1: Add proper warning when not initialized
    if (!this.initialized) {
      // eslint-disable-next-line no-console
      console.warn(
        '⚠️ AnchorsService: getAnchorsForDate called before initialization. Returning stored anchors if available.'
      );
    }

    try {
      // Calculate start and end of the GREGORIAN day for the given date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const allAnchors = this.getStoredAnchors();

      // Filter by actual time range
      return allAnchors.filter(a => {
        return a.startTime >= startOfDay && a.startTime <= endOfDay;
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Failed to get anchors for date:', error);
      return [];
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const anchorsService = new AnchorsService();
