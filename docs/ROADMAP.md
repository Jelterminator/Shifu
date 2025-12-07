# 🗺️ Harmonious Day — A Roadmap for the App

**Status:** Active Development  
**Repository:** `harmonious-day/`  
**Current Target:** v1.0 (MVP)  
**Principle:** 100% local-first, privacy-by-design, on-device AI.

This document outlines the strategic development phases for **Harmonious Day**, a privacy-first,
fully on-device AI life planner. The roadmap is designed to build the "Body" (UI/Data) first,
followed by the "Brain" (AI/Inference), and finally the "Soul" (Personalization/Evolution).

---

## Vision

**1 year (product milestones)**

- Ship a robust, consumer-friendly **MVP (v1.0)** delivering: secure on-device data storage, habit
  tracker, agenda (phase-driven calendar), journaling, a lightweight on-device AI Coach (quantized
  DistilGPT-2 style chat), and a reliable adaptive scheduler that runs nightly training when the
  device is charging. The app must remain fully usable offline; external syncs (Google/Apple) are
  optional and user-controlled.

**3 years (product horizon)**

- Mature the AI: on-device RAG with hierarchical long-term memory, seamless on-device fine-tuning
  and safe local A/B testing, model compression and hardware acceleration (CoreML / NNAPI / WebGPU
  where available), and cross-device continuity (encrypted user-owned cloud backup optional). Expand
  platform reach (widgets, watch app, voice-first interface) while preserving zero-company-server
  guarantees for core features.

---

## Milestones (high-level releases)

### MVP → Beta → v1.0 → v1.5 → v2.0 (timeline guidance)

- **MVP (v0.9 → v1.0)** — _Weeks 1–12 (core)_  
  Deliver the app shell, encrypted on-device DB (SQLite + MMKV), core UI screens (Agenda, Habits,
  Journal, Tasks, Chat), model loader + simple on-device inference (quantized chat and embedding
  models), and nightly maintenance that summarizes the day and runs light model updates
  (charging-only). Verify scheduler runs on a mid-range Android without crashing.

- **Beta (v1.1 → v1.2)** — _Weeks 13–18_  
  Harden RAG retrieval (local ANN index), roll out the hierarchical summarizer
  (daily→weekly→monthly), enable Google Calendar optional sync UX, instrument telemetry
  (local-only), and invite closed beta testers (TestFlight / Play Console).

- **v1.5 (polish + analytics)** — _Weeks 19–26_  
  UX polish (animations, accessibility), performance and battery tuning, expand Device Tier
  handling, improve model quantization/size and inference latency, and add advanced conflict
  resolution UI for sync.

- **v2.0 (scale & acceleration)** — _Months 9–18_  
  Add CoreML / NNAPI acceleration, witness substantial model compression/2-bit quantization
  experiments where feasible, speech interface, home-screen widgets, watch app companion, and richer
  analytics + planner MLOps (safely deployed on device).

---

## Feature Roadmap (by vertical)

First the work is presented per subject, to provide an overview. Below the roadmap by vertical you
find a coherent plan where the puzzle pieces are put together and a masterplan is created for the
whole project.

---

### Habits

- Recurring habit creation, per-phase scheduling, streaks, weekly stats, habit automation rules
  (e.g., "reschedule if missed twice").
- HabitRepository: CRUD + streak calc + query indices for fast range queries.

### Journaling

- Daily entries, mood (star) rating, auto-save drafts, export, and AI insights (7-day pattern
  detection).
- Daily → weekly → monthly summarizer pipeline; store compressed summary embeddings for retrieval.

### Calendar / Agenda

- Phase clock UI (Wu Xing segments), collapsible timeline, fixed event mapping from external
  calendars, drag/drop reschedule, conflict resolution UI. Visuals and motion conform to design
  system.

### AI Chat (The Coach)

- On-device chat UI (message bubbles, quick actions).
- RAG-backed replies using hierarchical summaries first, raw entries second (fast,
  privacy-preserving retrieval). Context window managed and compressed; conversation memory uses
  summary compression.

### Planner / Scheduler

- Hybrid rule engine (Wu Xing rules + constraints) + ML decision-tree ensemble for scoring &
  slotting tasks. Nightly maintenance triggers incremental training if conditions met (charging,
  battery threshold, idle). A/B test locally before swapping models.

### Analytics & Insights

- Local telemetry (FPS, memory, inference time), weekly productivity reports, habit correlation
  analytics (mood vs habits), and visualization panels. All telemetry stored locally; no external
  telemetry collection by default.

---

### AI Roadmap (detailed)

**Foundational goals:** run practical, safe, and private AI on modern phones with graceful fallbacks
on low-tier hardware.

1. **Model selection & runtime**
   - Use compact architectures: Distil/DistilGPT-style for chat, MiniLM / MiniLM-L6 for embeddings,
     small decision-tree ensembles for scheduling. Prefer ONNX + Transformers.js (WASM) for
     cross-platform inferencing.

2. **Compression & Quantization**
   - Quantize models to 8-bit, 4-bit (and explore newer schemes). Limit installed model set by
     device tier (low/med/high). Keep a model registry with versioning in SQLite.

3. **RAG & Hierarchical Memory**
   - Multi-resolution embeddings: raw (entry-level) + daily/weekly/monthly summary vectors.
     Retrieval first checks summary cache (fast), then falls back to raw ANN search. Use a custom
     ANN index (k-means clustering on SQLite) tuned for small memory & fast CPU.

4. **On-device Training & MLOps**
   - Lightweight incremental training (decision trees / small ensembles) scheduled nightly under
     strict device constraints (charging, battery > threshold, idle). Validate via local A/B tests;
     rollback on regressions. Track model metadata and version in the Model Registry.

5. **Performance & Safety Strategies**
   - Lazy model loading/unloading, context window limits (e.g., 2048 tokens), inference throttling
     on thermal/battery events, graceful degrade to simpler models if memory is short.

6. **Roadmap milestones**
   - **MVP:** quantized chat + embeddings + RAG via summaries (local only).
   - **Beta:** improved ANN index, better quantization, device-tier model selection.
   - **v1.5–v2.0:** on-device training improvements, optional hardware acceleration
     (CoreML/NNAPI/WebGPU), and experimental micro-quantization (2-bit research track).

---

### Performance & Battery Roadmap

**Principles:** never run heavy work on battery, throttle when device is hot, keep UI 60fps.

- **Startup:** Hermes bytecode + `inline require()` for major modules to minimize parse time.
  Lazy-load heavy screens and models.
- **Background tasks:** run summarization/training only when charging + idle + battery thresholds
  (configurable). Use Expo TaskManager / native BGTaskScheduler / WorkManager with platform
  constraints.
- **Memory management:** keep only one large model loaded, explicit unloading on screen exit;
  virtualized lists for long feeds.
- **Device Tiering:** detect device capability (CPU, RAM) and degrade AI features accordingly
  (smaller models, shorter context). Log performance locally to tune thresholds.

**Targets & KPIs**

- Nightly training should not increase battery drain >5% (measured while charging/idle).
- Keep main screens at 60fps on median device; avoid jank greater than 100ms per frame.
- Model inference latency targets: <300ms for embeddings on mid-range devices; <2s for short chat
  responses (quantized models).

---

### Security & Privacy Plan

**Core guarantee:** **All user data and AI computation stay on-device** unless user explicitly
enables a sync. No company-run servers process core features.

- **Encryption & Keys**
  - AES-256 for SQLite and MMKV storage. Keys derived from a device-unique secret
    (biometric/passcode seed) using PBKDF2; keys never leave the device.

- **Data Residency & Exports**
  - Exports require explicit user action and consent. Optional encrypted backups may be supported
    (user-provided cloud), but core product works without any remote account.

- **Model & Runtime Safety**
  - Model files stored locally; signed metadata for integrity checks. Fail-safe: rollback to prior
    model on repeated inference/training failures. Guardrails to avoid runaway background CPU usage.

- **Permissions & Least Privilege**
  - Ask only for necessary permissions (Location coarse for phase times; notifications) and explain
    purpose in onboarding. OAuth tokens (if used) stored encrypted and scoped; user can revoke sync
    anytime.

- **Privacy-First Telemetry**
  - Only local telemetry by default. If any opt-in analytics are implemented, they will be explicit,
    opt-in, and delivered with clear privacy explanations.

---

### UX Roadmap — Animations, Accessibility & Visual Polish

- **Design system**: Inter typography, Wu Xing color scheme, consistent spacing and elevation
  tokens. Phase clock is a persistent background element across screens.

- **Micro-interactions**: smooth checkbox animations, transitions, skeleton screens and
  accessibility-aware reduced-motion mode. Gestures: swipe actions, long-press menus, drag & drop in
  Agenda.

- **Accessibility**: WCAG AA contrast, large touch targets, screen reader labels, dynamic font
  scaling, keyboard navigation. Provide high-contrast theme and reduced motion preference.

- **Polish pass (v1.5)**: refine timing/curves, tune the Phase Clock breathing animation, improve
  skeleton states and loading feedback, finalize app icons and store assets.

---

# The Masterplan in 9 Phases

---

## 📅 Phase 1: Genesis & Infrastructure (Weeks 1-2)

**Goal:** Establish the development environment, DevOps pipeline, and core application scaffolding.
**Technical Focus:** Monorepo setup, CI/CD, Navigation, and Security foundations.

- **Repository & DevOps**
  - [x] Initialize Monorepo structure (client/models/docs).
  - [x] Configure ESLint, Prettier, and TypeScript strict mode.
  - [x] Setup GitHub Actions for automated linting and unit tests (Jest).
  - [x] **Security:** Implement environment variable handling for build secrets.

- **App Scaffolding (React Native + Expo)**
  - [ ] Initialize Expo project (Managed Workflow, latest SDK).
  - [ ] Enable **Hermes Engine** and verify compilation.
  - [ ] Setup **React Navigation v6** (Bottom Tabs + Stacks).
  - [ ] Implement `BaseScreen` component structure per Architecture.
  - [ ] Create placeholder screens: Setup, Agenda, Habits, Journal, Chat.

- **State Management & Persistence**
  - [ ] Install and configure **Zustand** stores (UserStore, UIStore).
  - [ ] Install **MMKV** and wrap in a custom encryption adapter.
  - [ ] Implement Theme Manager (Dark/Light/System) skeleton.

---

## 💾 Phase 2: The Cortex (Data Layer) (Weeks 3-4)

**Goal:** Build the secure, offline-first data persistence layer. **Technical Focus:** SQLite,
Encryption, and Schema Management.

- **Database Engine**
  - [ ] Install `expo-sqlite`.
  - [ ] Implement **AES-256 Encryption** utility (PBKDF2 key derivation).
  - [ ] Create Database Service with migration support.

- **Schema Implementation**
  - [ ] **Habits Table:** ID, name, phase_affinity, streak_count, history_json.
  - [ ] **Tasks Table:** ID, urgency_score, deadline, estimated_duration, project_id.
  - [ ] **Journal Table:** ID, text, mood_score, timestamp.
  - [ ] **Vector Table:** content_id, embedding_blob (binary), type (raw/summary).

- **Data Services**
  - [ ] Build `HabitRepository` (CRUD + stats calculation).
  - [ ] Build `TaskRepository` (CRUD + priority sorting).
  - [ ] Build `JournalRepository`.
  - [ ] **Optimization:** Create indices for frequent queries (date ranges, urgency).

---

## 🎨 Phase 3: The Visage (UI & Wu Xing) (Weeks 5-7)

**Goal:** Implement the visual identity and core user interactions. **Technical Focus:** SVG
Animations, Reanimated 2, Dynamic Styling.

- **Design System**
  - [ ] Implement Typography (Inter) and Color Palettes (Wood, Fire, Earth, Metal, Water).
  - [ ] Create reusable components: `PhaseCard`, `HabitRow`, `TaskChip`.

- **The Phase Clock (Core UI)**
  - [ ] **SVG Implementation:** Draw dynamic arcs based on current time/location.
  - [ ] **Animation:** Implement "Breathing" effect and rotation using `react-native-reanimated`.
  - [ ] **Logic:** Connect to `Anchors.ts` to calculate solar phases based on GPS/Timezone.

- **Core Screens**
  - [ ] **Agenda Screen:** Timeline view, collapsible phase headers.
  - [ ] **Habits Screen:** Interactive checkboxes, streak visualization (🔥).
  - [ ] **Tasks Screen:** Urgency sorting (T1-T6 visual tiers).
  - [ ] **Journal Screen:** Star rating input, text area, auto-save drafts.

---

## 🔌 Phase 4: Integrations & Synchronization (Weeks 8-9)

**Goal:** Connect to the outside world without compromising privacy. **Technical Focus:** OAuth 2.0,
API Client, Sync Logic.

- **Auth & Permissions**
  - [ ] Implement Onboarding Flow (Location, Sleep Hours, Spiritual preferences).
  - [ ] Request permissions: Location (Coarse), Notifications.

- **Google Integration (Client-Side)**
  - [ ] Implement Google Sign-In (OAuth2).
  - [ ] **Calendar Sync:** Fetch events, map to `[FIXED]` blocks in local DB.
  - [ ] **Tasks Sync:** Two-way sync with Google Tasks (optional).

- **Conflict Resolution**
  - [ ] Implement "Last Write Wins" logic for simple conflicts.
  - [ ] Build UI for manual conflict resolution (User decides).

---

## 🧠 Phase 5: Cognition (AI Foundation) (Weeks 10-12)

**Goal:** Enable on-device inference and the Chat interface. **Technical Focus:** Transformers.js,
ONNX Runtime, WebAssembly.

- **Inference Engine**
  - [ ] Integrate **Transformers.js (Xenova)**.
  - [ ] Configure **ONNX Runtime** for React Native (Single-threaded WASM execution).
  - [ ] Implement `ModelLoader`: Download/Cache quantized models on first run.
    - _Target Models:_ `DistilGPT-2` (Chat), `MiniLM` (Embeddings).

- **The Coach (Chat UI)**
  - [ ] Build Chat Interface: Message bubbles, typing indicators.
  - [ ] **Prompt Engineering:** Create system prompts injected with current time/phase context.
  - [ ] **Quick Actions:** Implement chip-based prompts ("Optimize Today", "Add Task").

- **Performance Tuning**
  - [ ] Implement model lazy-loading and unloading to manage RAM.
  - [ ] Add "Device Tier" detection to disable AI on low-end phones.

---

## 📚 Phase 6: Memory & RAG (Weeks 13-15)

**Goal:** Give the AI long-term memory and context awareness. **Technical Focus:** Vector Database,
Embeddings, Hierarchical Summarization.

- **Vector Infrastructure**
  - [ ] Implement embedding generation pipeline (Text -> Vector).
  - [ ] Build **Custom ANN Index** (K-Means) on top of SQLite for fast retrieval.

- **Hierarchical Summarization (The "Secret Sauce")**
  - [ ] **Daily Summarizer:** Script to condense journal + tasks into a summary blob.
  - [ ] **Roll-up Logic:** Weekly -> Monthly -> Quarterly aggregation.
  - [ ] **Storage:** Store summary vectors separately for tiered retrieval.

- **RAG Pipeline**
  - [ ] Implement `ContextRetriever`: Query -> Embed -> Search Vector DB.
  - [ ] **Hybrid Search:** Combine semantic search (vectors) with keyword search (SQL).
  - [ ] Connect RAG output to the Chat interface.

---

## 📅 Phase 7: Evolution (Adaptive Scheduler) (Weeks 16-18)

**Goal:** The self-improving scheduling engine. **Technical Focus:** Decision Trees, Background
Tasks, MLOps.

- **Hybrid Planner**
  - [ ] **Rule Engine:** Implement Wu Xing rules (e.g., "Creativity in Fire Phase").
  - [ ] **Constraint Solver:** Fit tasks into free slots around fixed calendar events.

- **On-Device Training (MLOps)**
  - [ ] **Data Collection:** Log task completions/failures with context features.
  - [ ] **Nightly Pipeline:** Configure `expo-task-manager` for background execution.
  - [ ] **Training:** Implement lightweight Decision Tree training (TensorFlow.js or custom JS
        implementation).
  - [ ] **A/B Testing:** Compare new model vs. old model locally before swapping.

---

## 🧘 Phase 8: Zen & Polish (Weeks 19-20)

**Goal:** Optimization, accessibility, and user experience refinement. **Technical Focus:**
Profiling, Battery Optimization, Accessibility.

- **Performance Optimization**
  - [ ] Profile with React DevTools: Fix re-renders.
  - [ ] **List Virtualization:** Tune `FlatList` for Journal and Task history.
  - [ ] **Startup Time:** Verify Hermes bytecode performance.

- **Battery & Resource Management**
  - [ ] Audit background tasks: Ensure they only run when charging.
  - [ ] Implement "Low Power Mode" (Disable animations, pause AI training).

- **Accessibility & UX**
  - [ ] Audit colors for WCAG AA contrast.
  - [ ] Implement Screen Reader labels.
  - [ ] Add "Reduced Motion" support.
  - [ ] Create "Empty States" and "Error States" (Offline, Sync failed).

---

## 🚀 Phase 9: Dawn (Release Prep) (Week 21+)

**Goal:** Finalize for public release. **Technical Focus:** App Store compliance, Legal,
Documentation.

- **Beta Testing**
  - [ ] Distribute via TestFlight (iOS) and Google Play Console (Android).
  - [ ] Collect telemetry (Locally logged, user-submitted bug reports).

- **Launch Prep**
  - [ ] **Legal:** Draft Privacy Policy (emphasizing 100% local data).
  - [ ] **Assets:** Generate App Store screenshots and icons.
  - [ ] **Final Build:** Create production builds with stripped logs.

---

## 🤝 Contribution Guidelines (Internal Team)

- **Main Dev (Lead):** Focus on Architecture, Database, Data Services, Scheduler Logic, and
  Integration.
- **AI Specialist:** Focus on Phase 5 (Transformers.js), Phase 6 (RAG/Embeddings), and Phase 7
  (Training Pipeline). _Deliverables: Optimized ONNX models and JS inference scripts._
- **Frontend Specialist:** Focus on Phase 3 (UI/Animations) and Phase 8 (Accessibility/Polish).
  _Deliverables: Screen components and SVG animations._

## ⚠️ Critical Checkpoints

1. **Phase 2 Completion:** App must store data reliably encrypted.
2. **Phase 5 Completion:** App must run `DistilGPT-2` on a mid-range Android device without
   crashing.
3. **Phase 7 Completion:** Nightly training must not drain battery >5%.

---

## Risks & Mitigations

1. **Risk — Memory / OOM on low-end devices**  
   _Mitigation:_ Device tier detection; limit loaded models, use smaller quantized models, explicit
   unloads, restrict AI features on low-tier devices.

2. **Risk — Nightly training drains battery / causes thermal issues**  
   _Mitigation:_ Strict gating: training only when charging + battery threshold + idle; throttle
   based on temperature and CPU load; logs and automatic rollback on repeated failures.

3. **Risk — Privacy breach through accidental sync**  
   _Mitigation:_ Make sync opt-in, show clear permissions screens, encrypt tokens locally, provide
   obvious UI for disconnecting and purging synced data.

4. **Risk — Models too large to be practical**  
   _Mitigation:_ Prioritize model compression, per-device model sets, lazy downloads & removal
   policy, investigate hardware acceleration (CoreML/NNAPI) and further quantization.

5. **Risk — UX complexity overwhelms users**  
   _Mitigation:_ Progressive disclosure, gentle onboarding, smart defaults (sensible phase/time
   presets), and ability to toggle AI/autonomy features off.

---

## Appendix — Key technical anchors (short list)

- **DB / Storage:** SQLite (expo-sqlite) for relational + MMKV for KV + AES-256 at rest.
- **AI runtime:** Transformers.js (Xenova) + ONNX quantized models (4/8 bit) with lazy loading.
- **Background tasks:** Expo TaskManager / BGTaskScheduler / WorkManager with charging + idle
  constraints.
- **Frontend:** React Native + Hermes, Reanimated 2, React Native SVG for Phase Clock.

---

## Contribution & Ownership

- **Main Dev (Lead):** architecture, DB, scheduler, release builds.
- **AI Specialist:** model selection, quantization, RAG & on-device training scripts.
- **Frontend Specialist:** UI components, animations, accessibility.
- **QA / Beta:** on-device profiling across low/medium/high device tiers (Android + iOS).

---

_This document is intended to be the canonical roadmap for the GitHub `ROADMAP.md`. For deep system
architecture and design references see `docs/ARCHITECTURE.md` and `docs/DESIGN.md`._
