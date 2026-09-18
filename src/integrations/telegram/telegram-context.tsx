import * as React from "react"
import {
  getTelegramWebApp,
  isTelegramPlatform,
} from "./telegram"

interface TelegramContextValue {
  isTelegram: boolean
  webApp: TelegramWebApp | null
  user: TelegramWebAppUser | null
  platform: string | null
  colorScheme: "light" | "dark" | null
  hapticSelection: () => void
  hapticSuccess: () => void
  hapticWarning: () => void
  hapticError: () => void
  hapticImpact: (style?: "light" | "medium" | "heavy" | "rigid" | "soft") => void
}

const TelegramContext = React.createContext<TelegramContextValue | null>(null)

function safeCall(callback: () => void) {
  try {
    callback()
  } catch {
    // Telegram API support varies by client/version; browser mode must remain unaffected.
  }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const webApp = React.useMemo(() => getTelegramWebApp(), [])
  const isTelegram = Boolean(webApp && isTelegramPlatform(webApp.platform))
  const [colorScheme, setColorScheme] = React.useState<"light" | "dark" | null>(
    isTelegram ? webApp?.colorScheme ?? null : null,
  )

  React.useEffect(() => {
    if (!isTelegram || !webApp) return

    document.documentElement.classList.add("telegram-mini-app")
    document.documentElement.dataset.telegramPlatform = webApp.platform

    const syncTheme = () => setColorScheme(webApp.colorScheme)
    webApp.onEvent("themeChanged", syncTheme)

    safeCall(() => webApp.setHeaderColor?.("bg_color"))
    safeCall(() => webApp.setBackgroundColor?.("bg_color"))
    if (webApp.isVersionAtLeast("7.10")) {
      safeCall(() => webApp.setBottomBarColor?.("bottom_bar_bg_color"))
    }

    webApp.ready()
    webApp.expand()

    return () => {
      webApp.offEvent("themeChanged", syncTheme)
      document.documentElement.classList.remove("telegram-mini-app")
      delete document.documentElement.dataset.telegramPlatform
    }
  }, [isTelegram, webApp])


  const value = React.useMemo<TelegramContextValue>(() => ({
    isTelegram,
    webApp,
    user: isTelegram ? webApp?.initDataUnsafe.user ?? null : null,
    platform: isTelegram ? webApp?.platform ?? null : null,
    colorScheme,
    hapticSelection: () => {
      if (isTelegram) safeCall(() => webApp?.HapticFeedback.selectionChanged())
    },
    hapticSuccess: () => {
      if (isTelegram) safeCall(() => webApp?.HapticFeedback.notificationOccurred("success"))
    },
    hapticWarning: () => {
      if (isTelegram) safeCall(() => webApp?.HapticFeedback.notificationOccurred("warning"))
    },
    hapticError: () => {
      if (isTelegram) safeCall(() => webApp?.HapticFeedback.notificationOccurred("error"))
    },
    hapticImpact: (style = "light") => {
      if (isTelegram) safeCall(() => webApp?.HapticFeedback.impactOccurred(style))
    },
  }), [colorScheme, isTelegram, webApp])

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>
}

export function useTelegram() {
  const value = React.useContext(TelegramContext)
  if (!value) throw new Error("useTelegram must be used inside TelegramProvider")
  return value
}

export function useTelegramBackButton(onBack: () => void, visible: boolean) {
  const { isTelegram, webApp } = useTelegram()

  React.useEffect(() => {
    if (!isTelegram || !webApp) return

    if (!visible) {
      webApp.BackButton.hide()
      return
    }

    webApp.BackButton.show()
    webApp.BackButton.onClick(onBack)

    return () => {
      webApp.BackButton.offClick(onBack)
      webApp.BackButton.hide()
    }
  }, [isTelegram, onBack, visible, webApp])
}

export function useTelegramMainButton(options: {
  visible: boolean
  enabled?: boolean
  text: string
  onClick: () => void
}) {
  const { isTelegram, webApp } = useTelegram()
  const { visible, enabled = true, text, onClick } = options

  React.useEffect(() => {
    if (!isTelegram || !webApp) return

    const button = webApp.MainButton

    if (!visible) {
      button.hide()
      return
    }

    if (button.setText) button.setText(text)
    else button.setParams({ text })

    if (enabled) button.enable()
    else button.disable()

    button.onClick(onClick)
    button.show()

    return () => {
      button.offClick(onClick)
      button.hide()
    }
  }, [enabled, isTelegram, onClick, text, visible, webApp])
}
