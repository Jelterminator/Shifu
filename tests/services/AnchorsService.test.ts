import { anchorsService } from '../../src/services/data/Anchors';
import { useUserStore } from '../../src/stores/userStore';
import { storage } from '../../src/utils/storage';
import { calculateRomanHours } from '../../src/utils/sunTimeUtils';

// Mock MMKV native module globally to prevent crash during import
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    getBoolean: jest.fn(),
    getNumber: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

// Mocks
jest.mock('../../src/utils/storage', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    getBoolean: jest.fn(),
    getString: jest.fn(),
  },
}));

jest.mock('../../src/utils/sunTimeUtils', () => ({
  calculateRomanHours: jest.fn(),
}));

jest.mock('../../src/stores/userStore', () => ({
  useUserStore: {
    getState: jest.fn(),
  },
}));

describe('AnchorsService', () => {
  const MOCK_DATE = new Date('2024-05-15T12:00:00Z'); // A Wednesday
  const LAT = 52.0;
  const LON = 4.0;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_DATE);

    // Default User Store State
    (useUserStore.getState as jest.Mock).mockReturnValue({
      user: {
        spiritualPractices: ['practice-1'], // Assume this exists in data/practices or we might need to mock data
      },
    });

    // Default Roman Hours
    (calculateRomanHours as jest.Mock).mockReturnValue([
      { hour: 0, startTime: new Date('2024-05-15T06:00:00Z') }, // Just dummy data
      { hour: 1, startTime: new Date('2024-05-15T07:00:00Z') },
    ]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialize', () => {
    it('should calculate anchors if storage is empty', () => {
      (storage.get as jest.Mock).mockReturnValue(null); // No last calc

      anchorsService.initialize(LAT, LON);

      expect(storage.set).toHaveBeenCalledTimes(2); // Anchors + Timestamp
      expect(storage.set).toHaveBeenCalledWith(
        'shifu_anchors_last_calc',
        expect.any(String)
      );
    });

    it('should recalculate if last calculation was before Start of Current Week', () => {
      // Mock Date: Wed May 15. Start of Week: Mon May 13.
      // Last Calc: Sun May 12 (Last Week)
      (storage.get as jest.Mock).mockImplementation((key) => {
        if (key === 'shifu_anchors_last_calc') return '2024-05-12T10:00:00Z';
        return JSON.stringify([]); // anchors
      });

      anchorsService.initialize(LAT, LON);

      expect(storage.set).toHaveBeenCalled(); // Should trigger recalc
    });

    it('should NOT recalculate if last calculation was recent (within current week)', () => {
      // Mock Date: Wed May 15. Start of Week: Mon May 13.
      // Last Calc: Tue May 14
      (storage.get as jest.Mock).mockImplementation((key) => {
        if (key === 'shifu_anchors_last_calc') return '2024-05-14T10:00:00Z';
        return JSON.stringify([]);
      });

      anchorsService.initialize(LAT, LON);
      
      // Should NOT set (unless logic fails)
      // Note: initialize sets initialized=true but doesn't write to storage if no calc needed
      expect(storage.set).not.toHaveBeenCalled();
    });

    it('should recalculate on Saturday Night if last calc was before Sat 18:00', () => {
      // Move time to Saturday Night
      // Wed May 15 -> Sat May 18.
      const SAT_NIGHT = new Date('2024-05-18T20:00:00Z');
      jest.setSystemTime(SAT_NIGHT);

      // Last calc: Sat Morning
      (storage.get as jest.Mock).mockImplementation((key) => {
        if (key === 'shifu_anchors_last_calc') return '2024-05-18T10:00:00Z';
        return JSON.stringify([]);
      });

      anchorsService.initialize(LAT, LON);

      expect(storage.set).toHaveBeenCalled(); // Needs refresh for next week
    });
  });

  describe('recalculateFutureAnchors', () => {
    it('should preserve past anchors and replace future ones', () => {

      
      // Existing anchors
      const PAST_ANCHOR = { id: 'past', startTime: '2024-05-15T10:00:00Z', type: 'anchor' };
      const FUTURE_ANCHOR_OLD = { id: 'future-old', startTime: '2024-05-15T14:00:00Z', type: 'anchor' };
      
      (storage.get as jest.Mock).mockReturnValue(JSON.stringify([PAST_ANCHOR, FUTURE_ANCHOR_OLD]));

      // Mock generation returning NEW future anchors
      // (We can't easily mock private `generateAnchors` but we can ensure `calculateRomanHours` returns stuff that leads to new IDs/times)
      // But simplifying: `recalculateFutureAnchors` calls `generateAnchors`.
      // `generateAnchors` uses `calculateRomanHours`.
      
      // We want to see if `storage.set` is called with merged list.
      // The generated list will likely be empty if `RELIGIOUS_PRACTICES` mocks aren't set up perfectly or `selectedPracticeIds` don't match.
      // But assume `generateAnchors` produces SOMETHING.
      
      // To test the "Filtering" logic specifically, we rely on the implementation details:
      // It calls `getStoredAnchors`, filters `<= NOW`.
      // It calls `generateAnchors`, filters `> NOW`.
      
      anchorsService.recalculateFutureAnchors(LAT, LON);

      expect(storage.set).toHaveBeenCalled();
      const setCall = (storage.set as jest.Mock).mock.calls.find(c => c[0] === 'shifu_anchors');
      const savedAnchors = JSON.parse(setCall[1]);

      // Check Past Preserved
      const savedPast = savedAnchors.find((a: any) => a.id === 'past');
      expect(savedPast).toBeDefined();

      // Check Old Future Removed?
      // Well, if `generateAnchors` generates the *same* ID, it might dedupe or double?
      // The code uses `Map` to dedupe by ID.
      // If `future-old` ID is not generated by new logic (e.g. simulated change), it should be GONE (if not in new list)
      // Wait. `recalculateFutureAnchors` logic:
      // `const pastAnchors = existingAnchors.filter(a => a.startTime <= now);` -> Keeps PAST.
      // `const futureAnchors = freshAnchors.filter(a => a.startTime > now);` -> Adds NEW FUTURE.
      // `merged = [...pastAnchors, ...futureAnchors];`
      // So `FUTURE_ANCHOR_OLD` (which is > NOW) is DROPPED from `existingAnchors` list.
      // It will only re-appear if `freshAnchors` contains it.
      
      const savedOldFuture = savedAnchors.find((a: any) => a.id === 'future-old');
      // If `generateAnchors` DOES NOT produce `future-old`, then it should be gone.
      // Since our mock `calculateRomanHours` / practices might produce different IDs or we can assume it produces specific ones.
      // In this test, `generateAnchors` will produce anchors based on `calculateRomanHours`.
      // Let's assume `generateAnchors` generates different IDs or none for simplicity of verifying removal.
      
      // If generateAnchors returns empty (default if no match), then only PAST should remain.
      // (useUserStore mock returns 'practice-1', if we assume RELIGIOUS_PRACTICES has no 'practice-1' effectively, it returns empty).
      
      // Let's rely on that:
      // If `generateAnchors` returns items, they are FUTURE.
      
      // So checking `savedOldFuture` should be undefined (it was explicitly filtered out from existing).
      expect(savedOldFuture).toBeUndefined();
    });
  });
});
