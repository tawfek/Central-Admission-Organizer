const TELEGRAM_CLOUD_SELECTION_KEY = "central-admission-selection-v1"

export function getTelegramWebApp() {
  if (typeof window === "undefined") return null
  return window.Telegram?.WebApp ?? null
}

export function isTelegramPlatform(platform: string | null | undefined) {
  return Boolean(platform && platform !== "unknown")
}

export function isTelegramMiniApp() {
  const webApp = getTelegramWebApp()
  return Boolean(webApp && isTelegramPlatform(webApp.platform))
}

export function getTelegramCloudStorage() {
  const webApp = getTelegramWebApp()
  if (!webApp || !isTelegramPlatform(webApp.platform)) return null
  if (!webApp.isVersionAtLeast("6.9")) return null
  return webApp.CloudStorage ?? null
}

export function readTelegramCloudSelection() {
  const storage = getTelegramCloudStorage()
  if (!storage) return Promise.resolve<string | null>(null)

  return new Promise<string | null>((resolve) => {
    storage.getItem(TELEGRAM_CLOUD_SELECTION_KEY, (error, value) => {
      if (error || !value) {
        resolve(null)
        return
      }
      resolve(value)
    })
  })
}

export function writeTelegramCloudSelection(value: string) {
  const storage = getTelegramCloudStorage()
  if (!storage) return Promise.resolve(false)

  return new Promise<boolean>((resolve) => {
    storage.setItem(TELEGRAM_CLOUD_SELECTION_KEY, value, (error, stored) => {
      resolve(!error && stored !== false)
    })
  })
}


const TELEGRAM_LAUNCH_HASH_KEYS = [
  "tgWebAppData=",
  "tgWebAppVersion=",
  "tgWebAppPlatform=",
  "tgWebAppThemeParams=",
  "tgWebAppStartParam=",
]

export function isTelegramLaunchHash(hash: string) {
  if (!hash || hash.startsWith("#/")) return false
  return TELEGRAM_LAUNCH_HASH_KEYS.some((key) => hash.includes(key))
}

/**
 * Telegram launches Mini Apps with its initialization payload in the URL hash.
 * This app also uses hash routing, so the Telegram fragment would otherwise be
 * interpreted as a TanStack Router route and render the 404 page.
 *
 * telegram-web-app.js is loaded synchronously in <head>, so Telegram has already
 * parsed the launch payload before this function replaces the visible fragment.
 */
export function normalizeTelegramLaunchHash() {
  if (typeof window === "undefined") return false
  if (!isTelegramLaunchHash(window.location.hash)) return false

  const nextUrl =
    `${window.location.pathname}${window.location.search}#/`

  window.history.replaceState(window.history.state, "", nextUrl)
  return true
}
