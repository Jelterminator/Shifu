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
    'Exertion', // Morning work-out
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


// TCM (Traditional Chinese Medicine) Constants
export const TCM_KEYWORDS = {
  LUNG: ['Purge', 'Stillness', 'Release', 'Logic'],
  LARGE_INTESTINE: ['Maintenance', 'Creative'],
  STOMACH: ['Intake', 'Learning', 'Logic', 'Rest'],
  SPLEEN: ['Connection', 'Execution', 'Intake', 'Processing'],
  HEART: ['Connection', 'Devotion', 'Release', 'Rest'],
  SMALL_INTESTINE: ['Maintenance', 'Planning', 'Intake', 'Purge'],
  BLADDER: ['Creative', 'Learning', 'Processing', 'Release'],
  KIDNEY: ['Rest', 'Stillness', 'Release', 'Logic'],
  PERICARDIUM: ['Connection', 'Devotion', 'Release', 'Rest'],
  TRIPLE_BURNER: ['Rest', 'Creative'],
  GALLBLADDER: ['Planning', 'Initiation', 'Creative', 'Learning'],
  LIVER: ['Rest']
} as const;

// Note: TCM table doesn't list antonyms, so using empty arrays
export const TCM_ANTONYMS = {
  LUNG: [] as const,
  LARGE_INTESTINE: [] as const,
  STOMACH: [] as const,
  SPLEEN: [] as const,
  HEART: [] as const,
  SMALL_INTESTINE: [] as const,
  BLADDER: [] as const,
  KIDNEY: [] as const,
  PERICARDIUM: [] as const,
  TRIPLE_BURNER: [] as const,
  GALLBLADDER: [] as const,
  LIVER: [] as const
} as const;

export const TCM_DATA = {
  tradition_name: 'TCM',
  phases: [
    { phase_name: 'LUNG', start_time: '03:00', end_time: '05:00', keywords: TCM_KEYWORDS.LUNG, antonyms: TCM_ANTONYMS.LUNG },
    { phase_name: 'LARGE_INTESTINE', start_time: '05:00', end_time: '07:00', keywords: TCM_KEYWORDS.LARGE_INTESTINE, antonyms: TCM_ANTONYMS.LARGE_INTESTINE },
    { phase_name: 'STOMACH', start_time: '07:00', end_time: '09:00', keywords: TCM_KEYWORDS.STOMACH, antonyms: TCM_ANTONYMS.STOMACH },
    { phase_name: 'SPLEEN', start_time: '09:00', end_time: '11:00', keywords: TCM_KEYWORDS.SPLEEN, antonyms: TCM_ANTONYMS.SPLEEN },
    { phase_name: 'HEART', start_time: '11:00', end_time: '13:00', keywords: TCM_KEYWORDS.HEART, antonyms: TCM_ANTONYMS.HEART },
    { phase_name: 'SMALL_INTESTINE', start_time: '13:00', end_time: '15:00', keywords: TCM_KEYWORDS.SMALL_INTESTINE, antonyms: TCM_ANTONYMS.SMALL_INTESTINE },
    { phase_name: 'BLADDER', start_time: '15:00', end_time: '17:00', keywords: TCM_KEYWORDS.BLADDER, antonyms: TCM_ANTONYMS.BLADDER },
    { phase_name: 'KIDNEY', start_time: '17:00', end_time: '19:00', keywords: TCM_KEYWORDS.KIDNEY, antonyms: TCM_ANTONYMS.KIDNEY },
    { phase_name: 'PERICARDIUM', start_time: '19:00', end_time: '21:00', keywords: TCM_KEYWORDS.PERICARDIUM, antonyms: TCM_ANTONYMS.PERICARDIUM },
    { phase_name: 'TRIPLE_BURNER', start_time: '21:00', end_time: '23:00', keywords: TCM_KEYWORDS.TRIPLE_BURNER, antonyms: TCM_ANTONYMS.TRIPLE_BURNER },
    { phase_name: 'GALLBLADDER', start_time: '23:00', end_time: '01:00', keywords: TCM_KEYWORDS.GALLBLADDER, antonyms: TCM_ANTONYMS.GALLBLADDER },
    { phase_name: 'LIVER', start_time: '01:00', end_time: '03:00', keywords: TCM_KEYWORDS.LIVER, antonyms: TCM_ANTONYMS.LIVER }
  ],
  Roman_hours: false
} as const;

// Benedictine Horarium Constants
export const BENEDICTINE_KEYWORDS = {
  VIGILS: ['Devotion', 'Stillness', 'Learning', 'Initiate'],
  LAUDS: ['Planning', 'Maintenance', 'Exertion', 'Connection'],
  TERCE: ['Exertion', 'Devotion', 'Important'],
  SEXT: ['Execution', 'Important', 'Intake', 'Rest'],
  NONE: ['Maintenance', 'Release', 'Connection', 'Resolution'],
  VESPERS: ['Connection', 'Devotion', 'Intake', 'Release', 'Processing'],
  COMPLINE: ['Rest', 'Stillness', 'Purge', 'Release']
} as const;

export const BENEDICTINE_ANTONYMS = {
  VIGILS: ['Exertion', 'Connection'],
  LAUDS: ['Rest', 'Stillness'],
  TERCE: ['Creative', 'Stillness'],
  SEXT: ['Exertion'],
  NONE: ['Creative'],
  VESPERS: ['Execution', 'Exertion'],
  COMPLINE: ['Execution', 'Exertion']
} as const;

export const BENEDICTINE_DATA = {
  tradition_name: 'Benedictine',
  phases: [
    { phase_name: 'VIGILS', start_time: '21', end_time: '0', keywords: BENEDICTINE_KEYWORDS.VIGILS, antonyms: BENEDICTINE_ANTONYMS.VIGILS },
    { phase_name: 'LAUDS', start_time: '0', end_time: '3', keywords: BENEDICTINE_KEYWORDS.LAUDS, antonyms: BENEDICTINE_ANTONYMS.LAUDS },
    { phase_name: 'TERCE', start_time: '3', end_time: '6', keywords: BENEDICTINE_KEYWORDS.TERCE, antonyms: BENEDICTINE_ANTONYMS.TERCE },
    { phase_name: 'SEXT', start_time: '6', end_time: '9', keywords: BENEDICTINE_KEYWORDS.SEXT, antonyms: BENEDICTINE_ANTONYMS.SEXT },
    { phase_name: 'NONE', start_time: '9', end_time: '12', keywords: BENEDICTINE_KEYWORDS.NONE, antonyms: BENEDICTINE_ANTONYMS.NONE },
    { phase_name: 'VESPERS', start_time: '12', end_time: '15', keywords: BENEDICTINE_KEYWORDS.VESPERS, antonyms: BENEDICTINE_ANTONYMS.VESPERS },
    { phase_name: 'COMPLINE', start_time: '15', end_time: '21', keywords: BENEDICTINE_KEYWORDS.COMPLINE, antonyms: BENEDICTINE_ANTONYMS.COMPLINE }
  ],
  Roman_hours: true
} as const;

// Ayurvedic Dosha Cycles Constants
export const AYURVEDIC_KEYWORDS = {
  VATA_1: ['Stillness', 'Purge', 'Creative', 'Planning'],
  KAPHA_1: ['Exertion', 'Maintenance', 'Connection'],
  PITTA_1: ['Execution', 'Intake', 'Logic', 'Resolution', 'Important'],
  VATA_2: ['Connection', 'Initiation', 'Learning', 'Exertion', 'Planning'],
  KAPHA_2: ['Connection', 'Maintenance', 'Devotion', 'Release', 'Intake', 'Rest'],
  PITTA_2: ['Rest', 'Processing', 'Purge']
} as const;

export const AYURVEDIC_ANTONYMS = {
  VATA_1: ['Rest', 'Intake', 'Execution'],
  KAPHA_1: ['Logic', 'Rest', 'Initiation'],
  PITTA_1: ['Stillness', 'Maintenance', 'Creative'],
  VATA_2: ['Execution', 'Resolution', 'Intake'],
  KAPHA_2: ['Execution', 'Logic', 'Important'],
  PITTA_2: ['Intake', 'Execution', 'Connection', 'Study']
} as const;

export const AYURVEDIC_DATA = {
  tradition_name: 'Ayurvedic',
  phases: [
    { phase_name: 'VATA_1', start_time: '02:00', end_time: '06:00', keywords: AYURVEDIC_KEYWORDS.VATA_1, antonyms: AYURVEDIC_ANTONYMS.VATA_1 },
    { phase_name: 'KAPHA_1', start_time: '06:00', end_time: '10:00', keywords: AYURVEDIC_KEYWORDS.KAPHA_1, antonyms: AYURVEDIC_ANTONYMS.KAPHA_1 },
    { phase_name: 'PITTA_1', start_time: '10:00', end_time: '14:00', keywords: AYURVEDIC_KEYWORDS.PITTA_1, antonyms: AYURVEDIC_ANTONYMS.PITTA_1 },
    { phase_name: 'VATA_2', start_time: '14:00', end_time: '18:00', keywords: AYURVEDIC_KEYWORDS.VATA_2, antonyms: AYURVEDIC_ANTONYMS.VATA_2 },
    { phase_name: 'KAPHA_2', start_time: '18:00', end_time: '22:00', keywords: AYURVEDIC_KEYWORDS.KAPHA_2, antonyms: AYURVEDIC_ANTONYMS.KAPHA_2 },
    { phase_name: 'PITTA_2', start_time: '22:00', end_time: '02:00', keywords: AYURVEDIC_KEYWORDS.PITTA_2, antonyms: AYURVEDIC_ANTONYMS.PITTA_2 }
  ],
  Roman_hours: false
} as const;

// Sikh 8-Pahar Constants
export const SIKH_KEYWORDS = {
  PAHAR_8: ['Stillness', 'Devotion', 'Logic', 'Maintenance', 'Release', 'Rest'],
  PAHAR_1: ['Initiation', 'Exertion', 'Rest', 'Planning', 'Intake'],
  PAHAR_2: ['Execution', 'Logic', 'Important'],
  PAHAR_3: ['Maintenance', 'Learning', 'Processing', 'Rest', 'Connection', 'Devotion'],
  PAHAR_4: ['Resolution', 'Release', 'Purge', 'Maintenance', 'Processing', 'Resolution'],
  PAHAR_5: ['Connection', 'Devotion', 'Intake'],
  PAHAR_6: ['Rest', 'Release', 'Processing', 'Purge', 'Stillness'],
  PAHAR_7: ['Rest', 'Stillness']
} as const;

export const SIKH_ANTONYMS = {
  PAHAR_8: ['Maintenance'],
  PAHAR_1: [],
  PAHAR_2: ['Stillness'],
  PAHAR_3: ['Exertion'],
  PAHAR_4: ['Initiation'],
  PAHAR_5: ['Execution'],
  PAHAR_6: [],
  PAHAR_7: ['Initiation', 'Planning', 'Execution', 'Logic', 'Exertion', 'Intake', 'Learning', 'Important']
} as const;

export const SIKH_DATA = {
  tradition_name: 'Sikh',
  phases: [
    { phase_name: 'PAHAR_8', start_time: '03:00', end_time: '06:00', keywords: SIKH_KEYWORDS.PAHAR_8, antonyms: SIKH_ANTONYMS.PAHAR_8 },
    { phase_name: 'PAHAR_1', start_time: '06:00', end_time: '09:00', keywords: SIKH_KEYWORDS.PAHAR_1, antonyms: SIKH_ANTONYMS.PAHAR_1 },
    { phase_name: 'PAHAR_2', start_time: '09:00', end_time: '12:00', keywords: SIKH_KEYWORDS.PAHAR_2, antonyms: SIKH_ANTONYMS.PAHAR_2 },
    { phase_name: 'PAHAR_3', start_time: '12:00', end_time: '15:00', keywords: SIKH_KEYWORDS.PAHAR_3, antonyms: SIKH_ANTONYMS.PAHAR_3 },
    { phase_name: 'PAHAR_4', start_time: '15:00', end_time: '18:00', keywords: SIKH_KEYWORDS.PAHAR_4, antonyms: SIKH_ANTONYMS.PAHAR_4 },
    { phase_name: 'PAHAR_5', start_time: '18:00', end_time: '21:00', keywords: SIKH_KEYWORDS.PAHAR_5, antonyms: SIKH_ANTONYMS.PAHAR_5 },
    { phase_name: 'PAHAR_6', start_time: '21:00', end_time: '00:00', keywords: SIKH_KEYWORDS.PAHAR_6, antonyms: SIKH_ANTONYMS.PAHAR_6 },
    { phase_name: 'PAHAR_7', start_time: '00:00', end_time: '03:00', keywords: SIKH_KEYWORDS.PAHAR_7, antonyms: SIKH_ANTONYMS.PAHAR_7 }
  ],
  Roman_hours: false
} as const;

// Kabbalistic Toggle Constants
export const KABBALISTIC_KEYWORDS = {
  CHESED: ['Initiation', 'Planning', 'Execution', 'Maintenance', 'Connection', 'Creative'],
  GEVURAH: ['Resolution', 'Exertion', 'Intake', 'Processing', 'Purge', 'Rest', 'Stillness', 'Logic']
} as const;

// Note: The document doesn't specify antonyms for Kabbalistic phases
export const KABBALISTIC_ANTONYMS = {
  CHESED: [] as const,
  GEVURAH: [] as const
} as const;

export const KABBALISTIC_DATA = {
  tradition_name: 'Kabbalistic',
  phases: [
    { phase_name: 'CHESED', start_time: '00:00', end_time: '12:00', keywords: KABBALISTIC_KEYWORDS.CHESED, antonyms: KABBALISTIC_ANTONYMS.CHESED },
    { phase_name: 'GEVURAH', start_time: '12:00', end_time: '00:00', keywords: KABBALISTIC_KEYWORDS.GEVURAH, antonyms: KABBALISTIC_ANTONYMS.GEVURAH }
  ],
  Roman_hours: false
} as const;