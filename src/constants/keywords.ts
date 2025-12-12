/**
 * Universal keywords for tagging habits, tasks, and journal entries
 */

// Core 18 Keywords
export const KEYWORDS = [
  'Initiation',
  'Planning',
  'Execution',
  'Logic',
  'Maintenance',
  'Connection',
  'Resolution',
  'Exertion',
  'Intake',
  'Processing',
  'Purge',
  'Rest',
  'Stillness',
  'Creative',
  'Learning',
  'Devotion',
  'Release',
  'Important',
] as const;

// Wu Xing Phases with Philosophical Alignment
export const PHASE_KEYWORDS = {
  WOOD: [
    'Initiation', // Starting force, new beginnings
    'Stillness', // Receptive wisdom and intuition
    'Planning', // Strategic growth and direction
    'Creative', // Generative expansion and innovation
    'Connection', // Building networks and relationships
    'Devotion', // Heart-centered passion and commitment
    'Intake', // Receiving and absorbing nourishment
  ] as const,

  FIRE: [
    'Exertion', // Energy output and passionate action
    'Creative', // Expressive and transformative energy
    'Execution', // Implementation and expression
    'Devotion', // Heart-centered passion and commitment
    'Initiation', // Starting force, new beginnings
    'Important',
  ] as const,

  EARTH: [
    'Intake', // Receiving and absorbing nourishment
    'Processing', // Digesting and transforming inputs
    'Maintenance', // Sustaining and stabilizing systems
    'Connection', // Community integration and support
    'Devotion', // Nurturing care and service
    'Rest', // Take a nap
  ] as const,

  METAL: [
    'Logic', // Structural thinking and analysis
    'Processing', // Refining and distilling essence
    'Resolution', // Decision-making and conclusion
    'Important', // Discernment of value and priorities
    'Learning', // Acquiring knowledge and principles
    'Planning', // Strategic growth and direction
    'Purge', // Letting go and flowing adaptation
  ] as const,

  WATER: [
    'Rest', // Deep regeneration and renewal
    'Stillness', // Receptive wisdom and intuition
    'Learning', // Absorbing insights and understanding
    'Release', // Letting go and flowing adaptation
    'Processing', // Integration and transformation
    'Connection', // Fluid adaptability in relationships
    'Maintenance', // Sustaining and stabilizing systems
  ] as const,
} as const;
