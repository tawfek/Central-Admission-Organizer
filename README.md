# Central Admission Choice Organizer

A modern, static React application for exploring Iraqi central-admission minimum scores, selecting departments, arranging their order, printing the final list, and sharing it through WhatsApp or Telegram.

**No runtime backend or database is required.** The source TXT files are converted to a generated JSON dataset and bundled into the frontend.

- [English documentation](docs/en/README.md)
- [التوثيق العربي](docs/ar/README.md)

## Technology

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- shadcn/ui-style local components + Radix UI
- TanStack Router, Query, and Table
- dnd-kit
- i18next + react-i18next
- Vite PWA
- Vitest

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
src/data/raw/*.txt
       ↓
bun run data:import
       ↓
src/features/admissions/data/admissions.raw.json
       ↓
localAdmissionRepository
       ↓
TanStack Query
       ↓
React UI
```

The application never calls an admissions backend at runtime.

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

العربية:

- [نظرة عامة](docs/ar/README.md)
- [المعمارية](docs/ar/ARCHITECTURE.md)
- [البيانات والاستيراد](docs/ar/DATA.md)
- [النشر](docs/ar/DEPLOYMENT.md)

## Compatibility

The modernization preserves the legacy runtime rule that the ordering step is available from two selections even though old interface copy historically mentioned 15. The rule remains isolated in `src/features/admissions/domain/selection.ts` so it can be changed deliberately later.
