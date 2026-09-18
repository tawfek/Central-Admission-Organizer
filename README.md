# Central Admission Choice Organizer

A modern, static React application for exploring Iraqi central-admission minimum scores, selecting departments, arranging their order, printing the final list, and sharing editable ordered-selection links.

**No runtime backend or database is required.** A build-time PDF importer converts the canonical admission-minimums PDF directly into a validated JSON dataset bundled with the frontend.

- [English documentation](docs/en/README.md)
- [التوثيق العربي](docs/ar/README.md)

## Screenshots

| Admissions & filtering | Selection & ordering |
| --- | --- |
| ![Admissions screen](public/1.png) | ![Selection screen](public/2.png) |
| ![Admissions mobile view](public/3.png) | ![Ordered choices view](public/4.png) |

## Technology

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- shadcn/ui-style local components + Radix UI
- TanStack Router, Query, and Table
- dnd-kit
- i18next + react-i18next
- Vite PWA
- Bun test runner
- Telegram Mini App integration (theme, native navigation/actions, haptics, CloudStorage)

## Telegram Mini App

The deployed app is also configured for Telegram:

```text
https://t.me/LuckySix7_Bot/admission
```

The frontend does not require the bot token. The application remains fully static on GitHub Pages.

## Quick start

```bash
bun install
cp .env.example .env
bun run data:import
bun run dev
```

On Windows CMD, copy the environment example with:

```cmd
copy .env.example .env
```

`VITE_APP_URL` is a public canonical URL only; it is not a secret. If it is omitted, the app uses the current browser origin for print/share links.

## Data flow

```text
public/admission-minimums.pdf
       ↓
bun run data:import
       ↓
PDF coordinate parser + validation
       ↓
src/features/admissions/data/admissions.json
       +
src/features/admissions/data/admission-import-report.json
       ↓
localAdmissionRepository
       ↓
TanStack Query
       ↓
React UI
```

The application never calls an admissions backend at runtime.

Selection membership and drag order are autosaved locally in the browser. Going back to add or remove departments preserves the existing order: removed choices disappear and new choices are appended.

## Commands

```bash
bun run dev
bun run data:import
bun run typecheck
bun run test
bun run build
bun run preview
```

## Documentation

English:

- [Overview](docs/en/README.md)
- [Architecture](docs/en/ARCHITECTURE.md)
- [Data and importing](docs/en/DATA.md)
- [Deployment](docs/en/DEPLOYMENT.md)
- [Telegram Mini App](docs/en/TELEGRAM.md)

العربية:

- [نظرة عامة](docs/ar/README.md)
- [المعمارية](docs/ar/ARCHITECTURE.md)
- [البيانات والاستيراد](docs/ar/DATA.md)
- [النشر](docs/ar/DEPLOYMENT.md)
- [Telegram Mini App](docs/ar/TELEGRAM.md)

## Compatibility

The modernization preserves the legacy runtime rule that the ordering step is available from two selections even though old interface copy historically mentioned 15. The rule remains isolated in `src/features/admissions/domain/selection.ts` so it can be changed deliberately later.
