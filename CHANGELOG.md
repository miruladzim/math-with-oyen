# Changelog

All notable changes to **Math With Oyen** (`math-adventure`) are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

_Nothing yet._

---

## [0.1.0] - 2026-06-28

First public release. Interactive math learning for primary grades K–5, in **English** and **Bahasa Melayu**, with no account required.

### Development timeline

Work on this site happened in the order below. Everything listed is included in v0.1.0.

#### 1. Project foundation
- Bootstrapped **Vite + React 19 + TypeScript** with React Router and CSS Modules
- Added **PWA** support (service worker, manifest, offline precache)
- Built app shell: Home, Practice, Games, Progress, Teacher routes inside a shared layout
- Added **Oyen** mascot coach, read-aloud toggle, sound toggle, and language toggle (EN / MS)
- Stored student name, grade level, topic progress, badges, and settings in **localStorage**
- Implemented star ratings (0–3 per session), day streak, weekly answered/correct counters
- Added onboarding **“Start here”** CTA with recommended first topic
- Built teacher/parent area with 4-digit PIN (default `1234`), progress summary, and **printable worksheets**

#### 2. Practice mode — first version
- Topic picker filtered by grade level (Sprout K–1, Explorer G2, Builder G3, Champion G4–5)
- **10-question sessions** with multiple-choice and number-input questions
- In-session **adaptive difficulty** (3 correct in a row → harder; 2 wrong → easier)
- Topic-level strategy hints and **“Ask Oyen”** rotating tip pools
- Original topics: counting, shapes, add/sub within 10, add/sub to 100, skip counting, word problems, multiplication, division, multi-digit, fractions
- Deep link support: `/practice?topic=…`

#### 3. Mini games arcade — six games
- **Balloon Pop** — tap the balloon with the correct answer (recommended for K–1)
- **Treasure Dive** — pick the chest with the right number (Grade 2 pick)
- **Rocket Launch** — fuel pods blast the rocket toward the Moon (Grade 3 pick)
- **Crystal Cave** — mine the glowing gem with the answer (Grades 4–5 pick)
- **Number Match** — flip cards and match equations to answers
- **Fraction Pizza** — top the pizza with the correct fraction
- Grade-based game recommendation on Home and Games pages
- Game HUD, victory screen, progress recording tied to related math topics
- Deep link support: `/games?play=…`

#### 4. Game feedback and polish
- **Correct/wrong popups** during games with dismiss-and-retry flow (no silent failures)
- **Confetti** burst on correct answers in supported games
- **Balloon Pop fixes:** cloud drift animation, clearer success overlay, confetti on correct

#### 5. Math Lab — six hands-on modes
- **Pattern Studio** — complete number/color patterns
- **Number Line Jump** — move along a number line to the target
- **Equation Builder** — drag tiles to build true equations
- **Balance Scale** — balance both sides of the scale
- **Sort Squad** — drag values into the correct buckets
- **Think in Steps** — multi-step story problems with guided picks
- Lab shell with 6-round sessions, Lab coach, step guides, mistake alerts, and victory flow
- Lab progress, lab-specific badges, and Home tile
- Deep link support: `/lab?mode=…`
- Pedagogy layout: question above the work area; Oyen above the work block (StrategyPrompt removed from lab UI)

#### 6. Math Lab — bug fixes
- Fixed challenge swapping mid-round when difficulty changed (`roundDifficulty` snapshot)
- **Sort Squad:** cards unlock after a wrong sort; tap an assigned card to unassign
- **Think in Steps:** story picks tracked by part index (handles duplicate numbers); subtraction always uses `a > b`
- **Equation Builder / Pattern Studio:** newly selected tile respected after a wrong attempt
- **Pattern Studio:** duplicate wrong options removed in number mode
- Lab finish check uses functional `setRound` to avoid stale round state

#### 7. Dark mode
- **Light/dark toggle** in the header (🌙 / ☀️), persisted in settings
- Semantic **theme tokens** (`theme-tokens.css`) applied across UI modules
- Game stages stay colorful; chrome (forms, cards, nav) respects dark theme

#### 8. Mobile and layout polish
- **Mobile header:** two-row layout on screens ≤640px (logo + controls on top, nav full width below)
- Safe-area padding and **44px touch targets** on small screens
- **Mini-game layout:** compact Oyen coach on top; question sits flush above answers (`workBlock` pattern in all six games)

#### 9. Bahasa Melayu copy overhaul
- Rewrote ~170 MS strings for natural, kid-friendly Malay (not literal English translation)
- Updated practice hints, Oyen “ask” pools, and Math Lab coach copy in `translations.ts`, `oyenAsk.ts`, and `oyenAskLab.ts`

#### 10. Practice topics expansion (3 → 7 per grade)
- Expanded from **3 topics per grade to 7**
- Added four new foundational topics:
  - **Compare Numbers** — bigger/smaller (choices up to 50)
  - **Number Bonds** — missing addends to 10, 20, and 100
  - **Place Value** — tens, ones, and compose/decompose
  - **Number Patterns** — simple +1 / +2 sequences
- Updated grade descriptions and topic card accent colors for seven topics

#### 11. Practice learning path (soft guidance)
- **Curriculum config** (`practicePath.ts`): ordered units with `core` / `review` / `stretch` roles and optional Lab links
- **“Oyen suggests”** banner and highlighted recommended topic on Practice pick screen
- Step numbers (1–7) and **New / Review / Strong** badges on topic cards
- Smarter recommendations: `getRecommendedTopic()` and `getNextPracticeSteps()` (never-tried core topics, low stars, stale review, low accuracy)
- **Home “Your next steps”** list (top 3 recommended topics)
- **Wrong-answer teaching loop:** show correct answer, Try Again / Next Question, first-attempt scoring only
- **End-of-session recap** for missed questions + optional 3-question retry
- Per-question hints surfaced in Oyen coach after wrong answers
- **Mastery levels** (0–3), saved difficulty between sessions, perfect-session tracking
- Shared **`useAdaptiveDifficulty`** hook
- **Weekly review mix** prompt on Practice when topics need refresh
- Link to **Math Lab** when student struggles (e.g. number bonds → Equation Builder)
- **Progress page:** grade learning path first, mastery pills, other topics under “All topics”

#### 12. Question generator improvements
- Localized math prompts (`{a} {op} {b} = ?`) for EN and MS
- **Word problems** D1–D2: multiple choice with plausible wrong answers; D3: number input
- **Add/sub to 100** D1: multiple choice; D2+ number input
- **Skip counting:** explicit “Skip count by {n}” in the prompt
- **Patterns:** narrowed to +1 and +2 only (distinct from skip counting)
- **Grade 3 number bonds (review):** capped at bonds-to-20
- Smarter wrong answers for multiplication, division, and fractions (same-denominator fraction distractors)
- Hints on number bonds, fractions, word problems, and place value questions

#### 13. GitHub release
- Initial commit, `CHANGELOG.md`, updated `README.md`
- Published to [github.com/miruladzim/math-with-oyen](https://github.com/miruladzim/math-with-oyen) with tag **v0.1.0**

---

### Added (summary)

| Area | Highlights |
|------|------------|
| **Pages** | Home, Practice, Games, Math Lab, Progress, Teacher |
| **Practice topics (14)** | Counting, Shapes, Add/Sub ±10, Add/Sub ±100, Skip Counting, Word Problems, Multiplication, Division, Multi-Digit, Fractions, Compare, Number Bonds, Place Value, Patterns |
| **Games (6)** | Balloon Pop, Treasure Dive, Rocket Launch, Crystal Cave, Number Match, Fraction Pizza |
| **Lab modes (6)** | Pattern Studio, Number Line Jump, Equation Builder, Balance Scale, Sort Squad, Think in Steps |
| **Badges (11)** | First Star, 10/50 Questions, Perfect Score, 3/10-Day Streak, Multiplication Master, Fraction Friend, Lab Explorer, Lab Streak, Lab Perfect |
| **i18n** | Full EN + MS UI, hints, questions, Oyen copy |
| **Accessibility** | Read-aloud, aria-live feedback, progress bars, reduced-motion respect |

### Changed (summary)

- Malay hints and UI copy rewritten for natural kid-friendly tone
- Practice from flat topic list → ordered soft learning path with recommendations
- Question input modes aligned with cognitive load (choices first, number input when harder)
- Progress page from all-topics flat list → grade path + optional enrichment topics

### Fixed (summary)

- Math Lab round stability, Sort Squad unlock, Think Steps duplicates/negatives
- Equation Builder and Pattern Studio post-wrong tile handling
- Balloon Pop visual/animation issues
- Dark mode visibility across CSS modules

### Technical

- Vitest: `starsFromAccuracy`, `getVictoryEncouragement`, `getRecommendedTopic`, `getNextPracticeSteps`, `getWeekStart`
- Build: `npm run build` (Vite + TypeScript)
- Lint: oxlint via `npm run lint`

---

[Unreleased]: https://github.com/miruladzim/math-with-oyen/compare/v0.1.0...HEAD  
[0.1.0]: https://github.com/miruladzim/math-with-oyen/releases/tag/v0.1.0
