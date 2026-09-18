import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { resources } from "./resources"
import { getTelegramWebApp, isTelegramPlatform } from "@/integrations/telegram/telegram"

export type AppLanguage = "ar" | "en"
const STORAGE_KEY = "admission-language"

function initialLanguage(): AppLanguage {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "ar" || stored === "en") return stored

  const telegram = getTelegramWebApp()
  const telegramLanguage =
    telegram && isTelegramPlatform(telegram.platform)
      ? telegram.initDataUnsafe.user?.language_code
      : undefined

  const language = telegramLanguage || navigator.language
  return language.toLowerCase().startsWith("en") ? "en" : "ar"
}

function applyDocumentLanguage(language: string) {
  const normalized: AppLanguage = language.startsWith("en") ? "en" : "ar"
  document.documentElement.lang = normalized
  document.documentElement.dir = normalized === "ar" ? "rtl" : "ltr"
  localStorage.setItem(STORAGE_KEY, normalized)
  if (i18n.isInitialized) document.title = i18n.t("app.title")
}

i18n.on("languageChanged", applyDocumentLanguage)

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage(),
    fallbackLng: "ar",
    interpolation: { escapeValue: false },
    returnNull: false
  })
  .then(() => applyDocumentLanguage(i18n.language))

export async function setAppLanguage(language: AppLanguage) {
  await i18n.changeLanguage(language)
}

export default i18n
