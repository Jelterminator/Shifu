import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ID for database records
 * Uses UUID v4 for portability and debuggability
 */
export function generateId(): string {
  return uuidv4();
}
