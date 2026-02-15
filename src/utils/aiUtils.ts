
import { jsonrepair } from 'jsonrepair';

// -----------------------------------------------------------------------------
// JSON Repair
// -----------------------------------------------------------------------------

/**
 * Parse a potentially-malformed JSON array from the model output.
 */
export function parsePlan(jsonString: string): any[] {
  if (typeof jsonString !== 'string') {
    console.error('[AI Utils] parsePlan received non-string input:', jsonString);
    return [];
  }
  try {
    const repaired = jsonrepair(jsonString);
    const parsed = JSON.parse(repaired);
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }
    return parsed;
  } catch (e) {
    console.warn('[AI Utils] JSON Repair failed, trying regex extraction...');
    const match = jsonString.match(/\[.*\]/s);
    if (match) {
      try {
        const repaired = jsonrepair(match[0]);
        const parsed = JSON.parse(repaired);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e2) {
        // Final fallback: try to extract individual objects
        const objects = jsonString.match(/\{[^{}]*\}/g);
        if (objects) {
            return objects.map(obj => {
                try { return JSON.parse(jsonrepair(obj)); } catch { return null; }
            }).filter(Boolean);
        }
      }
    }
    return [];
  }
}

/**
 * Normailze a plan step to ensure it has a 'tool' property.
 */
export function normalizeStep(step: any): any {
    if (!step) return null;
    const name = step.tool || step.name || step.action;
    const args = step.args || step.arguments || step.params || step.parameters || {};
    if (!name) return null;
    return { tool: name, args };
}
