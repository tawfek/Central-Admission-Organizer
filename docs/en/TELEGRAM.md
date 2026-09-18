# Telegram Mini App

## BotFather setup

Configure this repository as the bot's **Main Mini App** and use the deployed HTTPS URL:

```text
https://tawfek.github.io/Central-Admission-Organizer/
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

## Secure accounts and notifications

The frontend deliberately does **not** trust `initDataUnsafe` for authentication. It may use its language/user fields only for presentation.

For verified Telegram accounts or bot notifications, deploy a server and configure:

```env
VITE_TELEGRAM_API_URL=https://api.example.com
```

The frontend will then POST the raw Telegram `initData` to:

```http
POST /telegram/session
Content-Type: application/json

{
  "initData": "..."
}
```

The server must validate Telegram's signature and `auth_date` before creating a session. The bot token must remain server-side and must never be stored in a `VITE_*` variable or committed to this repository.

Expected session response:

```json
{
  "user": {
    "id": "123456789",
    "firstName": "Tawfeeq",
    "username": "example",
    "languageCode": "ar"
  },
  "notificationsEnabled": false
}
```

The client already exposes `requestWriteAccess()` through the Telegram integration provider for a future notification opt-in UI. Sending bot messages still requires the secure server/Bot API layer.

## Shared selection links

Selection links remain ordinary HTTPS links containing ordered source IDs:

```text
https://tawfek.github.io/Central-Admission-Organizer/#/selection?choices=...
```

This keeps them usable from Telegram, WhatsApp, browsers and any other app. Opening a shared list does not overwrite the visitor's saved draft; the shared list can be edited, sorted, printed and copied again.
