# 🎨 Harmonious Day: Design Document

**Version:** 2.0  
**Last Updated:** December 2025  
**Target Platform:** React Native (iOS + Android)

---

## I. Design Philosophy

### Core Principles

**1. Organic Harmony**

- Design reflects natural cycles and rhythms
- Visual language inspired by Wu Xing philosophy
- Smooth, fluid transitions between states
- Minimalist interface that doesn't distract from content

**2. Contextual Intelligence**

- Interface adapts to current phase of day
- Visual feedback for time-sensitive information
- Progressive disclosure: show what matters now

**3. Calm Technology**

- Subtle, non-intrusive notifications
- Thoughtful use of color and animation
- Respects user's attention and mental space

**4. Data Sovereignty**

- Clear visual indicators for sync status
- Transparent about data processing
- User always in control

---

## II. Visual Identity

### Color Palette: Wu Xing Elements

The app uses five primary colors derived from Wu Xing philosophy, each representing a phase of the
day:

```
🌳 WOOD (Dawn/Morning)
  Primary:   #4A7C59 (Forest Green)
  Light:     #7FA88E
  Dark:      #2D5A3A
  Usage:     05:30-09:00 phase, growth activities

🔥 FIRE (Late Morning)
  Primary:   #E63946 (Crimson)
  Light:     #FF6B78
  Dark:      #B8252F
  Usage:     09:00-13:00 phase, peak energy

🌍 EARTH (Midday)
  Primary:   #C49551 (Golden Earth)
  Light:     #E0B478
  Dark:      #9A7138
  Usage:     13:00-15:00 phase, grounding

🔧 METAL (Afternoon)
  Primary:   #A8AAAD (Silver Gray)
  Light:     #D1D3D6
  Dark:      #6F7175
  Usage:     15:00-18:00 phase, organization

💧 WATER (Evening/Night)
  Primary:   #457B9D (Ocean Blue)
  Light:     #6B9FBF
  Dark:      #2D5571
  Usage:     18:00-05:30 phase, rest
```

**Neutral Colors:**

```
Background: #F8F9FA (Off-white)
Surface:    #FFFFFF (Pure white)
Text:       #1A1A1A (Near black)
Divider:    #E0E0E0 (Light gray)
Disabled:   #9E9E9E (Medium gray)
```

**Semantic Colors:**

```
Success:  #4CAF50 (Green)
Warning:  #FF9800 (Orange)
Error:    #F44336 (Red)
Info:     #2196F3 (Blue)
```

### Typography

**Primary Font:** Inter (system fallback: San Francisco/Roboto)

```
Display:      Inter 32px Bold
Heading 1:    Inter 24px Bold
Heading 2:    Inter 20px Semibold
Heading 3:    Inter 18px Semibold
Body Large:   Inter 16px Regular
Body:         Inter 14px Regular
Body Small:   Inter 12px Regular
Caption:      Inter 11px Regular
```

**Line Height:** 1.5x font size  
**Letter Spacing:** -0.02em for headings, 0 for body

### Iconography

- **Style:** Lucide React (consistent, minimal, 2px stroke)
- **Sizes:** 16px (small), 20px (medium), 24px (large), 32px (extra large)
- **Color:** Inherits from parent or phase color

### Spacing System

**Base Unit:** 4px

```
XS:  4px   (0.25rem)
S:   8px   (0.5rem)
M:   16px  (1rem)
L:   24px  (1.5rem)
XL:  32px  (2rem)
XXL: 48px  (3rem)
```

**Component Padding:**

- Screen edges: 16px
- Card padding: 16px
- List item padding: 12px vertical, 16px horizontal

### Elevation & Shadows

```
Level 0 (Flat):      none
Level 1 (Card):      0px 2px 4px rgba(0,0,0,0.06)
Level 2 (Elevated):  0px 4px 8px rgba(0,0,0,0.08)
Level 3 (Floating):  0px 8px 16px rgba(0,0,0,0.12)
Level 4 (Modal):     0px 16px 32px rgba(0,0,0,0.16)
```

### Border Radius

```
Small:   4px  (buttons, chips)
Medium:  8px  (cards, inputs)
Large:   16px (modals, sheets)
Circle:  50%  (avatars, phase indicators)
```

---

## III. Background: Wu Xing Phase Clock

### Concept

Every screen in the app features the same **persistent background element**: a circular clock
divided into five segments representing the Wu Xing phases. This provides constant spatial and
temporal awareness.

### Visual Specifications

**Circle Dimensions:**

- Diameter: 100% of screen width
- Center: Top center of screen (partially visible)
- Only bottom ~40% visible behind content

**Segment Structure:**

```
     🌳 WOOD
    /         \
  💧            🔥
  WATER         FIRE
    \         /
     🔧 --- 🌍
    METAL  EARTH
```

**Phase Segments:**

- Each segment's arc length proportional to actual phase duration
- Current phase highlighted with 20% increased brightness
- Inactive phases at 60% opacity
- Smooth gradient between adjacent phases (10% blend zone)

**Current Time Indicator:**

- White dot at top of circle (12 o'clock position = now)
- 8px diameter with subtle glow effect
- Rotates clockwise as time progresses
- Leaves faint trail (3 previous positions at decreasing opacity)

**Implementation Details:**

```javascript
// React Native SVG Implementation
<Svg height={height} width={width}>
  <Defs>
    <LinearGradient id="woodFire" x1="0" y1="0" x2="1" y2="0">
      <Stop offset="0" stopColor={WOOD_COLOR} />
      <Stop offset="1" stopColor={FIRE_COLOR} />
    </LinearGradient>
    {/* More gradients... */}
  </Defs>

  {/* Phase segments */}
  <Path d={calculateArc(woodPhase)} fill="url(#woodFire)" opacity={0.6} />

  {/* Current time indicator */}
  <Circle cx={centerX} cy={topY} r={4} fill="#FFFFFF" />
</Svg>
```

**Animation:**

- Segments pulse gently during phase transitions (±5% scale over 2s)
- Current time dot moves smoothly (60fps interpolation)
- Phase colors transition gradually over 15 minutes before/after boundary

---

## IV. Screen Specifications

### Navigation Structure

**Bottom Tab Bar:**

```
┌─────────────────────────────────────────┐
│                                         │
│         [Content Area]                  │
│                                         │
├─────────────────────────────────────────┤
│  🌱   📓   📅   ✓   💬                  │
│ Habits Journal Agenda Tasks Chat       │
└─────────────────────────────────────────┘
```

**Tab Bar Specifications:**

- Height: 56px
- Background: Surface color with Level 2 shadow
- Active tab: Current phase color
- Inactive tabs: Disabled gray
- Icon size: 24px
- Label: 11px caption text

**Screen Header (All Screens):**

```
┌─────────────────────────────────────────┐
│  [Screen Title]              [Settings] │
│                                         │
```

- Height: 56px
- Title: Heading 2 (20px Semibold)
- Settings icon: Top right, 24px, opens settings modal

---

### 1. Setup Screen (First Launch Only)

**Purpose:** One-time configuration of location, timezone, and spiritual preferences.

**Flow:**

```
Welcome → Location → Sleep Hours → Work Hours → Spiritual Practices → Loading → Agenda
```

**Screen 1: Welcome**

```
┌─────────────────────────────────────────┐
│                                         │
│         🌿 Harmonious Day               │
│                                         │
│    AI-Powered Daily Planning            │
│    Aligned with Natural Rhythms         │
│                                         │
│        [Get Started]                    │
│                                         │
└─────────────────────────────────────────┘
```

- Logo: 64px, centered
- Subtitle: Body Large, centered
- Button: Primary CTA, phase color (defaults to WOOD)

**Screen 2: Location Setup**

```
┌─────────────────────────────────────────┐
│  📍 Your Location                       │
│                                         │
│  We need your location to calculate    │
│  accurate solar phases and prayer times│
│                                         │
│  [Detect Automatically]                 │
│                                         │
│  Or enter manually:                     │
│  ┌─────────────────────────────────┐   │
│  │ City or Coordinates             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Timezone: [Europe/Amsterdam ▼]        │
│                                         │
│  [← Back]              [Continue →]    │
└─────────────────────────────────────────┘
```

**Screen 3: Work Hours**

```
┌─────────────────────────────────────────┐
│  🕐 Work Hours                          │
│                                         │
│  When do you typically work?           │
│                                         │
│  Monday - Friday                        │
│  ┌───────┐      to      ┌───────┐     │
│  │ 09:00 │              │ 17:00 │     │
│  └───────┘              └───────┘     │
│                                         │
│  Weekend Schedule:                      │
│  ◯ Same as weekdays                    │
│  ◉ Custom hours                        │
│  ◯ No work scheduled                   │
│                                         │
│  [← Back]              [Continue →]    │
└─────────────────────────────────────────┘
```

**Screen 4: Sleeping Hours**

```
┌────────────────────────┐
│ 🕐 Work Hours          │
│                        │
│ When do you sleep?     │
│                        │
│ Monday - Friday        │
│ ┌───────┐ to ┌───────┐ │
│ │ 10:00 │    │ 7:00  │ │
│ └───────┘    └───────┘ │
│                        │
│ Weekend Schedule:      │
│ ◯ Same as weekdays     │
│ ◉ Custom hours         │
│ ◯ No work scheduled    │
│                        │
│ [← Back] [Continue →]  │
└────────────────────────┘
```

**Screen 5: Spiritual Practices**

```
┌─────────────────────────────────────────┐
│  🙏 Spiritual Anchors                   │
│                                         │
│  Select practices to include:           │
│                                         │
│  Christianity                           │
│  ☑ Morning Prayer (Lauds)               │
│  ☐ Evening Prayer (Vespers)             │
│                                         │
│  Islam                                  │
│  ☑ Five Daily Prayers (Salah)           │
│                                         │
│  Judaism                                │
│  ☐ Three Daily Prayers                  │
│                                         │
│  Secular                                │
│  ☑ Three Daily Meals                    │
│  ☑ Morning Meditation                   │
│                                         │
│  [+ Define Custom Practice]             │
│                                         │
│  [← Back]              [Continue →]     │
└─────────────────────────────────────────┘
```

**Screen 6: Loading**

```
┌─────────────────────────────────────────┐
│                                         │
│         🌿 Harmonious Day               │
│                                         │
│    ⏳ Preparing your personalized       │
│       daily rhythm...                   │
│                                         │
│    [Animated phase circle rotation]     │
│                                         │
└─────────────────────────────────────────┘
```

- Shows for 2-3 seconds while:
  - Calculating solar times
  - Generating phase boundaries
  - Creating anchor events
  - Initializing local database

**Return Launch (Logo Screen):**

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│         🌿 Harmonious Day               │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

- Shows for 0.5-1 second while loading data
- Smooth fade transition to Agenda screen

---

### 2. Agenda Screen (Default Screen)

**Purpose:** Central calendar view showing all events, tasks, and habits scheduled for today and
tomorrow.

**Layout:**

```
┌────────────────────────────────────────┐
│  Today                      [Settings] │
├────────────────────────────────────────┤
│                                        │
│  🌳 WOOD PHASE (05:30-09:00)           │
│  ├─ 05:30  ☑ Morning Meditation (15m)  │
│  ├─ 06:00  ☑ Morning Stretch (10m)     │
│  └─ 07:00  ☐ Deep Work: Project X (2h) │
│                                        │
│  🔥 FIRE PHASE (09:00-13:00)           │
│  ├─ 09:00  [FIXED] Team Meeting        │
│  ├─ 10:30  ☐ Code Review (1h)          │
│  └─ 12:00  [ANCHOR] Midday Prayer      │
│                                        │
│  🌍 EARTH PHASE (13:00-15:00)          │
│  └─ 13:00  ☑ Lunch Break (30m)         │
│                                        │
│  [Scroll for more...]                  │
│                                        │
├────────────────────────────────────────┤
│  🌱   📓   📅   ✓   💬                │
└────────────────────────────────────────┘
```

**Key Features:**

1. **Phase Sections**
   - Collapsible headers with phase icon and time range
   - Background tint matching phase color (10% opacity)
   - Current phase has bold header

2. **Event Cards**
   - 8px left border in phase color
   - Checkmark for AI-generated tasks/habits
   - [FIXED] tag for calendar events
   - [ANCHOR] tag for spiritual practices
   - Swipe left reveals: Edit | Delete | Reschedule
   - Long press for drag-and-drop rescheduling

3. **Event Types Visual Distinction:**

   ```
   ☐ Task/Habit     → Checkbox, phase color border
   [FIXED] Event    → Gray background, no checkbox
   [ANCHOR] Practice → Phase color background, no checkbox
   ✓ Completed      → Green checkmark, 60% opacity
   ```

4. **Time Display:**
   - 24-hour format by default
   - Duration in parentheses if < 3 hours
   - "All day" for full-day events

5. **Empty State:**

   ```
   ┌─────────────────────────────────────┐
   │                                     │
   │         ✨                          │
   │    No events scheduled              │
   │                                     │
   │    [+ Add Event]  [Generate Plan]  │
   │                                     │
   └─────────────────────────────────────┘
   ```

6. **Floating Action Button:**
   - Position: Bottom right (16px margins)
   - Icon: Plus sign
   - Color: Current phase color
   - Opens quick add menu:

     ```
     ┌─────────────────────┐
     │ + Add Task          │
     │ + Add Habit         │
     │ + Add Event         │
     │ 🤖 Generate Plan    │
     └─────────────────────┘
     ```

**Date Navigation:**

- Swipe left: Next day
- Swipe right: Previous day
- Top bar shows: "Today" / "Tomorrow" / "Mon, Dec 9"

**Long Press Menu (on event):**

```
┌─────────────────────────────────────┐
│  Morning Meditation                 │
├─────────────────────────────────────┤
│  ✏️ Edit Details                    │
│  🕐 Change Time                     │
│  ✓ Mark Complete                   │
│  🗑️ Delete                          │
└─────────────────────────────────────┘
```

---

### 3. Habits Screen

**Purpose:** Manage recurring habits and view completion statistics.

**Layout:**

```
┌─────────────────────────────────────────┐
│  Habits                      [Settings] │
├─────────────────────────────────────────┤
│                                         │
│  [🕒 Configure Daily Rhythms]          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Today's Progress               │   │
│  │  ████████░░░░░░░░░░  8/12      │   │
│  │  Keep it up! 🔥                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Today's Habits                         │
│  ┌─────────────────────────────────┐   │
│  │ ✓ Morning Meditation            │   │
│  │   🌳 WOOD · 15 min · 7 day 🔥  │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ ☐ Evening Reading               │   │
│  │   💧 WATER · 30 min · 3 day 🔥 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  All Habits                             │
│  ┌─────────────────────────────────┐   │
│  │ ☐ Weekly Review                 │   │
│  │   🔧 METAL · Sun · Inactive     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [+ Add Habit]                          │
├─────────────────────────────────────────┤
│  🌱   📓   📅   ✓   💬                  │
└─────────────────────────────────────────┘
```

**Habit Card Details:**

```
┌─────────────────────────────────────┐
│ ☑ Morning Meditation                │  ← Title + Checkbox
│   🌳 WOOD · 15 min · 7 day 🔥      │  ← Phase · Duration · Streak
│   ────────────────────────────      │  ← Progress bar (this week)
│   M T W T F S S                     │  ← Day indicators
│   ✓ ✓ ✓ ✓ ✓ ○ ○                    │  ← Completion dots
└─────────────────────────────────────┘
```

**Streak Display:**

- 🔥 emoji appears at 3+ day streak
- Number shows current streak
- Background glow effect for 7+ days

**Progress Bar:**

- Weekly completion percentage
- Color: Phase color gradient
- Animated fill on completion

**Add/Edit Habit Modal:**

```
┌─────────────────────────────────────────┐
│  New Habit                    [✕ Close] │
├─────────────────────────────────────────┤
│                                         │
│  Habit Name                             │
│  ┌─────────────────────────────────┐   │
│  │ Morning Meditation              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Duration (minutes)                     │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐              │
│  │ 5 │ │15 │ │30 │ │60 │              │
│  └───┘ └───┘ └───┘ └───┘              │
│  Custom: [_____] min                    │
│                                         │
│  Frequency                              │
│  ◉ Daily                                │
│  ◯ Weekly on: [Mon▼]                   │
│  ◯ Custom schedule                      │
│                                         │
│  Ideal Phase                            │
│  ◯ 🌳 WOOD    ◯ 🔥 FIRE                │
│  ◯ 🌍 EARTH   ◯ 🔧 METAL               │
│  ◉ 💧 WATER                            │
│                                         │
│  Task Type                              │
│  [Movement ▼]                           │
│                                         │
│        [Cancel]        [Save]           │
│                                         │
└─────────────────────────────────────────┘
```

**Configure Daily Rhythms (Link):**

- Opens modal similar to Setup Screen 3, 4 & 5
- Allows editing of sleep/work hours and spiritual practices
- Changes take effect from tomorrow

**Statistics View (Tap on progress bar):**

```
┌───────────────────────────────────────┐
│  Habit Statistics           [✕ Close] │
├───────────────────────────────────────┤
│                                       │
│  Morning Meditation                   │
│  ─────────────────────────────        │
│                                       │
│  Current Streak:  7 days 🔥           │
│  Best Streak:     21 days             │
│  Total Completed: 156 times           │
│  Success Rate:    89%                 │
│                                       │
│  Weekly Pattern:                      │
│  ┌────────────────────────────────┐   │
│  │     ▁ ▃ ▅ █ ▅ ▃ ▁              │   │
│  │   M  T  W  T  F  S  S          │   │
│  └────────────────────────────────┘   │
│                                       │
│  Last 30 Days:                        │
│  ■■■■■■■■■■■■■■■■■■■■■■□□■■■■■■       │
│                                       │
└───────────────────────────────────────┘
```

---

### 4. Journal Screen

**Purpose:** Daily reflection with mood tracking and AI insights.

**Layout:**

```
┌────────────────────────────────────────┐
│  Journal                    [Settings] │
├────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │  Today · December 6, 2025       │   │
│  │                                 │   │
│  │  How was your day?              │   │
│  │  ⭐ ⭐ ⭐ ⭐ ☆                 │   │
│  │                                 │   │
│  │  Your thoughts (0/200)          │   │
│  │  ┌─────────────────────────┐    │   │
│  │  │                         │    │   │
│  │  │                         │    │   │
│  │  │                         │    │   │
│  │  │                         │    │   │
│  │  └─────────────────────────┘    │   │
│  │          [Save Entry]           │   │
│  └─────────────────────────────────┘   │
│  [See Previous Entries →]              │
│                                        │
│  ┌─────────────────────────────────┐   │
│  │  💡 AI Insights                 │   │
│  │  ─────────────────────────────  │   │
│  │                                 │   │
│  │  You've been consistent with    │   │
│  │  morning meditation this week!  │   │
│  │  Your mood tends to improve on  │   │
│  │  days when you exercise.        │   │
│  └─────────────────────────────────┘   │
│                                        │
├────────────────────────────────────────┤
│  🌱   📓   📅   ✓   💬                │
└────────────────────────────────────────┘
```

**Mood Rating:**

- 5 stars (tap to select)

- Colors:

  ```
  1 star:  #F44336 (Red - Depressed)
  2 stars: #FF9800 (Orange - Low)
  3 stars: #FFC107 (Yellow - Neutral)
  4 stars: #8BC34A (Light Green - Good)
  5 stars: #4CAF50 (Green - Ecstatic)
  ```

- Large touch targets (48px minimum)

**Text Input:**

- Multiline text area
- 200 character limit with live counter
- Auto-saves draft every 30 seconds
- Placeholder: "Reflect on your day..."

**AI Insights Section:**

- Updates after journal entry saved
- Uses past 7 days of data
- Identifies patterns:
  - Mood correlations with habits
  - Productive phase patterns
  - Streak encouragement
  - Gentle suggestions

**Notification:**

- Sent at 8:00 PM daily (configurable)
- Title: "How was your day?"
- Body: "Take a moment to reflect in your journal"
- Tapping opens Journal screen

**Previous Entries:**

- Tap to expand full entry
- Swipe left to delete
- Long press for export options

---

### 5. Tasks Screen

**Purpose:** Manage tasks, projects, and todo lists with urgency tracking.

**Layout:**

```
┌─────────────────────────────────────────┐
│  Tasks                       [Settings] │
├─────────────────────────────────────────┤
│  ⚡ Urgent (5)                          │
│  ┌─────────────────────────────────┐   │
│  │ T1 · Project Alpha Phase 2      │   │
│  │ 📅 Due: Dec 8 · 6.5h/day needed│   │
│  │ ▸ 1. Code review (2h)           │   │
│  │ ▸ 2. Bug fixes (3h)             │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ T2 · Write documentation        │   │
│  │ 📅 Dec 10 · 3.2h/day · 8h left │   │
│  └─────────────────────────────────┘   │
│  [View All Urgent →]                    │
│                                         │
│  📋 My Lists                            │
│  ┌─────────────────────────────────┐   │
│  │ 💼 Work (12 tasks)              │   │
│  │ ⚙️ 9-5 · FIRE phase preferred   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🏠 Personal (5 tasks)           │   │
│  │ ⚙️ Anytime                      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 📚 Learning (3 tasks)           │   │
│  │ ⚙️ METAL phase preferred        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [+ Add List]                           │
│                                         │
├─────────────────────────────────────────┤
│  🌱   📓   📅   ✓   💬                  │
└─────────────────────────────────────────┘
```

**Urgency Tiers (from architecture):**

```
T1 (CRITICAL):  Red banner     · >12h/day or <1 day left
T2 (HIGH):      Orange banner  · 6-12h/day needed
T3 (MEDIUM):    Yellow banner  · 3-6h/day needed
T4 (NORMAL):    Green banner   · 1.5-3h/day needed
T5 (LOW):       Blue banner    · 0.75-1.5h/day needed
T6 (CHORES):    Gray banner    · No deadline
```

**Task Card (Expanded):**

```
┌─────────────────────────────────────┐
│ T1 · Project Alpha Phase 2          │
│ ───────────────────────────────     │
│ 📅 Deadline: Dec 8 (2 days)         │
│ ⏱️ Total: 12h · Need 6.5h/day      │
│ 📊 Priority: CRITICAL               │
│                                     │
│ Subtasks:                           │
│ ☑ 1. Setup environment (1h)        │
│ ☐ 2. Code review (2h)              │
│ ☐ 3. Bug fixes (3h)                │
│ ☐ 4. Testing (2h)                  │
│                                     │
│ [✏️ Edit]  [🗑️ Delete]  [⚡ Now]   │
└─────────────────────────────────────┘
```

**List Settings (Tap gear icon):**

```
┌─────────────────────────────────────────┐
│  Work List Settings          [✕ Close] │
├─────────────────────────────────────────┤
│                                         │
│  List Name                              │
│  ┌─────────────────────────────────┐   │
│  │ Work                            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  List Icon                              │
│  💼 📊 💻 📱 🎯 [Custom...]            │
│                                         │
│  Scheduling Preferences                 │
│  ☑ Use work hours (9:00-17:00)         │
│  ☐ Preferred phase: [FIRE ▼]           │
│  ☐ Avoid specific times                │
│                                         │
│  Task Defaults                          │
│  Default duration: [1h ▼]              │
│  Auto-set deadlines: ◯ Yes ◉ No        │
│                                         │
│  Sync Integration                       │
│  Google Tasks: ◉ Enabled ◯ Disabled    │
│  Sync list: [Work Tasks ▼]             │
│                                         │
│  [Delete List]                          │
│                                         │
│        [Cancel]        [Save]           │
│                                         │
└─────────────────────────────────────────┘
```

**Add/Edit Task Modal:**

```
┌─────────────────────────────────────────┐
│  New Task                    [✕ Close] │
├─────────────────────────────────────────┤
│                                         │
│  Task or Project?                       │
│  ◉ Standalone Task  ◯ Project           │
│                                         │
│  Task Name                              │
│  ┌─────────────────────────────────┐   │
│  │ Write quarterly report          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  List                                   │
│  [💼 Work ▼]                            │
│                                         │
│  Duration Estimate                      │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐              │
│  │30m│ │ 1h│ │ 2h│ │ 4h│              │
│  └───┘ └───┘ └───┘ └───┘              │
│  Custom: [___] hours                    │
│                                         │
│  Deadline                               │
│  [📅 Dec 15, 2025]                     │
│  ◯ No deadline (chore)                  │
│                                         │
│  Notes                                  │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│        [Cancel]        [Save]           │
│                                         │
└─────────────────────────────────────────┘
```

**Project View (When task is marked as Project):**

```
┌─────────────────────────────────────────┐
│  ← Project Alpha Phase 2     [✕ Close] │
├─────────────────────────────────────────┤
│                                         │
│  📊 Project Overview                    │
│  ───────────────────────────────       │
│  Deadline: Dec 8 (2 days left)         │
│  Total Effort: 12h                      │
│  Completed: 25% ████░░░░░░░░░░░        │
│  Urgency: T1 (CRITICAL)                 │
│                                         │
│  Subtasks (3/4 remaining)               │
│  ┌─────────────────────────────────┐   │
│  │ ✓ 1. Setup environment (1h)     │   │
│  │   Completed Dec 5               │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ ☐ 2. Code review (2h)           │   │
│  │   📅 Schedule for today         │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ ☐ 3. Bug fixes (3h)             │   │
│  │   📅 Not scheduled              │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ ☐ 4. Testing (2h)               │   │
│  │   📅 Not scheduled              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [+ Add Subtask]                        │
│                                         │
│  [✏️ Edit Project]  [🗑️ Delete]        │
│                                         │
└─────────────────────────────────────────┘
```

**Empty State (No tasks):**

```
┌─────────────────────────────────────┐
│                                     │
│         ✓                           │
│    All tasks complete!              │
│                                     │
│    [+ Add Task]                     │
│                                     │
└─────────────────────────────────────┘
```

---

### 6. Chat Screen

**Purpose:** AI-powered secretary for managing schedule, tasks, and getting advice.

**Layout:**

```
┌─────────────────────────────────────────┐
│  AI Coach                    [Settings] │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🤖                              │   │
│  │ Hi! I'm your AI assistant.      │   │
│  │ I can help you manage your      │   │
│  │ schedule, tasks, and habits.    │   │
│  │                                 │   │
│  │ 10:30 AM                        │   │
│  └─────────────────────────────────┘   │
│                                         │
│         ┌─────────────────────────┐    │
│         │ Add task: Write docs    │    │
│         │ for new feature         │    │
│         │                         │    │
│         │                 10:31 AM│    │
│         └─────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🤖                              │   │
│  │ I've added "Write docs for new  │   │
│  │ feature" to your Work list.     │   │
│  │                                 │   │
│  │ It's due when? And how long     │   │
│  │ will it take?                   │   │
│  │                                 │   │
│  │ 10:31 AM                        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Scroll for more messages...]          │
│                                         │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Type a message...               │   │
│  └─────────────────────────────────┘ 📤│
├─────────────────────────────────────────┤
│  ⚡ Quick Actions                       │
│  [Optimize Today] [Schedule Habit]      │
│  [Add Tasks] [What's Next?]             │
├─────────────────────────────────────────┤
│  🌱   📓   📅   ✓   💬                  │
└─────────────────────────────────────────┘
```

**Message Types:**

1. **AI Messages (Left-aligned):**
   - Background: Light gray card (#F5F5F5)
   - Avatar: 🤖 emoji (24px)
   - Timestamp below message
   - Max width: 80% of screen

2. **User Messages (Right-aligned):**
   - Background: Current phase color (20% opacity)
   - No avatar
   - Timestamp below message
   - Max width: 80% of screen

3. **System Messages (Centered):**
   - Plain text, gray color
   - Timestamps, action confirmations
   - Example: "✓ Task added to Work list"

**Quick Actions Bar:**

- Always visible above keyboard
- Horizontally scrollable chips
- Each chip shows icon + label
- Tapping inserts pre-made prompt

**Quick Action Examples:**

```
"Optimize Today"     → "Can you regenerate my schedule for today?"
"Schedule Habit"     → "Add [habit] to my routine"
"Add Tasks"          → "I need to add multiple tasks..."
"What's Next?"       → "What should I focus on now?"
"Habit Advice"       → "Tips for building consistent habits"
"Mood Check"         → "How have I been feeling lately?"
"Weekly Review"      → "Summarize my week"
"Reschedule"         → "I need to move some tasks around"
```

**Conversation Capabilities:**

1. **Task Management:**
   - "Add 'Buy groceries' to my personal list, due tomorrow, 30 minutes"
   - "Show me all urgent tasks"
   - "Move the code review to Thursday"
   - "Mark morning meditation as complete"

2. **Habit Management:**
   - "Add a reading habit for 30 minutes in the WATER phase"
   - "How's my meditation streak?"
   - "Suggest habits for better sleep"

3. **Schedule Optimization:**
   - "Regenerate today's schedule"
   - "Find time for a 2-hour deep work session"
   - "When's my next free slot?"
   - "Clear tomorrow afternoon"

4. **Analysis & Advice:**
   - "What are my productivity patterns?"
   - "Why am I feeling stressed?"
   - "Tips for staying focused during FIRE phase"
   - "How can I improve my evening routine?"

5. **Batch Operations:**
   - "Add these tasks: [list]"
   - "Create a new list called 'Side Project' with tasks..."
   - "Import habits from my notes"

**AI Response Types:**

1. **Confirmation:**

   ```
   ✓ Done! I've added "Buy groceries" to
   your Personal list for tomorrow.

   [View in Tasks →]
   ```

2. **Clarification:**

   ```
   I can add that task. Just to clarify:

   • Which list? [Work] [Personal] [Other]
   • How long will it take? [30m] [1h] [2h]
   • Any deadline?
   ```

3. **Information:**

   ```
   📊 Your productivity patterns:

   • Most productive: 9-11 AM (FIRE phase)
   • Best for deep work: Mornings
   • Energy dip: 2-3 PM (EARTH phase)
   • Habit completion: 89% this week
   ```

4. **Suggestions:**

   ```
   💡 Based on your schedule:

   You have a free 2-hour block from
   9-11 AM tomorrow. Perfect for that
   urgent code review!

   [Schedule it] [Not now]
   ```

**Contextual Awareness:**

- AI has access to all user data:
  - Current schedule
  - All tasks and projects
  - Habit completion history
  - Journal entries and mood
  - Deadline urgency
- Uses context to provide personalized advice
- References recent patterns and trends

**Error Handling:**

```
❌ I couldn't complete that action.

The task "Team Meeting" is a fixed
calendar event and can't be moved
through chat. You can edit it in your
calendar app.
```

**Long-Running Operations:**

```
⏳ Regenerating your schedule...

This might take a few seconds.

[Progress indicator animation]

✓ Done! Your schedule is ready.
[View in Agenda →]
```

**Empty State (First Time):**

```
┌─────────────────────────────────────┐
│                                     │
│         🤖                          │
│                                     │
│    Hi! I'm your AI assistant.       │
│                                     │
│    I can help you:                  │
│    • Manage your schedule           │
│    • Add and organize tasks         │
│    • Track your habits              │
│    • Provide personalized advice    │
│                                     │
│    Try saying:                      │
│    "What should I focus on now?"    │
│    "Add a task to review PRs"       │
│    "Show my productivity patterns"  │
│                                     │
└─────────────────────────────────────┘
```

**Chat Input:**

- Multiline text input (expands up to 4 lines)
- Send button (paper plane icon)
- Placeholder: "Type a message..."
- Voice input button (optional, uses device STT)

---

## V. Settings Modal

**Accessible from:** Settings icon (⚙️) in top right of any screen

**Layout:**

```
┌─────────────────────────────────────────┐
│  Settings                    [✕ Close] │
├─────────────────────────────────────────┤
│                                         │
│  ⚙️ General                             │
│  ├─ 📍 Location & Timezone              │
│  ├─ 🕐 Work Hours                       │
│  └─ 🙏 Spiritual Practices              │
│                                         │
│  🔔 Notifications                       │
│  ├─ Journal Reminder      [8:00 PM ▼]  │
│  ├─ Morning Briefing      [ Toggle On ] │
│  ├─ Habit Reminders       [ Toggle On ] │
│  └─ Task Deadlines        [ Toggle On ] │
│                                         │
│  🔗 Integrations                        │
│  ├─ Google Calendar       [Connected ✓] │
│  ├─ Google Tasks          [Connected ✓] │
│  └─ Apple Health          [Not Connected]│
│                                         │
│  🎨 Appearance                          │
│  ├─ Theme                 [Auto ▼]      │
│  │   • Light                            │
│  │   • Dark                             │
│  │   • Auto (follows system)            │
│  └─ Accent Color          [Phase ▼]    │
│      • Current Phase (dynamic)          │
│      • Wood Green                       │
│      • Fire Red                         │
│      • Earth Gold                       │
│      • Metal Silver                     │
│      • Water Blue                       │
│                                         │
│  💾 Data & Privacy                      │
│  ├─ Export All Data                     │
│  ├─ Clear Local Cache                   │
│  └─ Delete Account                      │
│                                         │
│  ℹ️ About                               │
│  ├─ Version: 2.0.0                      │
│  ├─ Privacy Policy                      │
│  ├─ Terms of Service                    │
│  └─ Contact Support                     │
│                                         │
└─────────────────────────────────────────┘
```

**Location & Timezone Modal:**

```
┌─────────────────────────────────────────┐
│  Location Settings           [✕ Close] │
├─────────────────────────────────────────┤
│                                         │
│  Current Location                       │
│  The Hague, Netherlands                 │
│  52.01° N, 4.35° E                      │
│                                         │
│  [Detect Automatically]                 │
│                                         │
│  Or enter manually:                     │
│  ┌─────────────────────────────────┐   │
│  │ City or coordinates             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Timezone                               │
│  [Europe/Amsterdam ▼]                   │
│                                         │
│  ℹ️ Used for:                           │
│  • Calculating solar phases             │
│  • Prayer time calculations             │
│  • Schedule optimization                │
│                                         │
│        [Cancel]        [Save]           │
│                                         │
└─────────────────────────────────────────┘
```

**Work Hours Modal:**

```
┌─────────────────────────────────────────┐
│  Work Hours                  [✕ Close] │
├─────────────────────────────────────────┤
│                                         │
│  Monday - Friday                        │
│  ┌───────┐      to      ┌───────┐     │
│  │ 09:00 │              │ 17:00 │     │
│  └───────┘              └───────┘     │
│                                         │
│  Saturday                               │
│  ◯ Same as weekdays                    │
│  ◯ Custom: [____] to [____]            │
│  ◉ No work scheduled                   │
│                                         │
│  Sunday                                 │
│  ◉ No work scheduled                   │
│  ◯ Custom: [____] to [____]            │
│                                         │
│  Breaks                                 │
│  ☑ Lunch break (12:00-13:00)           │
│  ☐ Morning break (10:30-10:45)         │
│  ☐ Afternoon break (15:00-15:15)       │
│                                         │
│  ℹ️ AI will avoid scheduling tasks      │
│  outside these hours unless urgent.     │
│                                         │
│        [Cancel]        [Save]           │
│                                         │
└─────────────────────────────────────────┘
```

**Spiritual Practices Modal:**

- Same as Setup Screen 4
- Shows currently active practices with checkmarks
- Can add/remove at any time
- Changes take effect immediately

**Google Calendar Integration:**

```
┌─────────────────────────────────────────┐
│  Google Calendar             [✕ Close] │
├─────────────────────────────────────────┤
│                                         │
│  Status: Connected ✓                    │
│  Account: user@gmail.com                │
│                                         │
│  Sync Settings                          │
│  ☑ Import calendar events               │
│  ☑ Export generated schedule            │
│  ☑ Two-way sync                         │
│                                         │
│  Calendar Selection                     │
│  ☑ Primary Calendar                     │
│  ☐ Work Calendar                        │
│  ☐ Personal Calendar                    │
│                                         │
│  Sync Frequency                         │
│  ◉ Real-time (when online)              │
│  ◯ Every hour                           │
│  ◯ Manual only                          │
│                                         │
│  Last synced: 2 minutes ago             │
│                                         │
│  [Sync Now]  [Disconnect]               │
│                                         │
└─────────────────────────────────────────┘
```

**Export Data Modal:**

```
┌─────────────────────────────────────────┐
│  Export Data                 [✕ Close] │
├─────────────────────────────────────────┤
│                                         │
│  Export Format                          │
│  ◉ JSON (complete data)                 │
│  ◯ CSV (spreadsheet-friendly)           │
│  ◯ PDF (readable document)              │
│                                         │
│  Include:                               │
│  ☑ Habits                               │
│  ☑ Tasks & Projects                     │
│  ☑ Journal Entries                      │
│  ☑ Schedule History                     │
│  ☑ Settings & Preferences               │
│                                         │
│  Date Range                             │
│  ◉ All time                             │
│  ◯ Last 30 days                         │
│  ◯ Last year                            │
│  ◯ Custom range                         │
│                                         │
│  [Cancel]  [Export & Share]             │
│                                         │
└─────────────────────────────────────────┘
```

---

## VI. Interactions & Animations

### Transitions

**Screen Transitions:**

- Duration: 300ms
- Easing: cubic-bezier(0.4, 0.0, 0.2, 1)
- Type: Slide (horizontal for tabs, vertical for modals)

**Modal Appearance:**

- Backdrop fade: 200ms
- Modal slide up: 300ms
- Spring animation on open (slight bounce)

**Phase Transitions:**

- Duration: 15 minutes before/after boundary
- Background gradient crossfade: 5% opacity change per minute
- Clock segment highlight shifts gradually

### Gestures

**Swipe Actions:**

1. **Agenda/List Items (Swipe Left):**

   ```
   ┌─────────────────────────────────────┐
   │ Morning Meditation      [✏️] [🗑️]  │
   └─────────────────────────────────────┘
   ```

   - Reveal: Edit (blue) | Delete (red)
   - Threshold: 60px
   - Haptic feedback on reveal

2. **Swipe Right (on tasks):**

   ```
   ┌─────────────────────────────────────┐
   │ [✓] Morning Meditation              │
   └─────────────────────────────────────┘
   ```

   - Quick complete action
   - Animates checkmark
   - Success haptic

3. **Date Navigation (Agenda):**
   - Swipe left: Next day
   - Swipe right: Previous day
   - Smooth scroll with momentum

**Long Press:**

- Duration: 500ms
- Haptic feedback at trigger
- Shows context menu or enables drag mode
- Visual feedback: subtle scale (1.02x)

**Drag & Drop (Agenda):**

- Long press to initiate
- Item lifts with shadow (Level 3)
- Snap to valid time slots
- Invalid drops show red indicator
- Success: Green flash + haptic

**Pull to Refresh:**

- Pull down from top of list
- Spinner appears at 60px
- Release to trigger
- Rotates phase circle during refresh

### Loading States

**Skeleton Screens:**

```
┌─────────────────────────────────────┐
│ ████████████░░░░░░░░░░░             │
│ ██████░░░░░░░░░░░░░░░░░             │
│                                     │
│ ████████████░░░░░░░░░░░             │
│ ██████████░░░░░░░░░░░░░             │
└─────────────────────────────────────┘
```

- Shimmer animation (1.5s loop)
- Matches content structure
- Phase color accent

**Progress Indicators:**

- Circular spinner for indeterminate
- Linear progress bar for determinate
- Phase color scheme
- Minimum display time: 300ms

**Button Loading States:**

```
[  ⏳ Saving...  ]  →  [ ✓ Saved! ]
```

- Disable interaction
- Show spinner or progress
- Brief success state (1s)
- Then return to normal

### Micro-interactions

**Checkbox Toggle:**

- Scale: 0.9x → 1.1x → 1.0x (200ms total)
- Color: Gray → Phase color
- Checkmark draws in (100ms)
- Haptic feedback

**Star Rating (Journal):**

- Touch down: Scale 1.2x
- Release: Scale 1.0x
- Fill color animates (150ms)
- Previous stars fill simultaneously
- Haptic on each star

**Phase Clock:**

- Current time dot pulses (2s loop, ±10% scale)
- Segment boundaries glow subtly
- Hover state on interactive elements

**Task Completion:**

1. Checkbox animates ✓
2. Text color fades to gray (300ms)
3. Confetti burst (if >7 day streak)
4. Card slides out (400ms)
5. List reflows smoothly

**Floating Action Button:**

- Idle: Gentle hover animation (2px vertical, 3s loop)
- Pressed: Scale 0.95x
- Menu opens: Rotate 45° (+ becomes ×)
- Menu items cascade in (50ms stagger)

---

## VII. Accessibility

### Touch Targets

**Minimum Sizes:**

- Primary actions: 48×48px
- Secondary actions: 44×44px
- Text links: 44px height
- Spacing between targets: 8px minimum

### Color Contrast

**WCAG AA Compliance:**

- Text on background: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 minimum

**Phase Colors Adjusted for Accessibility:**

- All phase colors tested against white/black backgrounds
- Alternative high-contrast mode available in settings
- Never rely on color alone for information

### Screen Reader Support

**Semantic Labels:**

```javascript
// Example for Agenda event
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Morning Meditation habit"
  accessibilityHint="Double tap to mark complete"
  accessibilityRole="checkbox"
  accessibilityState={{ checked: isComplete }}
>
```

**Navigation:**

- All screens have clear headings
- Focus order follows visual layout
- Skip links for repetitive navigation
- Announcements for dynamic content changes

### Reduced Motion

**Settings Option:**

- Respect system preference
- Disable phase clock animation
- Use crossfade instead of slides
- Remove confetti and decorative animations
- Keep functional animations (loading, etc.)

### Font Scaling

- Support Dynamic Type (iOS) / Font Scale (Android)
- Test at 200% zoom
- Layouts reflow gracefully
- Minimum font size: 11px (even when scaled down)

### Keyboard Navigation (External Keyboard Support)

- Tab through interactive elements
- Enter/Space to activate
- Escape to close modals
- Arrow keys for list navigation
- Cmd+Number for tab switching (iOS)

---

## VIII. Edge Cases & Error States

### Network Connectivity

**Offline Mode:**

```
┌─────────────────────────────────────┐
│  ⚠️ You're offline                   │
│                                     │
│  Some features are limited:         │
│  • Can't sync with Google           │
│  • AI chat unavailable              │
│  • Schedule generation limited      │
│                                     │
│  Your data is safe and will sync    │
│  when you're back online.           │
│                                     │
│  [Dismiss]                          │
└─────────────────────────────────────┘
```

**Sync Conflicts:**

```
┌─────────────────────────────────────┐
│  🔄 Sync Conflict                    │
│                                     │
│  "Team Meeting" was changed in both │
│  places:                            │
│                                     │
│  Your version:                      │
│  • Time: 2:00 PM                    │
│                                     │
│  Calendar version:                  │
│  • Time: 3:00 PM                    │
│                                     │
│  Which should we keep?              │
│                                     │
│  [Keep Mine] [Keep Calendar]        │
│  [View Both]                        │
│                                     │
└─────────────────────────────────────┘
```

**Slow Connection:**

- Show loading state after 2s
- Timeout after 30s
- Option to retry or cancel
- Cache last known good state

### Data Validation

**Invalid Input:**

```
┌─────────────────────────────────┐
│ Habit Name                      │
│ ┌─────────────────────────┐   │
│ │                         │   │
│ └─────────────────────────┘   │
│ ⚠️ Name cannot be empty        │
└─────────────────────────────────┘
```

- Inline validation
- Clear error messages
- Prevent save until fixed
- Highlight problematic fields

**Scheduling Conflicts:**

```
⚠️ This creates an overlap with:
   "Team Meeting" (2:00-3:00 PM)

Continue anyway? [Yes] [No] [Reschedule]
```

### Empty States

**No Internet (First Launch):**

```
┌─────────────────────────────────────┐
│         📡                           │
│                                     │
│    No Internet Connection           │
│                                     │
│    Harmonious Day needs internet    │
│    for first-time setup.            │
│                                     │
│    Please connect and try again.    │
│                                     │
│    [Retry]                          │
│                                     │
└─────────────────────────────────────┘
```

**No Habits Configured:**

```
┌─────────────────────────────────────┐
│         🌱                           │
│                                     │
│    Start Building Habits            │
│                                     │
│    Add your first habit to begin    │
│    tracking your daily routine.     │
│                                     │
│    [+ Add First Habit]              │
│                                     │
└─────────────────────────────────────┘
```

**Empty Calendar Day:**

```
┌─────────────────────────────────────┐
│         ✨                           │
│                                     │
│    A Blank Canvas                   │
│                                     │
│    No events scheduled for today.   │
│    Want to generate a plan?         │
│                                     │
│    [🤖 Generate Plan]               │
│    [+ Add Event]                    │
│                                     │
└─────────────────────────────────────┘
```
