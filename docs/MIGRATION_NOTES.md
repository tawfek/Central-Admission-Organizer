# Migration notes

The original Gatsby/Ant Design application remains the behavioral reference, but the new implementation removes obsolete infrastructure and assumptions while preserving the selection workflow.

## Preserved behavior

- Score filtering (`row.percent <= entered score`) and descending score sorting when a score is entered.
- Search by university/department/location text.
- Pagination sizes 50, 100, 150, and 200; default 200.
- Hard maximum of 50 selected departments.
- Page selection, inversion, odd-row, and even-row operations.
- Selection footer and next step.
- Manual drag-and-drop ordering.
- Printing and the two reference PDF downloads.
- PWA/offline-capable static build.

## Updated behavior

- Data is extracted directly from the canonical `public/admission-minimums.pdf`, validated, and bundled from semantic `admissions.json`; there is no runtime admissions backend or TXT intermediary.
- Branch filters are derived from the current data (`علمي`, `ادبي`, `فنون`, `مهني`, or any future value) instead of the obsolete hard-coded `احيائي` / `تطبيقي` list.
- Arabic/English i18n with RTL/LTR switching.
- Light/dark/system themes.
- Responsive mobile cards in addition to the desktop table.
- Quick ordering by percentage or Iraqi location, followed by unrestricted manual drag ordering.
- WhatsApp and Telegram sharing.
- Public URL comes from `VITE_APP_URL` with browser-origin fallback; the legacy hostname is removed.

## Compatibility detail: minimum selections

The historical UI copy mentioned 15 departments, but the actual legacy runtime enabled the next step when more than one row was selected. The rebuild continues to preserve the actual **2+** runtime rule in `src/features/admissions/domain/selection.ts`.
