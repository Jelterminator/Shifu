import { RELIGIOUS_PRACTICES } from '../../data/practices';
import { useUserStore } from '../../stores/userStore';
import { storage } from '../../utils/storage';
import { calculateRomanHours } from '../../utils/sunTimeUtils';

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
      // console.log('🔄 AnchorsService: Initializing...');

      // Validate storage is available
      if (!storage) {
        console.warn('⚠️ AnchorsService: Storage not available, skipping initialization');
        return;
      }

      const lastCalcStr = storage.get(LAST_CALCULATION_KEY);
      const now = new Date();

      let shouldCalculate = false;

      if (!lastCalcStr) {
        shouldCalculate = true;
        // console.log('📅 AnchorsService: No previous calculation found');
      } else {
        try {
          const lastCalc = new Date(lastCalcStr);
          const daysSinceCalc = (now.getTime() - lastCalc.getTime()) / (1000 * 60 * 60 * 24);
          const isSaturday = now.getDay() === 6;

          if ((isSaturday && daysSinceCalc > 0.5) || daysSinceCalc > 6) {
            shouldCalculate = true;
            // console.log(
            // `📅 AnchorsService: Recalculation needed (${daysSinceCalc.toFixed(1)} days since last calculation)`
            // );
          } else {
            // console.log(
            // `✅ AnchorsService: Anchors up to date (${daysSinceCalc.toFixed(1)} days old)`
            // );
          }
        } catch (dateError) {
          console.warn('⚠️ AnchorsService: Invalid last calculation date, will recalculate');
          shouldCalculate = true;
        }
      }

      if (shouldCalculate) {
        this.calculateAndStoreAnchors(latitude, longitude);
      }

      this.initialized = true;
      // console.log('✅ AnchorsService: Initialized successfully');
    } catch (error) {
      console.error('❌ AnchorsService: Initialization failed:', error);
      // Don't throw - allow graceful degradation
      this.initialized = false;
    }
  }

  private calculateAndStoreAnchors(latitude: number, longitude: number): void {
    try {
      // console.log('🔄 Calculating anchors/practices for next 14 days...');

      const anchors: AnchorEvent[] = [];
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      // Get selected practices from store
      const userStoreState = useUserStore.getState();
      const selectedPracticeIds = userStoreState.user.spiritualPractices || [];

      // console.log(`📋 Found ${selectedPracticeIds.length} selected practices`);

      // Create a map of selected practice definitions
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

      // console.log(`✅ Filtered to ${relevantPractices.length} relevant practices to schedule`);

      // Calculate for 14 days
      for (let i = 0; i < 14; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0] || '';

        try {
          // Calculate Roman Hours for this day
          const romanHours = calculateRomanHours(date, latitude, longitude);

          // Schedule each selected practice
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
          console.warn(`⚠️ Failed to calculate Roman hours for ${dateStr}:`, dayError);
          // Continue with next day
        }
      }

      // Merge with existing anchors
      const existingAnchors = this.getStoredAnchors();
      const anchorMap = new Map<string, AnchorEvent>();

      existingAnchors.forEach(a => anchorMap.set(a.id, a));
      anchors.forEach(a => anchorMap.set(a.id, a));

      // Filter out past anchors (keep only future or recent past within 1 day)
      const mergedAnchors = Array.from(anchorMap.values()).filter(
        a => new Date(a.startTime).getTime() > Date.now() - 86400000
      );

      // Store the results
      storage.set(ANCHORS_STORAGE_KEY, JSON.stringify(mergedAnchors));
      storage.set(LAST_CALCULATION_KEY, new Date().toISOString());

      // console.log(`✅ Saved ${mergedAnchors.length} scheduled anchor events`);
    } catch (error) {
      console.error('❌ Failed to calculate and store anchors:', error);
      throw error;
    }
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
      console.error('❌ Failed to parse stored anchors:', error);
      return [];
    }
  }

  getAnchorsForDate(date: Date): AnchorEvent[] {
    if (!this.initialized) {
      console.warn('⚠️ AnchorsService: Not initialized, returning empty array');
      return [];
    }

    try {
      const dateStr = date.toISOString().split('T')[0] || '';
      const allAnchors = this.getStoredAnchors();
      return allAnchors.filter(a => a.dateStr === dateStr);
    } catch (error) {
      console.error('❌ Failed to get anchors for date:', error);
      return [];
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const anchorsService = new AnchorsService();
