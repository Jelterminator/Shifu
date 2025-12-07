import { RELIGIOUS_PRACTICES } from '../../data/practices';
import { useUserStore } from '../../stores/userStore';
import { storage } from '../../utils/storage';
import { calculateRomanHours } from '../../utils/sunTimeUtils';

export interface AnchorEvent {
  id: string;
  type: 'anchor'; // or 'practice'? Let's keep 'anchor' for now as these are fixed points
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
  
  async initialize(latitude: number, longitude: number): Promise<void> {
    const lastCalcStr = storage.get(LAST_CALCULATION_KEY);
    const now = new Date();
    
    let shouldCalculate = false;
    
    if (!lastCalcStr) {
      shouldCalculate = true;
    } else {
      const lastCalc = new Date(lastCalcStr);
      const daysSinceCalc = (now.getTime() - lastCalc.getTime()) / (1000 * 60 * 60 * 24);
      const isSaturday = now.getDay() === 6;
      
      if ((isSaturday && daysSinceCalc > 0.5) || daysSinceCalc > 6) {
        shouldCalculate = true;
      }
    }

    if (shouldCalculate) {
      console.log('🔄 Calculating anchors/practices for next week...');
      this.calculateAndStoreAnchors(latitude, longitude);
    } else {
        console.log('✅ Anchors up to date');
    }
  }

  private calculateAndStoreAnchors(latitude: number, longitude: number): void {
    const anchors: AnchorEvent[] = [];
    const startDate = new Date();
    startDate.setHours(0,0,0,0);

    // Get selected practices from store
    const userStoreState = useUserStore.getState();
    const selectedPracticeIds = userStoreState.user.spiritualPractices || [];
    
    // Create a map of selected practice definitions for quick lookup
    const relevantPractices: { id: string, name: string, romanHour: number, durationMinutes: number }[] = [];
    
    RELIGIOUS_PRACTICES.forEach(tradition => {
        tradition.categories.forEach(category => {
            category.practices.forEach(practice => {
                if (selectedPracticeIds.includes(practice.id)) {
                    relevantPractices.push(practice);
                }
            });
        });
    });

    console.log(`Found ${relevantPractices.length} relevant practices to schedule.`);

    // Calculate for 14 days
    for (let i = 0; i < 14; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0] || '';
        
        // Calculate Roman Hours for this day
        const romanHours = calculateRomanHours(date, latitude, longitude);

        // Schedule each selected practice
        for (const practice of relevantPractices) {
            // Find the start time of the specific Roman Hour
            const hourInfo = romanHours.find(rh => rh.hour === practice.romanHour);
            
            if (hourInfo) {
                anchors.push({
                    id: `practice-${dateStr}-${practice.id}`,
                    type: 'anchor',
                    title: practice.name,
                    startTime: hourInfo.startTime,
                    durationMinutes: practice.durationMinutes,
                    dateStr: dateStr,
                    isPractice: true
                });
            }
        }
    }

    // Merge with existing
    const existingAnchors = this.getStoredAnchors();
    const anchorMap = new Map<string, AnchorEvent>();
    
    existingAnchors.forEach(a => anchorMap.set(a.id, a));
    anchors.forEach(a => anchorMap.set(a.id, a));
    
    const mergedAnchors = Array.from(anchorMap.values())
        .filter(a => new Date(a.startTime).getTime() > Date.now() - 86400000); 

    storage.set(ANCHORS_STORAGE_KEY, JSON.stringify(mergedAnchors));
    storage.set(LAST_CALCULATION_KEY, new Date().toISOString());
    console.log(`Saved ${mergedAnchors.length} scheduled items.`);
  }

  private getStoredAnchors(): AnchorEvent[] {
      const json = storage.get(ANCHORS_STORAGE_KEY);
      if (!json) return [];
      try {
          const raw = JSON.parse(json);
          return raw.map((item: any) => ({
              ...item,
              startTime: new Date(item.startTime)
          }));
      } catch (e) {
          console.error('Failed to parse anchors', e);
          return [];
      }
  }

  getAnchorsForDate(date: Date): AnchorEvent[] {
      const dateStr = date.toISOString().split('T')[0] || '';
      const allAnchors = this.getStoredAnchors();
      return allAnchors.filter(a => a.dateStr === dateStr);
  }
}

export const anchorsService = new AnchorsService();
