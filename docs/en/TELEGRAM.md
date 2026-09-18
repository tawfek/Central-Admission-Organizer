# Telegram Mini App

## BotFather setup

Configure this repository as the bot's **Main Mini App** and use the deployed HTTPS URL:

```text
https://tawfek.github.io/Central-Admission-Organizer/
```

Configured Telegram identifiers:

```text
Bot username: LuckySix7_Bot
Mini App short name: admission
Direct Mini App link: https://t.me/LuckySix7_Bot/admission
Web App URL: https://tawfek.github.io/Central-Admission-Organizer/
```

No separate Telegram frontend is required. The same React application detects Telegram and enables the Mini App integration automatically.

## Implemented integration

When opened inside Telegram the app:

- calls `Telegram.WebApp.ready()` and `expand()`;
- follows Telegram's light/dark color scheme when the app theme is set to System;
- respects Telegram viewport and content safe-area CSS variables;
- uses Telegram's native BackButton on the ordering screen;
- uses Telegram's native MainButton for the admissions "Next" action;
- uses Telegram haptic feedback for selection, successful ordering, warnings, failures, printing and navigation;
- uses the Telegram user's language as the initial Arabic/English preference when the user has not already chosen a language;
- keeps the normal browser experience unchanged.

## Saved selections

Browser mode always persists the versioned selection state in `localStorage`.

Inside Telegram, Bot API 6.9+ clients also synchronize the same compact ID-only selection state with `Telegram.WebApp.CloudStorage`. This provides a cross-device backup associated with the bot/user while retaining localStorage as a fallback.

The cloud payload stores only selected/order IDs and ordering metadata. Admission records themselves remain in the generated static dataset.

## Static-only architecture

The Telegram Mini App intentionally uses no application backend. GitHub Pages serves the complete app, and Telegram's client-side Mini App APIs provide theme, native controls, haptics and CloudStorage.

Telegram user fields exposed to the Mini App are used only for presentation conveniences such as initial language and showing the user's first name. The app does not treat them as a verified application account.

The bot token is not needed by this frontend and must not be stored in the repository.

## Shared selection links

Selection links remain ordinary HTTPS links containing ordered source IDs:

```text
https://tawfek.github.io/Central-Admission-Organizer/#/selection?choices=...
```

This keeps them usable from Telegram, WhatsApp, browsers and any other app. Opening a shared list does not overwrite the visitor's saved draft; the shared list can be edited, sorted, printed and copied again.
