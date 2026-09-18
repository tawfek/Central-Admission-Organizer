export type TelegramBackendStatus =
  | "not-configured"
  | "idle"
  | "connecting"
  | "connected"
  | "error"

export interface TelegramBackendSession {
  user: {
    id: string
    firstName: string
    lastName?: string
    username?: string
    languageCode?: string
  }
  notificationsEnabled?: boolean
}

function getApiBaseUrl() {
  return import.meta.env.VITE_TELEGRAM_API_URL?.trim().replace(/\/+$/, "") ?? ""
}

export function isTelegramBackendConfigured() {
  return Boolean(getApiBaseUrl())
}

/**
 * Optional secure server boundary for Telegram accounts/notifications.
 *
 * The server MUST validate Telegram initData before creating a session.
 * The bot token belongs only on the server and must never be exposed through
 * VITE_* variables or frontend code.
 */
export async function createTelegramBackendSession(initData: string) {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl || !initData) return null

  const response = await fetch(`${baseUrl}/telegram/session`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ initData }),
  })

  if (!response.ok) {
    throw new Error(`Telegram session failed with HTTP ${response.status}`)
  }

  return await response.json() as TelegramBackendSession
}
