export {}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }

  interface TelegramWebAppUser {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    is_premium?: boolean
    allows_write_to_pm?: boolean
    photo_url?: string
  }

  interface TelegramWebAppInitData {
    query_id?: string
    user?: TelegramWebAppUser
    start_param?: string
    auth_date?: number
    hash?: string
  }

  interface TelegramThemeParams {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
    header_bg_color?: string
    accent_text_color?: string
    section_bg_color?: string
    section_header_text_color?: string
    subtitle_text_color?: string
    destructive_text_color?: string
    bottom_bar_bg_color?: string
  }

  interface TelegramBackButton {
    isVisible: boolean
    show(): TelegramBackButton
    hide(): TelegramBackButton
    onClick(callback: () => void): TelegramBackButton
    offClick(callback: () => void): TelegramBackButton
  }

  interface TelegramBottomButton {
    isVisible: boolean
    isActive: boolean
    text: string
    show(): TelegramBottomButton
    hide(): TelegramBottomButton
    enable(): TelegramBottomButton
    disable(): TelegramBottomButton
    onClick(callback: () => void): TelegramBottomButton
    offClick(callback: () => void): TelegramBottomButton
    setText?(text: string): TelegramBottomButton
    setParams(params: {
      text?: string
      color?: string
      text_color?: string
      has_shine_effect?: boolean
    }): TelegramBottomButton
  }

  interface TelegramHapticFeedback {
    impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): TelegramHapticFeedback
    notificationOccurred(type: "error" | "success" | "warning"): TelegramHapticFeedback
    selectionChanged(): TelegramHapticFeedback
  }

  interface TelegramCloudStorage {
    setItem(
      key: string,
      value: string,
      callback?: (error: unknown, stored?: boolean) => void,
    ): TelegramCloudStorage
    getItem(
      key: string,
      callback: (error: unknown, value?: string) => void,
    ): TelegramCloudStorage
    removeItem(
      key: string,
      callback?: (error: unknown, removed?: boolean) => void,
    ): TelegramCloudStorage
  }

  interface TelegramWebApp {
    initData: string
    initDataUnsafe: TelegramWebAppInitData
    version: string
    platform: string
    colorScheme: "light" | "dark"
    themeParams: TelegramThemeParams
    isExpanded: boolean
    viewportHeight: number
    viewportStableHeight: number
    BackButton: TelegramBackButton
    MainButton: TelegramBottomButton
    HapticFeedback: TelegramHapticFeedback
    CloudStorage?: TelegramCloudStorage
    ready(): void
    expand(): void
    close(): void
    isVersionAtLeast(version: string): boolean
    setHeaderColor?(color: string): void
    setBackgroundColor?(color: string): void
    setBottomBarColor?(color: string): void
    requestWriteAccess?(callback?: (allowed: boolean) => void): void
    onEvent(eventType: string, callback: () => void): void
    offEvent(eventType: string, callback: () => void): void
  }
}
