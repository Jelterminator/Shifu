# Shifu

## AI-Powered Productivity Assistant

A React Native application with **offline-first AI capabilities** and sophisticated scheduling, roots in the Wu Xing (Five Elements) philosophy.

**Status:** 🧪 Pre-Beta / Stable for Android & Web

**Note:** Verified stable for **Android** (Native Boot Flow) & **Web** (Custom Store Implementation). iOS pending verification.

---

## Overview

**Shifu** is a fully offline-first, privacy-by-design productivity assistant that runs 100% on your device. No company servers. No data collection. Just you, your habits, and an intelligent AI coach.

### Core Features

- 🧠 **AgentLoop (Offline AI)** - A local LLM orchestrator that plans, routes tools, and chats with you without internet.
- 🎨 **Dynamic Wu Xing Theming** - Phase-aware color schemes that adapt to solar time.
- 📍 **Location-Based Solar Calculus** - Accurate Roman hour calculations using sunrise/sunset to determine energy phases.
- 📅 **SchedulerAI** - Intelligent "Best Fit & Spill" algorithm that generates daily plans respecting your energy phases and boundaries.
- 📱 **Device Calendar Sync** - Read-only integration with your device's native calendar (Android/iOS).
- 💾 **Local-First Architecture** - All data lives in SQLite and a local Vector Store for semantic search.
- 🛡️ **Respectful Planning** - Automatically avoids scheduling tasks during your defined Sleep and Work blocks.
- 📝 **Vector-Based Journaling** - Chat with your past self via semantic search over your journal entries.
- 📦 **Stable Android Startup** - Hardened native boot process with migration safety & background task resilience.
- 🔍 **Hierarchical RAG** - Multi-level semantic retrieval using daily, weekly, and monthly summaries for massive context awareness.

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/Jelterminator/shifu.git
cd shifu

# Install dependencies
npm install

```

### Development

```bash
# Run on web (fastest for development)
# Uses custom 'store.ts' for state management (React 19 compatible)
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
│   ├── components/             # Reusable UI components (Themed)
│   ├── db/                     # Local SQLite Database & Vector Store
│   │   ├── repositories/       # Data access layer (Task, Habit, Plan, etc.)
│   │   ├── schema.ts           # Database schema definitions
│   │   └── vectorStorage.ts    # Semantic search embeddings
│   ├── hooks/                  # Custom React hooks (Theme, User, etc.)
│   ├── navigation/             # Navigation configuration (Tabs + Stacks)
│   ├── screens/                # Application Screens
│   │   ├── onboarding/         # Setup wizard
│   │   ├── AgendaScreen.tsx    # Main daily timeline
│   │   ├── ChatScreen.tsx      # AI Assistant interface
│   │   └── ...
│   ├── services/
│   │   ├── ai/                 # AI Logic Core
│   │   │   ├── AgentLoop.ts    # Main LLM Orchestrator (The Brain)
│   │   │   ├── SchedulerAI.ts  # Heuristic scheduling engine (Best Fit/Spill)
│   │   │   ├── ToolRegistry.ts # AI Tool Definitions
│   │   │   └── Inference.ts    # ONNX Model Interface
│   │   ├── DeviceCalendarSync.ts # Native Calendar Integration
│   │   ├── PhaseManager.ts     # Wu Xing / Solar Time calculations
│   │   └── NotificationService.ts # Local Notifications
│   ├── stores/                 # State Management (Zustand-like custom store)
│   │   ├── userStore.ts        # User preferences & profile
│   │   └── listStore.ts        # Task/Habit list management
│   ├── utils/
│   │   ├── store.ts            # Custom lightweight store implementation
│   │   └── sunTimeUtils.ts     # Solar calculation helpers
│   └── ...
```

---

## Key Architecture

### 🧠 AgentLoop (The Brain)

Shifu runs a quantized LLM directly on your device using **ONNX Runtime** and **Transformers.js**.
- **The Instinct:** Fast embedding-based router selects the right tools for your request.
- **The Brain:** The LLM generates a JSON plan based on available tools.
- **The Body:** Native code executes the plan (e.g., scheduling a task, querying the database).
- **The Voice:** The LLM synthesizes a natural language response.

### 🌞 Solar-Based Phase System

- **SunCalc** integrated for precise sunrise/sunset times based on your location.
- **Roman Hours** calculation (unequal hours) matches your circadian rhythm.
- **Wu Xing Phases** (Wood, Fire, Earth, Metal, Water) map automatically to these solar hours, influencing UI themes and scheduling logic.

### 🤖 SchedulerAI (V1)

The core planning engine uses a deterministic "Best Fit & Spill" algorithm:
1.  **Phase Matching:** Prioritizes tasks that match the current energy phase (e.g., Creative work in Fire phase).
2.  **Best Fit:** Finds the smallest sufficient time slot to preserve large blocks for deep work.
3.  **Spill & Fill:** Splits large tasks into available slots if continuous time isn't available.
4.  **Boundary Respect:** Strictly observes Sleep and Work boundaries.

### 💾 Custom State & Storage

- **Store:** A lightweight `useSyncExternalStore` implementation (`src/utils/store.ts`) ensures React 19 compatibility without external state libraries.
- **Storage:** Hybrid approach using `expo-sqlite` (Native) and `localStorage` (Web) for vector embeddings, with `react-native-mmkv` for fast key-value access.
- **Stability:** Dedicated Android boot flow ensures schema migrations and native module initialization (FileSystem, TaskManager) complete safely before rendering.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Run `npm run validate`
4. Submit PR

## License

MIT License
