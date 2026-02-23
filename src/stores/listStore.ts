import { storage } from '../utils/storage';
import { createStore } from '../utils/store';

export type SchedulingMode = 'WorkHours' | 'Anytime' | 'Morning' | 'Evening';

export interface ListConfiguration {
  id: string;
  name: string;
  icon: string;
  keywords: string[]; // Updated from keyword to keywords[]
  plan_during_work: boolean;
  plan_outside_work: boolean;
  allowedDays: string[]; // ["monday", "tuesday", ...]
  allowedPhases: string[]; // ["FIRE", "WATER", ...]
  schedulingMode: SchedulingMode; // Kept for backward compatibility or simple UI display
}

interface ListState {
  lists: ListConfiguration[];
  addList: (list: Omit<ListConfiguration, 'id'>) => void;
  updateList: (id: string, updates: Partial<ListConfiguration>) => void;
  deleteList: (id: string) => void;
  getListByKeyword: (keyword: string) => ListConfiguration | undefined;
}

const STORAGE_KEY = 'list-storage';

const DEFAULT_LISTS: ListConfiguration[] = [
  {
    id: 'work',
    name: 'Work',
    icon: 'work',
    keywords: ['work'],
    plan_during_work: true,
    plan_outside_work: false,
    allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    allowedPhases: ['FIRE', 'METAL'],
    schedulingMode: 'WorkHours',
  },
  {
    id: 'private',
    name: 'Private',
    icon: 'home',
    keywords: ['private', 'personal'],
    plan_during_work: false,
    plan_outside_work: true,
    allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    allowedPhases: ['WATER', 'EARTH', 'WOOD'],
    schedulingMode: 'Anytime',
  },
];

// Load initial state
const loadInitialState = (): { lists: ListConfiguration[] } => {
  try {
    const json = storage.get(STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json) as
        | { state?: { lists: ListConfiguration[] } }
        | { lists: ListConfiguration[] };

      if ('state' in parsed && parsed.state) {
        return parsed.state;
      }
      return parsed as { lists: ListConfiguration[] };
    }
  } catch (e) {
    console.error('Failed to load list state', e);
  }
  return { lists: DEFAULT_LISTS };
};

export const useListStore = createStore<ListState>((set, get) => {
  const initial = loadInitialState();

  // Basic migration for old data structure if needed could go here
  // For now assuming a fresh start or simple overwrite of structure for the purpose of the task

  return {
    lists: initial.lists,

    addList: list => {
      set(state => {
        const newState = {
          lists: [...state.lists, { ...list, id: Math.random().toString(36).substring(7) }],
        };
        storage.set(STORAGE_KEY, JSON.stringify({ state: newState }));
        return newState;
      });
    },

    updateList: (id, updates) => {
      set(state => {
        const newState = {
          lists: state.lists.map(l => (l.id === id ? { ...l, ...updates } : l)),
        };
        storage.set(STORAGE_KEY, JSON.stringify({ state: newState }));
        return newState;
      });
    },

    deleteList: id => {
      set(state => {
        const newState = {
          lists: state.lists.filter(l => l.id !== id),
        };
        storage.set(STORAGE_KEY, JSON.stringify({ state: newState }));
        return newState;
      });
    },

    getListByKeyword: keyword => {
      return get().lists.find(l => l.keywords.includes(keyword));
    },
  };
});
