# Math With Oyen

An interactive math learning web app for primary school kids (grades K–5). Practice quizzes, mini-games, Math Lab manipulatives, stars, badges, read-aloud support, and a teacher/parent area — English and Bahasa Melayu, no account required.

**Live app:** [https://miruladzim.github.io/math-with-oyen/](https://miruladzim.github.io/math-with-oyen/)

## Features

- **Practice** — 14 topics, soft learning path, wrong-answer teaching loop, mastery tracking, Oyen coaching
- **Mini games** — Balloon Pop, Treasure Dive, Rocket Launch, Crystal Cave, Number Match, Fraction Pizza
- **Math Lab** — Pattern Studio, Number Line, Equation Builder, Balance Scale, Sort Squad, Think in Steps
- **Progress** — Stars, mastery, badges, streaks (localStorage)
- **i18n** — English + Bahasa Melayu
- **Accessibility** — Read-aloud toggle, dark mode, mobile-friendly header
- **Teacher area** — PIN dashboard and printable worksheets (default PIN: `1234`)

See [CHANGELOG.md](./CHANGELOG.md) for full release history.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Run Vitest tests |

## Tech Stack

- Vite 8, React 19, TypeScript
- React Router, CSS Modules
- vite-plugin-pwa
- Web Speech API, Web Audio API

## License

Public repository — all rights reserved unless otherwise noted by the repository owner.
