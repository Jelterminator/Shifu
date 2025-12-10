# Shifu

## AI-Powered Productivity Assistant

A React Native application with offline AI capabilities and intelligent scheduling, rooted in the Wu
Xing (Five Elements) philosophy.

**Status:** 🚧 Phase 2 In Progress - Onboarding & Wu Xing Integration

**Note:** Safe for Web & Native (Custom Store Implementation)

---

## Overview

**Shifu** is a fully offline-first, privacy-by-design productivity assistant that runs 100% on your
device. No company servers. No data collection. Just you, your habits, and an intelligent AI coach.

### Current Features

- 🎨 **Dynamic Wu Xing Theming** - Phase-aware color schemes that adapt to solar time
- 📍 **Location-Based Solar Calculus** - Accurate Roman hour calculations using sunrise/sunset
- 🙏 **Spiritual Practice Integration** - Multi-tradition daily practice scheduler
- 🌓 **Onboarding Flow** - Comprehensive setup for location, practices, and preferences
- 📅 **Agenda Landing** - Quick access to your daily schedule

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI

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
# Run on web (fastest for development)
# Note: Uses custom 'store.ts' for state management (Zustand replacement) for max compatibility
npm run web

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm test
```

---

## Project Structure

```
shifu/
├── src/
│   ├── navigation/             # React Navigation setup (RootNavigator + MainTab)
│   ├── screens/                # UI screens
│   │   ├── onboarding/         # Setup flow
│   │   ├── AgendaScreen.tsx    # Main dashboard
│   │   └── ...
│   ├── services/
│   │   ├── PhaseManager.ts     # Wu Xing phase calculations
│   │   └── data/               # Anchors & Practices
│   ├── stores/                 # State management
│   │   ├── userStore.ts        # User state (using custom store)
│   │   └── themeStore.ts       # Theme state (using custom store)
│   ├── utils/
│   │   ├── store.ts            # Custom lightweight store implementation (React 19 compatible)
│   │   ├── storage.native.ts   # Native MMKV storage
│   │   └── storage.web.ts      # Web localStorage
│   └── ...
```

---

## Key Features & Architecture

### 🧠 Custom State Management

To ensure maximum stability across Expo Web and React Native (especially with React 19/concurrent
features), Shifu uses a lightweight custom store implementation (`src/utils/store.ts`) based on
`useSyncExternalStore`. This replaces Zustand to avoid compatibility issues while maintaining a
familiar API.

### 🔐 Multi-Platform Storage

- **Native:** High-performance `react-native-mmkv` via `storage.native.ts`
- **Web:** Standard `localStorage` via `storage.web.ts`
- **Resolution:** Automatically handled by Metro bundler file extensions.

### 🌞 Solar-Based Phase System

- **SunCalc** integrated for precise sunrise/sunset times.
- **Roman Hours** calculation (unequal hours) for accurate circadian alignment.
- **Wu Xing Phases** mapped automatically to solar time.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Run `npm run validate`
4. Submit PR
## Recent Updates

- Refactored database layer with new vector handling.
- Updated state management to custom store implementation.
- Fixed various linting errors and improved TypeScript safety.
- Implemented settings screen and agenda refinements.


## License

MIT License
