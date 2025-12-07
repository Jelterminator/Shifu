# Shifu

## AI-Powered Productivity Assistant

A React Native application with offline AI capabilities and intelligent scheduling, rooted in the Wu
Xing (Five Elements) philosophy.

**Status:** 🚧 Phase 1 Complete - Infrastructure & Security Setup

---

## Overview

**Shifu** is a fully offline-first, privacy-by-design productivity assistant that runs 100% on your
device. No company servers. No data collection. Just you, your habits, and an intelligent AI coach.

### Core Features (Planned)

- 📅 **Intelligent Scheduler** - Adaptive scheduling with on-device ML that learns your rhythms
- 🌱 **Habit Tracker** - Build consistent habits aligned with natural cycles
- 📔 **Journaling** - Daily reflections with mood tracking and AI insights
- ✓ **Task Management** - Urgency-based prioritization with phase-aware scheduling
- 💬 **AI Coach** - On-device RAG-powered assistant with hierarchical memory
- 🔐 **100% Private** - AES-256 encrypted, zero external servers for core features

### Philosophy

Built on Wu Xing (Five Elements) principles:

- 🌳 **Wood** (Dawn) - Growth, planning, creativity
- 🔥 **Fire** (Late Morning) - Peak energy, action, deep work
- 🌍 **Earth** (Midday) - Balance, integration, grounding
- 🔧 **Metal** (Afternoon) - Organization, refinement, completion
- 💧 **Water** (Evening) - Rest, reflection, renewal

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI (installed globally recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/harmonious-day.git
cd shifu

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Google OAuth credentials

# Validate environment
npm run env:check
```

### Development

```bash
# Start the development server
npm start

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
├── .github/workflows/          # CI/CD pipeline
│   ├── ci.yml                  # Linting, type-check, tests
│   └── linting.yml             # Code quality checks
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # System design & tech stack
│   ├── DESIGN.md               # UI/UX specifications
│   └── ROADMAP.md              # Development roadmap
├── scripts/
│   └── check-env.js            # Environment validation
├── src/
│   ├── navigation/             # React Navigation setup
│   ├── screens/                # UI screens (Agenda, Habits, Journal, etc.)
│   ├── services/
│   │   ├── data/               # Data processing (Habits, Tasks, Summarizer)
│   │   ├── ai/                 # AI services (RAG, Scheduler, Training)
│   │   ├── performance/        # Device tier, memory, battery optimization
│   │   └── sync/               # Google Calendar/Tasks sync
│   ├── db/                     # SQLite database & schema
│   ├── models/                 # TypeScript types & interfaces
│   ├── components/             # Reusable UI components
│   └── utils/
│       ├── config.ts           # Environment & secrets loader
│       ├── encryption.ts       # AES-256 encryption
│       ├── telemetry.ts        # Performance monitoring
│       └── offline.ts          # Offline utilities
├── assets/
│   ├── fonts/                  # Custom fonts
│   └── images/                 # Optimized images
├── models/                     # Quantized AI models (downloaded at runtime)
├── tests/                      # Test suite
├── .env.example                # Environment template (safe to commit)
├── .env.local                  # Secrets (git-ignored, DO NOT COMMIT)
├── .eslintrc.js                # ESLint configuration
├── .prettierrc.js              # Prettier configuration
├── tsconfig.json               # TypeScript strict mode enabled
├── jest.config.js              # Jest test configuration
├── package.json                # Dependencies & scripts
└── README.md                   # This file
```

---

## Environment Setup

### Local Development

1. **Create `.env.local`:**

   ```bash
   cp .env.example .env.local
   ```

2. **Add your Google OAuth credentials** (get from
   [Google Cloud Console](https://console.cloud.google.com/)):

   ```bash
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-secret
   API_BASE_URL=http://localhost:3000
   ```

3. **Validate:**
   ```bash
   npm run env:check
   ```

### GitHub Secrets (CI/CD)

Set these in **Repository Settings → Secrets and variables → Actions:**

- `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `API_BASE_URL` - Your API endpoint (staging/production)

⚠️ **Never** add `GOOGLE_CLIENT_SECRET` to client builds. Secrets are server-side only.

See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) for details.

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
- ✅ Jest unit tests

### Testing

```bash
# Run tests
npm test

# Watch mode
npm test:watch

# Coverage report
npm test:coverage
```

### CI/CD Pipeline

Every push to `master` or `develop` triggers:

1. Linting & Type Checking
2. Unit Tests
3. Environment Validation
4. Build Configuration Test

See `.github/workflows/ci.yml` for details.

---

## Architecture Highlights

### 🔐 Security & Privacy

- **100% Local-First** - All data stored encrypted on-device (AES-256)
- **No Backend Servers** - Core features run entirely offline
- **Optional Cloud Sync** - Google Calendar/Tasks sync is opt-in via OAuth 2.0
- **Data Sovereignty** - User controls all data exports and deletions

### 🧠 AI & Intelligence

- **On-Device Inference** - Quantized ONNX models via Transformers.js
- **Hierarchical RAG** - Memory organized as daily/weekly/monthly/quarterly summaries
- **Adaptive Scheduler** - Hybrid rule-based + ML decision trees that improve nightly
- **Local Training** - Fine-tune models on-device when charging/idle

### ⚡ Performance

- **Hermes Engine** - JavaScript compiled to bytecode for faster startup
- **MMKV Storage** - ~30× faster KV storage than AsyncStorage
- **List Virtualization** - Smooth scrolling with large datasets
- **Lazy Loading** - Models and heavy screens loaded on-demand
- **Device Tier Detection** - Scales AI features based on device capability

### 🎨 UX/Design

- **Wu Xing Color Scheme** - Phase-aware theming throughout
- **Phase Clock** - Persistent background showing current energy phase
- **Smooth Animations** - Reanimated 2 for 60fps interactions
- **Accessibility-First** - WCAG AA contrast, screen reader support, reduced motion

For detailed architecture, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Development Roadmap

### Phase 1: Genesis & Infrastructure ✅ **COMPLETE**

- Repository & DevOps setup
- ESLint, Prettier, TypeScript strict mode
- GitHub Actions CI/CD
- Environment variable security & secrets management

### Phase 2: Data Layer (Next)

- SQLite database with migrations
- MMKV key-value storage
- AES-256 encryption at rest
- Data repositories (Habits, Tasks, Journal)

### Phase 3: UI & Wu Xing Visuals

- Design system implementation
- Phase Clock SVG animation
- Core screens (Agenda, Habits, Journal, Tasks)
- Gesture interactions

### Phase 4-7: Features & AI

- External sync (Google Calendar/Tasks)
- On-device inference (Transformers.js)
- RAG with hierarchical summarization
- Adaptive scheduler with nightly training

For full roadmap, see [docs/ROADMAP.md](docs/ROADMAP.md).

---

## Tech Stack

| Layer             | Technology                    | Why                               |
| ----------------- | ----------------------------- | --------------------------------- |
| **App Framework** | React Native 0.72 + Expo      | Cross-platform, managed workflow  |
| **Language**      | TypeScript (strict mode)      | Type safety, better DX            |
| **State**         | Zustand                       | Lightweight (~2KB), simple API    |
| **Database**      | SQLite + MMKV                 | Serverless, fast, on-device       |
| **Encryption**    | AES-256 (PBKDF2)              | Enterprise security               |
| **UI Components** | NativeBase + React Native SVG | Accessible, themeable             |
| **Navigation**    | React Navigation 6            | Industry standard                 |
| **AI Runtime**    | Transformers.js (ONNX)        | Quantized models, no external API |
| **Testing**       | Jest + React Testing Library  | Fast, comprehensive               |
| **CI/CD**         | GitHub Actions                | Free, integrated                  |

For detailed tech decisions, see
[docs/ARCHITECTURE.md#21-technical-stack](docs/ARCHITECTURE.md#21-technical-stack).

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
- **React Native Community** - Excellent ecosystem
- **Expo** - Simplified React Native development
- **Hugging Face** - Open-source AI models

---

## Support & Feedback

- 📖 See [docs/](docs/) for detailed documentation
- 🐛 [Report issues](https://github.com/yourusername/shifu/issues)
- 💬 Discussions welcome!

---

**Built with ❤️ for privacy, productivity, and harmony.**
