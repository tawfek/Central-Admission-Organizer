# Project overview

This repository modernizes the original Gatsby/Ant Design central-admission helper while preserving its core workflow:

1. Load the generated admissions dataset locally.
2. Filter by score, branch, sex, or name/location text.
3. Select up to 50 departments.
4. Continue to the ordering screen.
5. Reorder manually with drag and drop or use quick ordering tools.
6. Print or share the final sequence.

## User-facing features

- Arabic and English UI with automatic RTL/LTR direction.
- Light, dark, and system appearance modes.
- Responsive desktop table and mobile card layout.
- Branch and sex options derived from the actual dataset rather than hard-coded legacy values.
- Percentage ordering (highest first).
- Iraqi governorate/capital presets plus a custom city/district matcher.
- Stable city prioritization: matching choices move to the top without deleting choices or destroying their internal order.
- WhatsApp and Telegram sharing.
- Printable final form using `VITE_APP_URL` instead of a legacy hostname.
- PWA/offline-capable production build.

See the architecture, data, and deployment documents in this folder for implementation details.
