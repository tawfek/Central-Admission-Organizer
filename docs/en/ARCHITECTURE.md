# Architecture

## Principles

The frontend treats admission data as a local data source behind a repository contract. PDF extraction is a build-time concern and never leaks into UI components.

```text
Canonical PDF → coordinate parser → validation → generated JSON → repository → TanStack Query → features/routes
```

## Main areas

- `src/app`: providers, theme state, selection state, router integration.
- `src/i18n`: Arabic/English resources and document direction management.
- `src/features/admissions/domain`: normalization, filtering, labels, selection constraints.
- `src/features/admissions/data`: generated JSON, local repository, TanStack Query options.
- `src/features/admissions/components`: filter controls and responsive results UI.
- `src/features/selection`: drag ordering, Iraqi location presets, automatic ordering, sharing, print view.
- `src/components/ui`: locally owned shadcn/Radix primitives.

## Ordering behavior

Percentage sorting creates a new array ordered by descending score. Location prioritization performs a stable partition: matching choices are placed first and non-matches follow, preserving relative order within both groups. dnd-kit then works against the resulting array, so automatic ordering never disables manual drag-and-drop.

## Backend

There is no runtime admissions backend. `admissions.json` is imported by Vite and becomes part of the application bundle. `admission-import-report.json` records deterministic extraction diagnostics for the canonical PDF. A backend can be introduced later by implementing `AdmissionRepository.list()` without changing the screens.


## Selection state and persistence

Selection membership and ordering are application state, not server state. TanStack Query owns the local admissions dataset, while the selection provider owns a versioned ID-only snapshot in `localStorage`.

The persisted state contains:

- selected source IDs;
- the original selection sequence;
- the current ordered IDs;
- whether the user has created a custom order.

When selections change, the current order is reconciled instead of rebuilt: still-selected choices keep their relative order, removed choices disappear, and newly selected choices are appended. Reset restores the original selection sequence. Bulk ordering operations keep a one-step undo snapshot in memory.

Stable dataset `sourceId` values are used instead of row indexes. On load, saved IDs are pruned against the current dataset so removed records cannot break the application.


## Telegram Mini App adapter

Telegram is an application shell around the same React codebase, not a separate frontend. The integration lives under `src/integrations/telegram` and is inert in ordinary browsers.

Inside Telegram the adapter initializes `Telegram.WebApp`, follows Telegram's system color scheme, respects safe-area/viewport CSS variables, provides BackButton/MainButton hooks and haptic helpers, and exposes display-only Telegram user context.

Selection persistence remains local-first. Telegram clients that support Bot API 6.9+ additionally mirror the compact versioned selection state to `CloudStorage`, giving the bot/user a cross-device backup without introducing a runtime admissions backend.

Verified Telegram identity and outbound bot notifications are a separate security boundary. If `VITE_TELEGRAM_API_URL` is configured, the frontend sends raw `initData` to `POST /telegram/session`; that server must validate Telegram's signature and freshness before trusting the user. Bot tokens are never part of the frontend.
