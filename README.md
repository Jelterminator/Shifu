# Shifu

## AI-Powered Productivity Assistant

A React Native application with offline AI capabilities and intelligent scheduling, rooted in the Wu Xing (Five Elements) philosophy.

**Status:** 🚧 Phase 2 In Progress - Onboarding & Wu Xing Integration

---

## Overview

**Shifu** is a fully offline-first, privacy-by-design productivity assistant that runs 100% on your device. No company servers. No data collection. Just you, your habits, and an intelligent AI coach.

### Current Features

- 🎨 **Dynamic Wu Xing Theming** - Phase-aware color schemes that adapt to solar time
- 📍 **Location-Based Solar Calculus** - Accurate Roman hour calculations using sunrise/sunset
- 🙏 **Spiritual Practice Integration** - Multi-tradition daily practice scheduler
- 🌓 **Onboarding Flow** - Comprehensive setup for location, practices, and preferences
- 📅 **Agenda Landing** - Quick access to your daily schedule

### Philosophy

Built on Wu Xing (Five Elements) principles with precise solar time calculations:

- 🌳 **Wood** (Hours 21-3) - Growth, planning, vitality. Spiritual centering & movement
- 🔥 **Fire** (Hours 4-6) - Peak energy, expression. Deep work & execution
- 🌍 **Earth** (Hours 7-8) - Stability, nourishment. Lunch & restoration
- 🔧 **Metal** (Hours 9-11) - Precision, organization. Admin & review
- 💧 **Water** (Hours 12-20) - Rest, consolidation. Wind-down & recovery

Each hour is calculated using **unequal day and night Roman hours** based on your location's actual sunrise and sunset times.

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI (optional, but recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/shifu.git
cd shifu

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm start

# Run on web (fastest for development)
npm run web

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm test

# Type check
npm run type-check

# Lint & format
npm run lint
npm run format
```

---

## Project Structure

```
shifu/
├── src/
│   ├── navigation/             # React Navigation setup
│   │   └── RootNavigator.tsx   # Main app navigation with onboarding flow
│   ├── screens/                # UI screens
│   │   ├── onboarding/         # Multi-step onboarding flow
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LocationSetupScreen.tsx
│   │   │   ├── SleepHoursSetupScreen.tsx
│   │   │   ├── WorkHoursSetupScreen.tsx
│   │   │   ├── SpiritualPracticesSetupScreen.tsx
│   │   │   └── LoadingSetupScreen.tsx
│   │   ├── AgendaScreen.tsx    # Main landing screen
│   │   ├── HabitsScreen.tsx
│   │   ├── JournalScreen.tsx
│   │   ├── TasksScreen.tsx
│   │   └── ChatScreen.tsx
│   ├── services/
│   │   ├── PhaseManager.ts     # Wu Xing phase calculations with SunCalc
│   │   └── ThemeManager.ts     # Dynamic theming system
│   ├── stores/                 # Zustand state management
│   │   ├── userStore.ts        # User preferences & onboarding data
│   │   ├── themeStore.ts       # Theme state (phase-aware)
│   │   └── uiStore.ts          # UI state management
│   ├── data/
│   │   └── practices.ts        # Religious & secular practice database
│   ├── components/
│   │   └── BaseScreen.tsx      # Reusable themed screen wrapper
│   ├── utils/
│   │   └── storage.ts          # Platform-aware storage (MMKV/localStorage)
│   ├── db/                     # Database schema (future)
│   └── types/
│       └── navigation.ts       # TypeScript navigation types
├── tests/                      # Test suite
├── babel.config.js             # Babel configuration for Expo
├── jest.config.js              # Jest test configuration
├── tsconfig.json               # TypeScript strict mode enabled
└── README.md                   # This file
```

---

## Key Features

### 🌞 Solar-Based Phase System

The app uses **SunCalc** to calculate precise sunrise and sunset times for your location, then divides:
- **Day** (sunrise to sunset) into 12 unequal "Roman hours" (0-11)
- **Night** (sunset to next sunrise) into 12 unequal hours (12-23)

Each hour is automatically mapped to a Wu Xing phase, creating a natural rhythm that adapts to your latitude and season.

### 🙏 Multi-Tradition Practice Support

Built-in practice database includes:
- **Christianity** - Lauds, Vespers, Compline, Liturgy of the Hours
- **Islam** - Five daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) + Tahajjud
- **Judaism** - Shacharit, Mincha, Ma'ariv, blessings
- **Hinduism** - Sandhyavandanam, Brahma Muhurta, Puja
- **Buddhism** - Meditation practices, Kyoto Zen, Shaolin Kung Fu
- **Shinto** - Daily rituals, cleansing practices
- **Sikhism** - Nitnem (Jap Ji Sahib, Rehraas Sahib, Kirtan Sohila)
- **Wicca** - Daily devotions, protection rituals, Esbat practices
- **Secular** - Meal times, wake-up routines, sunset winddown

Each practice is mapped to specific Roman hours for intelligent scheduling.

### 🎨 Phase-Aware Theming

The UI dynamically updates its color scheme based on the current Wu Xing phase:
- **Dark mode** automatically enabled during Water phase (evening/night)
- **Primary color** shifts to match the current phase
- **Smooth transitions** between phases throughout the day

---

## Development Workflow

### Code Quality

All PRs must pass:

```bash
npm run validate
```

This runs:
- ✅ TypeScript strict type checking
- ✅ ESLint linting
- ✅ Prettier formatting
- ✅ Jest unit tests (12 tests passing)

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Current test coverage:
- ✅ Simple utility tests
- ✅ Jest configuration tests
- ✅ Database schema tests
- ✅ CI integration tests

---

## Architecture Highlights

### 🔐 Privacy-First Design

- **Platform-Aware Storage** - MMKV on native, localStorage on web
- **Local-First State** - Zustand stores with persistence
- **No External APIs** - Core features run entirely offline
- **Optional Location** - Manual entry fallback if permissions denied

### ⚡ Performance

- **Hermes Engine** - JavaScript compiled to bytecode (React Native)
- **MMKV Storage** - ~30× faster than AsyncStorage
- **Lazy Loading** - Screens and data loaded on-demand
- **Minimal Bundle** - Core app < 5MB

### 🎨 UX/Design

- **Wu Xing Color Scheme** - Phase-aware theming throughout
- **Responsive Navigation** - Bottom tabs with Agenda as default
- **Onboarding Reset** - Easy testing with reset button
- **Accessibility** - Semantic components with proper labels

---

## Development Roadmap

### ✅ Phase 1: Infrastructure (Complete)
- Repository & DevOps setup
- ESLint, Prettier, TypeScript strict mode
- GitHub Actions CI/CD
- Basic navigation structure

### 🚧 Phase 2: Onboarding & Wu Xing (In Progress)
- ✅ Multi-step onboarding flow
- ✅ Location detection with manual fallback
- ✅ Wu Xing phase calculations (SunCalc integration)
- ✅ Dynamic theming system
- ✅ Spiritual practices database
- 🔄 Sleep/work hours integration
- 🔄 Phase-aware scheduling

### 📅 Phase 3: Core Features (Planned)
- Habit tracking with phase alignment
- Journal with mood tracking
- Task management with urgency scoring
- AI insights and suggestions

### 🧠 Phase 4: Intelligence (Planned)
- On-device AI models (Transformers.js)
- RAG-powered chat assistant
- Adaptive scheduling
- Hierarchical memory system

---

## Tech Stack

| Layer             | Technology                    | Why                               |
| ----------------- | ----------------------------- | --------------------------------- |
| **App Framework** | React Native 0.82 + Expo 54   | Cross-platform, managed workflow  |
| **Language**      | TypeScript 5.3 (strict mode)  | Type safety, better DX            |
| **State**         | Zustand 5.0                   | Lightweight (~2KB), reactive      |
| **Storage**       | MMKV + localStorage           | Fast, platform-aware              |
| **Solar Calc**    | SunCalc 1.9                   | Precise sunrise/sunset            |
| **Location**      | expo-location                 | Permission handling, coords       |
| **Navigation**    | React Navigation 7            | Industry standard                 |
| **Testing**       | Jest 29 + jest-expo           | Fast, comprehensive               |
| **CI/CD**         | GitHub Actions                | Automated quality checks          |

---

## Contributing

This is an early-stage project. Contributions welcome!

### Getting Started

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make changes and test: `npm run validate`
4. Submit a PR with clear description

### Code Standards

- TypeScript strict mode enabled
- ESLint + Prettier auto-format
- JSDoc comments for public APIs
- Tests for new features

---

## License

MIT License - see LICENSE file for details

---

## Acknowledgments

- **Wu Xing Philosophy** - Ancient wisdom for modern productivity
- **SunCalc** - Accurate solar calculations
- **React Native Community** - Excellent ecosystem
- **Expo** - Simplified React Native development

---

## Support & Feedback

- 🐛 [Report issues](https://github.com/yourusername/shifu/issues)
- 💬 Discussions welcome!

---

**Built with ❤️ for privacy, productivity, and harmony.**
