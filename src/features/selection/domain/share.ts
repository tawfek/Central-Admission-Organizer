import type { TFunction } from "i18next"
import type { Admission } from "@/features/admissions/domain/types"

export function buildSelectionShareText(items: Admission[], t: TFunction, appUrl: string) {
  const lines = items.map((item, index) => `${index + 1}. ${item.name} — ${item.percent}%`)
  return [t("selection.shareIntro"), "", ...lines, appUrl ? `\n${appUrl}` : ""].filter(Boolean).join("\n")
}

export function openWhatsAppShare(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
}

export function openTelegramShare(text: string, appUrl: string) {
  const url = new URL("https://t.me/share/url")
  if (appUrl) url.searchParams.set("url", appUrl)
  url.searchParams.set("text", text)
  window.open(url.toString(), "_blank", "noopener,noreferrer")
}
