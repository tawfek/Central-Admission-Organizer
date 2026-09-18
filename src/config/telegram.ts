export const TELEGRAM_BOT_USERNAME = "LuckySix7_Bot"
export const TELEGRAM_APP_SHORT_NAME = "admission"

export const TELEGRAM_MINI_APP_URL =
  `https://t.me/${TELEGRAM_BOT_USERNAME}/${TELEGRAM_APP_SHORT_NAME}`

export function buildTelegramMiniAppUrl(startParam?: string) {
  if (!startParam) return TELEGRAM_MINI_APP_URL

  const params = new URLSearchParams({ startapp: startParam })
  return `${TELEGRAM_MINI_APP_URL}?${params.toString()}`
}
