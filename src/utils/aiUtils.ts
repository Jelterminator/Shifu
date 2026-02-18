import { jsonrepair } from 'jsonrepair';

// -----------------------------------------------------------------------------
// JSON Repair
// -----------------------------------------------------------------------------

export interface PlanStep {
  tool: string;
  args: Record<string, unknown>;
}

/**
 * Parse a potentially-malformed JSON array from the model output.
 */
export function parsePlan(jsonString: string): unknown[] {
  if (typeof jsonString !== 'string') {
    return [];
  }
  try {
    const repaired = jsonrepair(jsonString);
    const parsed = JSON.parse(repaired) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }
    return parsed;
  } catch {
    const match = jsonString.match(/\[.*\]/s);
    if (match?.[0]) {
      try {
        const repaired = jsonrepair(match[0]);
        const parsed = JSON.parse(repaired) as unknown;
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // Final fallback: try to extract individual objects
        const objects = jsonString.match(/\{[^{}]*\}/g);
        if (objects) {
          return objects
            .map(obj => {
              try {
                return JSON.parse(jsonrepair(obj)) as unknown;
              } catch {
                return null;
              }
            })
            .filter((item): item is unknown => item !== null);
        }
      }
    }
    return [];
  }
}

/**
 * Normailze a plan step to ensure it has a 'tool' property.
 */
export function normalizeStep(step: unknown): PlanStep | null {
  if (!step || typeof step !== 'object') return null;
  const s = step as Record<string, unknown>;
  const name = s['tool'] || s['name'] || s['action'];
  const args = (s['args'] || s['arguments'] || s['params'] || s['parameters'] || {}) as Record<
    string,
    unknown
  >;
  if (!name || typeof name !== 'string') return null;
  return { tool: name, args };
}
