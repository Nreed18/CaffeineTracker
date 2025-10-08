# Caffeine Tracker Design Guidelines

## Design Approach: Design System - Productivity & Data Focus

**Selected Approach:** Modern Design System inspired by productivity tools (Notion, Linear) and health tracking apps (Apple Health, MyFitnessPal)

**Justification:** This is a utility-focused tracking application where efficiency, clarity, and data visualization are paramount. Users need quick drink logging, clear stats display, and easy access to historical data.

**Core Design Principles:**
- Efficiency First: Minimal clicks to log drinks
- Data Clarity: Stats and history presented cleanly
- Scan-able Interface: Quick visual parsing of information
- Print-Optimized: Clean printable layouts

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Background: 0 0% 100% (pure white)
- Surface: 210 20% 98% (soft gray)
- Primary: 200 95% 50% (vibrant blue for actions)
- Text Primary: 222 47% 11% (dark slate)
- Text Secondary: 215 16% 47% (muted slate)
- Success: 142 71% 45% (green for positive stats)
- Warning: 38 92% 50% (amber for high caffeine)
- Border: 214 32% 91% (light borders)

**Dark Mode:**
- Background: 222 47% 11% (deep slate)
- Surface: 217 33% 17% (elevated slate)
- Primary: 199 89% 48% (bright blue)
- Text Primary: 210 20% 98% (off-white)
- Text Secondary: 215 20% 65% (light slate)
- Success: 142 76% 36% (dimmed green)
- Warning: 38 92% 50% (amber)
- Border: 217 33% 23% (dark borders)

### B. Typography

**Font Families:**
- Primary: 'Inter' (Google Fonts) - UI, body text, data
- Display: 'Manrope' (Google Fonts) - Headers, stats numbers

**Type Scale:**
- Hero Stats: text-6xl font-bold (72px) - large stat displays
- Section Headers: text-2xl font-semibold (24px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base (16px)
- Captions/Labels: text-sm text-secondary (14px)
- Micro Text: text-xs (12px)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Micro spacing: p-2, gap-2 (8px)
- Standard spacing: p-4, gap-4, m-6 (16px, 24px)
- Section spacing: py-8, py-12, py-16 (32px, 48px, 64px)
- Component padding: p-6, p-8 (24px, 32px)

**Grid System:**
- Main container: max-w-7xl mx-auto px-4
- Dashboard grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Stats cards: Two-column on tablet, three on desktop

### D. Component Library

**Core UI Elements:**

1. **Drink Logger (Primary Action)**
   - Large, accessible buttons with drink icons (Heroicons)
   - Grid layout: 2 columns mobile, 4 columns desktop
   - Each button: rounded-2xl, p-6, with icon, drink name, caffeine amount
   - Haptic-style feedback with subtle scale transform

2. **Period Selector**
   - Tab navigation for three 5-day periods
   - Active state with primary color underline
   - Segmented control design pattern

3. **Stats Dashboard Cards**
   - Rounded-xl cards with subtle shadows
   - Large number displays (text-5xl) with labels below
   - Icon indicators for context (cup, graph, calendar)
   - Color-coded based on data (green for good, amber for warning)

4. **Data Visualization**
   - Simple bar charts for daily intake (using CSS gradients, no chart library)
   - Horizontal progress bars for averages
   - Sparkline-style mini graphs for trends

5. **History Timeline**
   - Chronological list with date headers
   - Expandable/collapsible day sections
   - Drink items with time stamps and caffeine amounts
   - Subtle zebra striping for scan-ability

6. **Forms & Inputs**
   - Minimal, borderless inputs with bottom border only
   - Focus state: primary color bottom border thickens
   - Dark mode: proper contrast on input backgrounds

**Navigation:**
- Fixed top bar: Logo, Period Selector, Print Button
- Bottom action bar (mobile): Quick drink logging shortcuts
- Breadcrumb navigation for history browsing

**Data Displays:**
- Card-based stat presentation
- Table format for detailed history (printable-friendly)
- Color-coded caffeine levels throughout

**Overlays:**
- Modal for drink customization (caffeine amount override)
- Print preview modal with A4 layout simulation
- Success toast notifications after logging

### E. Animations

**Use Sparingly:**
- Drink log button: Scale 0.95 on press (duration-150)
- Stats update: Fade in new numbers (duration-300)
- Card appearance: Subtle slide-up on load (stagger by 100ms)
- NO scroll animations, NO complex transitions

---

## Images

**No Hero Image Required** - This is a utility app focused on quick access to tracking and data.

**Icons Only:**
- Heroicons for all UI icons (outline style)
- Drink type icons: coffee cup, tea cup, soda can (via Heroicons)
- Stat icons: chart-bar, calendar, trending-up

---

## Print Layout

**Print-Specific Styles (@media print):**
- Remove navigation, hide action buttons
- Black text on white background only
- Expand all collapsed sections
- Single column layout, max-width 8.5"
- Page breaks after each period section
- Show period dates prominently
- Include summary stats box at top
- Footer with generation date

---

## Accessibility & Dark Mode

- Consistent dark mode across all inputs and cards
- Surface elevation hierarchy maintained in dark mode
- Input backgrounds: Slightly lighter than page background
- Focus indicators: 2px ring in primary color
- WCAG AA contrast ratios minimum
- Keyboard navigation for all interactive elements