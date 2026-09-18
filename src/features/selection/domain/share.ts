import type { TFunction } from "i18next"
import type { Admission } from "@/features/admissions/domain/types"

const SHARED_SELECTION_PARAM = "choices"

export function buildSelectionShareText(items: Admission[], t: TFunction, appUrl: string) {
  const lines = items.map((item, index) => `${index + 1}. ${item.name} — ${item.percent}%`)
  return [t("selection.shareIntro"), "", ...lines, appUrl ? `\n${appUrl}` : ""].filter(Boolean).join("\n")
}

export function buildSelectionShareUrl(items: Admission[], appUrl: string) {
  if (!appUrl) return ""
  const base = appUrl.replace(/\/+$/, "")
  const choices = items.map((item) => item.sourceId).filter(Boolean).join(",")
  return `${base}/#/selection?${SHARED_SELECTION_PARAM}=${encodeURIComponent(choices)}`
}

export function readSharedSelectionIds(hash = typeof window !== "undefined" ? window.location.hash : "") {
  const queryIndex = hash.indexOf("?")
  if (queryIndex < 0) return []

  const params = new URLSearchParams(hash.slice(queryIndex + 1))
  const value = params.get(SHARED_SELECTION_PARAM)
  if (!value) return []

  return [...new Set(value.split(",").map((id) => id.trim()).filter(Boolean))]
}

export function buildTelegramShareText(items: Admission[], t: TFunction) {
  return String(t("selection.telegramShareSummary", { count: items.length }))
}

export function openWhatsAppShare(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
}

export function openTelegramShare(text: string, shareUrl: string) {
  const url = new URL("https://t.me/share/url")
  url.searchParams.set("url", shareUrl)
  if (text) url.searchParams.set("text", text)
  window.open(url.toString(), "_blank", "noopener,noreferrer")
}
