import { phaseManager } from '../../src/services/PhaseManager';
import { calculateRomanHours } from '../../src/utils/sunTimeUtils';

// Mock dependency
jest.mock('../../src/utils/sunTimeUtils', () => ({
  calculateRomanHours: jest.fn(),
}));

describe('PhaseManager', () => {
  const TEST_AMSTERDAM = { latitude: 52.3676, longitude: 4.9041, timezone: 'Europe/Amsterdam' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset private state if possible or rely on public API
    // re-initialize to ensure clean state
    phaseManager.initialize(TEST_AMSTERDAM.latitude, TEST_AMSTERDAM.longitude, TEST_AMSTERDAM.timezone);
  });

  describe('Initialization', () => {
    it('should initialize correctly', () => {
      const status = phaseManager.getInitializationStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.location).toEqual(TEST_AMSTERDAM);
    });
  });

  describe('Phase Calculation', () => {
    it('should calculate phases for a date', () => {
      // Mock roman hours return
      const mockRomanHours = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        startTime: new Date(`2023-01-01T${i}:00:00`),
        endTime: new Date(`2023-01-01T${i+1}:00:00`),
      }));
      (calculateRomanHours as jest.Mock).mockReturnValue(mockRomanHours);

      const phases = phaseManager.calculatePhasesForDate(new Date('2023-01-01'));
      
      expect(phases.length).toBeGreaterThan(0);
      expect(calculateRomanHours).toHaveBeenCalled();
      
      // Check for specific phases we know exist
      const woodPhase = phases.find(p => p.name === 'WOOD');
      expect(woodPhase).toBeDefined();
    });

    it('should identify current phase correctly', () => {
       const mockRomanHours = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        // Using "today" dates to match current execution
        startTime: new Date(new Date().setHours(i, 0, 0, 0)),
        endTime: new Date(new Date().setHours(i+1, 0, 0, 0)),
      }));
      (calculateRomanHours as jest.Mock).mockReturnValue(mockRomanHours);

      const currentPhase = phaseManager.getCurrentPhase();
      expect(currentPhase).toBeDefined();
      expect(['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER']).toContain(currentPhase.name);
    });
  });
});
