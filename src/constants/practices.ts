export interface Practice {
  id: string;
  name: string;
  romanHour: number;
  durationMinutes: number;
}

export interface PracticeCategory {
  name: string;
  practices: Practice[];
}

export interface Tradition {
  id: string;
  name: string;
  categories: PracticeCategory[];
}

export const RELIGIOUS_PRACTICES: Tradition[] = [
  {
    id: 'secular',
    name: 'Secular',
    categories: [
      {
        name: 'Three Daily Meals',
        practices: [
          { id: 'sec_breakfast', name: 'Breakfast', romanHour: 1, durationMinutes: 20 },
          { id: 'sec_lunch', name: 'Lunch', romanHour: 7, durationMinutes: 20 },
          { id: 'sec_dinner', name: 'Dinner', romanHour: 11, durationMinutes: 30 },
        ],
      },
      {
        name: 'Wake up',
        practices: [{ id: 'sec_wakeup', name: 'Wake up', romanHour: 23, durationMinutes: 60 }],
      },
      {
        name: 'Sunset winddown',
        practices: [{ id: 'sec_winddown', name: 'Winddown', romanHour: 12, durationMinutes: 90 }],
      },
    ],
  },
  {
    id: 'christianity',
    name: 'Christianity',
    categories: [
      {
        name: 'Major Prayers',
        practices: [
          { id: 'c_lauds', name: 'Lauds - Morning Prayer', romanHour: 0, durationMinutes: 20 },
          { id: 'c_vespers', name: 'Vespers - Evening Prayer', romanHour: 12, durationMinutes: 20 },
          { id: 'c_compline', name: 'Compline - Night Prayer', romanHour: 15, durationMinutes: 10 },
        ],
      },
      {
        name: 'Office of Readings',
        practices: [
          {
            id: 'c_vigils',
            name: 'Vigils - Office of Readings',
            romanHour: 21,
            durationMinutes: 60,
          },
        ],
      },
      {
        name: 'Minor Prayers',
        practices: [
          { id: 'c_terce', name: 'Terce', romanHour: 3, durationMinutes: 10 },
          { id: 'c_sext', name: 'Sext', romanHour: 6, durationMinutes: 10 },
          { id: 'c_none', name: 'None', romanHour: 9, durationMinutes: 10 },
        ],
      },
    ],
  },
  {
    id: 'islam',
    name: 'Islam',
    categories: [
      {
        name: 'Core Salah (Obligatory)',
        practices: [
          { id: 'i_fajr', name: 'Fajr', romanHour: 0, durationMinutes: 10 },
          { id: 'i_dhuhr', name: 'Dhuhr', romanHour: 6, durationMinutes: 20 },
          { id: 'i_asr', name: 'Asr', romanHour: 10, durationMinutes: 20 },
          { id: 'i_maghrib', name: 'Maghrib', romanHour: 12, durationMinutes: 15 },
          { id: 'i_isha', name: 'Isha', romanHour: 14, durationMinutes: 20 },
        ],
      },
      {
        name: 'Complete Salah',
        practices: [
          { id: 'i_tahajjud', name: 'Tahajjud', romanHour: 21, durationMinutes: 30 },
          { id: 'i_duha', name: 'Duha', romanHour: 2, durationMinutes: 15 },
          { id: 'i_witr', name: 'Witr', romanHour: 15, durationMinutes: 5 },
        ],
      },
    ],
  },
  {
    id: 'judaism',
    name: 'Judaism',
    categories: [
      {
        name: 'Core Prayers',
        practices: [
          { id: 'j_shacharit', name: 'Shacharit', romanHour: 0, durationMinutes: 45 },
          { id: 'j_mincha', name: 'Mincha', romanHour: 9, durationMinutes: 20 },
          { id: 'j_maariv', name: "Ma'ariv / Arvit", romanHour: 12, durationMinutes: 20 },
        ],
      },
      {
        name: 'Blessings',
        practices: [
          { id: 'j_modehani', name: 'Modeh Ani', romanHour: 21, durationMinutes: 5 },
          { id: 'j_birkat', name: 'Birkat Hamazon', romanHour: 6, durationMinutes: 10 },
          { id: 'j_kriat', name: 'Kriat Shema al Hamita', romanHour: 15, durationMinutes: 5 },
        ],
      },
    ],
  },
  {
    id: 'hinduism',
    name: 'Hinduism',
    categories: [
      {
        name: 'Sandhyavandanam',
        practices: [
          { id: 'h_pratah', name: 'Pratah Sandhya', romanHour: 0, durationMinutes: 30 },
          { id: 'h_madhyahna', name: 'Madhyahna Sandhya', romanHour: 6, durationMinutes: 30 },
          { id: 'h_sayam', name: 'Sayam Sandhya', romanHour: 12, durationMinutes: 30 },
        ],
      },
      {
        name: 'Brahma Murta',
        practices: [
          { id: 'h_brahmamuhurta', name: 'Brahma Muhurta', romanHour: 21, durationMinutes: 180 },
        ],
      },
      {
        name: 'Puja',
        practices: [
          { id: 'h_morningpuja', name: 'Morning Puja', romanHour: 3, durationMinutes: 30 },
          { id: 'h_middayaarti', name: 'Midday Aarti', romanHour: 9, durationMinutes: 10 },
          { id: 'h_eveningaarti', name: 'Evening Aarti', romanHour: 15, durationMinutes: 10 },
        ],
      },
    ],
  },
  {
    id: 'buddhism',
    name: 'Buddhism',
    categories: [
      {
        name: "Layman's Practice",
        practices: [
          { id: 'b_mindfulness', name: 'Mindfulness practice', romanHour: 0, durationMinutes: 15 },
          { id: 'b_justsitting', name: "'Just sitting'", romanHour: 12, durationMinutes: 30 },
          { id: 'b_metta', name: 'Metta practice', romanHour: 15, durationMinutes: 10 },
        ],
      },
      {
        name: 'Kyoto Zen',
        practices: [
          { id: 'b_earlymed', name: 'Early Meditation', romanHour: 21, durationMinutes: 45 },
          { id: 'b_morningmed', name: 'Morning Meditation', romanHour: 4, durationMinutes: 25 },
          { id: 'b_afternoonmed', name: 'Afternoon Meditation', romanHour: 8, durationMinutes: 25 },
        ],
      },
      {
        name: 'Shaolin Kung Fu',
        practices: [
          { id: 'b_chigong', name: 'Chi Gong practice', romanHour: 1, durationMinutes: 60 },
          { id: 'b_kungfu1', name: 'Kung Fu - conditioning', romanHour: 5, durationMinutes: 60 },
          { id: 'b_kungfu2', name: 'Kung Fu - martial arts', romanHour: 9, durationMinutes: 60 },
        ],
      },
    ],
  },
  {
    id: 'shinto',
    name: 'Shinto',
    categories: [
      {
        name: 'Daily Rituals',
        practices: [
          {
            id: 's_greeting',
            name: 'Greeting the Sun/Purification',
            romanHour: 0,
            durationMinutes: 10,
          },
          { id: 's_offering', name: 'Offering to Kami', romanHour: 6, durationMinutes: 10 },
          { id: 's_appreciation', name: 'Appreciation Ritual', romanHour: 12, durationMinutes: 15 },
        ],
      },
      {
        name: 'Cleansing Practices',
        practices: [
          { id: 's_salt', name: 'Salt Cleansing', romanHour: 21, durationMinutes: 5 },
          { id: 's_ancestor', name: 'Ancestor Veneration', romanHour: 3, durationMinutes: 10 },
        ],
      },
      {
        name: 'Meditation',
        practices: [
          { id: 's_spirits', name: 'Speaking to Spirits', romanHour: 9, durationMinutes: 10 },
          { id: 's_winddown', name: 'Evening Winddown', romanHour: 15, durationMinutes: 10 },
        ],
      },
    ],
  },
  {
    id: 'sikhism',
    name: 'Sikhism',
    categories: [
      {
        name: 'Nitnem (Daily Prayers)',
        practices: [
          { id: 'sk_japji', name: 'Jap Ji Sahib', romanHour: 0, durationMinutes: 20 },
          { id: 'sk_rehraas', name: 'Rehraas Sahib', romanHour: 12, durationMinutes: 20 },
          { id: 'sk_kirtan', name: 'Kirtan Sohila', romanHour: 15, durationMinutes: 10 },
        ],
      },
      {
        name: 'Amrit Vela',
        practices: [
          {
            id: 'sk_amritvela',
            name: 'Amrit Vela - Early Meditation',
            romanHour: 21,
            durationMinutes: 60,
          },
        ],
      },
      {
        name: 'Additional Banis',
        practices: [
          { id: 'sk_jaap', name: 'Jaap Sahib', romanHour: 3, durationMinutes: 15 },
          { id: 'sk_tav', name: 'Tav-Prasad Savaiye', romanHour: 6, durationMinutes: 10 },
          { id: 'sk_chaupai', name: 'Chaupai Sahib', romanHour: 9, durationMinutes: 10 },
        ],
      },
    ],
  },
  {
    id: 'wicca',
    name: 'Wicca',
    categories: [
      {
        name: 'Daily Devotions',
        practices: [
          {
            id: 'w_gratitude',
            name: 'Morning Gratitude Prayer',
            romanHour: 0,
            durationMinutes: 10,
          },
          { id: 'w_midday', name: 'Midday Meditation', romanHour: 6, durationMinutes: 15 },
          { id: 'w_evening', name: 'Evening Ritual', romanHour: 12, durationMinutes: 20 },
        ],
      },
      {
        name: 'Protection Rituals',
        practices: [
          { id: 'w_bedtime', name: 'Bedtime Protection', romanHour: 21, durationMinutes: 5 },
          { id: 'w_elemental', name: 'Elemental Invocation', romanHour: 3, durationMinutes: 10 },
        ],
      },
      {
        name: 'Esbat Practices',
        practices: [
          { id: 'w_spellwork', name: 'Daily Spellwork', romanHour: 9, durationMinutes: 10 },
          { id: 'w_ancestor', name: 'Ancestor Honoring', romanHour: 15, durationMinutes: 10 },
        ],
      },
    ],
  },
];
