# Changelog

All notable changes to **Math With Oyen** (math-adventure) are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

_Nothing yet._

## [0.1.0] - 2026-06-28

Initial public release — interactive math learning for primary grades K–5 (English + Bahasa Melayu).

### Added

#### Core app
- Vite + React + TypeScript app with React Router and CSS Modules
- PWA support (service worker, web manifest, offline precache)
- Student name, grade level (K–1, 2, 3, 4–5), and progress stored in `localStorage`
- English and Bahasa Melayu i18n across UI, hints, and question copy
- Read-aloud (Web Speech API) and sound effects toggle
- Home hub with grade picker, practice/games/lab/progress tiles, and parent guide

#### Practice mode
- 14 topics with difficulty tiers 1–3 and 10-question sessions
- Seven topics per grade band with grade-scoped topic lists
- Four foundational topics: Compare Numbers, Number Bonds, Place Value, Number Patterns
- Soft learning path via `practicePath` curriculum (core / review / stretch roles)
- “Oyen suggests” recommendation, step numbers, New / Review / Strong badges
- Smarter recommendations (`getRecommendedTopic`, `getNextPracticeSteps`)
- Wrong-answer flow: reveal correct answer, Try Again / Next, first-attempt scoring only
- End-of-session recap for missed questions with optional 3-question retry
- Per-question hints in Oyen coach (bonds, fractions, word problems, place value)
- Mastery levels (0–3), saved difficulty, perfect-session tracking
- In-session adaptive difficulty (shared `useAdaptiveDifficulty` hook)
- Weekly review mix prompt on Practice pick screen
- Math Lab link when student struggles (topic → lab mode mapping)

#### Mini games (6)
- Balloon Pop, Treasure Dive, Rocket Launch, Crystal Cave, Number Match, Fraction Pizza
- Game coach layout: compact Oyen on top, question flush above answers
- Temporary correct/wrong feedback popups with retry after dismiss
- Confetti on correct answers; improved success overlay transparency (Balloon Pop)
- Cloud drift fix for Balloon Pop

#### Math Lab (6 modes)
- Pattern Studio, Number Line Jump, Equation Builder, Balance Scale, Sort Squad, Think in Steps
- Lab shell, round-based sessions, strategy prompts, step guides, mistake alerts
- Lab progress, badges, and Home tile
- Pedagogy layout: question above solver; Oyen coach above work block

#### Progress & teacher
- Stars, badges, day streak, weekly stats
- Progress page: grade learning path, mastery pills, optional “all topics” section
- Teacher/parent PIN area (default `1234`), dashboard, printable worksheets

#### Theming & layout
- Dark mode toggle in header (persisted in settings)
- Semantic theme tokens (`theme-tokens.css`) and dark polish across modules
- Mobile header: two-row layout on narrow screens, 44px touch targets, safe-area padding

### Changed

- Malay Oyen hints and practice copy rewritten for natural, kid-friendly BM (not literal EN translation)
- Question generators: localized math prompts, choice mode for easier word problems / addSub100 D1
- Smarter distractors for multiplication, division, and fractions
- Patterns narrowed to +1 / +2; skip counting uses explicit “skip by N” prompts
- Grade 3 number bonds capped at 20 when used as review topic

### Fixed

- Math Lab: challenge no longer swaps mid-round when difficulty changes (`roundDifficulty` snapshot)
- Sort Squad: cards unlock after wrong answer; tap assigned card to unassign
- Think Steps: duplicate-number stories handled by story-part index; subtraction enforces `a > b`
- Equation Builder / Pattern Studio: new tile respected after wrong answer; duplicate pattern distractors removed
- Lab finish logic uses functional `setRound` to avoid stale round state

### Technical

- Vitest tests for progress helpers (`starsFromAccuracy`, recommendations, week start)
- `npm run build` and `npm test` verified on release

[Unreleased]: https://github.com/miruladzim/math-with-oyen/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/miruladzim/math-with-oyen/releases/tag/v0.1.0
