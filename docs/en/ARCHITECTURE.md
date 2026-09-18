# Architecture

## Principles

The frontend treats admission data as a local data source behind a repository contract. UI components do not know whether the data came from JSON, TXT files, or a future API.

```text
Raw TXT files → importer → generated JSON → repository → TanStack Query → features/routes
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

There is no runtime admissions backend. `admissions.raw.json` is imported by Vite and becomes part of the application bundle. A backend can be introduced later by implementing `AdmissionRepository.list()` without changing the screens.


## Selection state and persistence

Selection membership and ordering are application state, not server state. TanStack Query owns the local admissions dataset, while the selection provider owns a versioned ID-only snapshot in `localStorage`.

The persisted state contains:

- selected source IDs;
- the original selection sequence;
- the current ordered IDs;
- whether the user has created a custom order.

When selections change, the current order is reconciled instead of rebuilt: still-selected choices keep their relative order, removed choices disappear, and newly selected choices are appended. Reset restores the original selection sequence. Bulk ordering operations keep a one-step undo snapshot in memory.

Stable dataset `sourceId` values are used instead of row indexes. On load, saved IDs are pruned against the current dataset so removed records cannot break the application.
