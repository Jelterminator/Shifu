
import { phaseManager } from '../src/services/PhaseManager';

// Mock simple SunCalc/Utils if needed, or rely on real logic if no heavy deps
// We need real logic to test the bug.
// PhaseManager imports sunTimeUtils. sunTimeUtils imports suncalc.
// suncalc is pure JS.

describe('Debug Phases', () => {
    it('should print gregorian phases for today', () => {
        const today = new Date();
        // Force a specific time? No, date matters.
        // But let's mock the internal "ensureLocation" if needed or assume defaults work.
        // Default is Amsterdam.
        
        // Initialize phaseManager? It uses default if not initialized.
        
        const phases = phaseManager.getPhasesForGregorianDate(today);
        
        console.error('--- PHASES START ---');
        phases.forEach(p => {
            console.error(`[${p.name}] ${p.startTime.toISOString()} -> ${p.endTime.toISOString()}`);
        });
        console.error('--- PHASES END ---');
        console.error('Day Phases Count:', phases.filter(p => p.startTime.getHours() > 8).length);
    });
});
