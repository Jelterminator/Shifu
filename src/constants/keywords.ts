/**
 * Universal keywords for tagging habits, tasks, and journal entries
 */

// Core 18 Keywords
export const KEYWORDS = [
  'Cultivate',
  'Initiate',
  'Expand',
  'Direct',
  'Ignite',
  'Transform',
  'Express',
  'Radiate',
  'Nourish',
  'Stabilize',
  'Ground',
  'Connect',
  'Refine',
  'Discern',
  'Systematize',
  'Absorb',
  'Flow',
  'Regenerate',
] as const;

// Wu Xing Phases with Philosophical Alignment
export const PHASE_KEYWORDS = {
  WOOD: [
    'Initiate',  // Starting force, new beginnings
    'Expand',    // Growing outward and exploring
    'Direct',    // Providing vision and ethical direction
    'Cultivate', // Nurturing growth and development
    'Connect',   // Building networks and relationships
    'Flow',      // Natural movement and flexibility of growth
  ] as const,
  
  FIRE: [
    'Ignite',    // Sparking inspiration and passion
    'Express',   // Creative and emotional output
    'Radiate',   // Sharing energy and influence
    'Transform', // Alchemical change through energy
    'Connect',   // Heart-centered relationships
    'Expand',    // Reaching out and influencing others
    'Direct',    // Leading through inspiration and charisma
  ] as const,
  
  EARTH: [
    'Nourish',   // Providing sustenance and care
    'Stabilize', // Creating balance and routine
    'Ground',    // Making ideas practical and rooted
    'Connect',   // Fostering community and integration
    'Cultivate', // Nurturing relationships and systems
    'Absorb',    // Receiving and integrating inputs
    'Transform', // Converting energy into nourishment
  ] as const,
  
  METAL: [
    'Refine',     // Paring down to essential quality
    'Discern',    // Evaluating value and making judgments
    'Systematize', // Creating order and structure
    'Direct',     // Setting boundaries and frameworks
    'Absorb',     // Taking in knowledge and principles
    'Ground',     // Establishing firm foundations
    'Stabilize',  // Maintaining consistency and standards
  ] as const,
  
  WATER: [
    'Flow',       // Adapting and moving with circumstance
    'Regenerate', // Deep rest and renewal
    'Absorb',     // Receptive wisdom and intuition
    'Discern',    // Insight and deep understanding
    'Connect',    // Fluid relationships and adaptability
    'Expand',     // Potential unfolding from within
    'Transform',  // Change through integration and wisdom
  ] as const,
} as const;
