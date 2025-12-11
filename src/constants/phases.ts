import { PHASE_KEYWORDS } from './keywords';

export interface PhaseConfig {
  color: string;
  romanHours: number[];
  qualities: string;
  idealTasks: string[];
}

export const PHASE_CONFIG: Record<string, PhaseConfig> = {
  WOOD: {
    color: '#4A7C59',
    romanHours: [21, 22, 23, 0, 1],
    qualities: 'Growth, Planning, Vitality. Spiritual centering & movement.',
    idealTasks: [...PHASE_KEYWORDS.WOOD],
  },
  FIRE: {
    color: '#E63946',
    romanHours: [2, 3, 4, 5, 6],
    qualities: 'Peak energy, expression. Deep work & execution.',
    idealTasks: [...PHASE_KEYWORDS.FIRE],
  },
  EARTH: {
    color: '#C49551',
    romanHours: [7, 8],
    qualities: 'Stability, nourishment. Lunch & restoration.',
    idealTasks: [...PHASE_KEYWORDS.EARTH],
  },
  METAL: {
    color: '#A8AAAD',
    romanHours: [9, 10, 11, 12],
    qualities: 'Precision, organization. Admin & review.',
    idealTasks: [...PHASE_KEYWORDS.METAL],
  },
  WATER: {
    color: '#457B9D',
    romanHours: [13, 14, 15, 16, 17, 18, 19, 20],
    qualities: 'Rest, consolidation. Wind-down & recovery.',
    idealTasks: [...PHASE_KEYWORDS.WATER],
  },
};
