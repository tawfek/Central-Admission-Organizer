import type { Admission } from "@/features/admissions/domain/types"

const SHARED_SELECTION_PARAM = "choices"

export function buildSelectionShareUrl(items: Admission[], appUrl: string) {
  if (!appUrl) return ""

  const base = appUrl.replace(/\/+$/, "")
  const choices = items
    .map((item) => item.sourceId)
    .filter(Boolean)
    .join(",")

  return `${base}/#/selection?${SHARED_SELECTION_PARAM}=${encodeURIComponent(choices)}`
}

export function readSharedSelectionIds(
  hash = typeof window !== "undefined" ? window.location.hash : "",
) {
  const queryIndex = hash.indexOf("?")
  if (queryIndex < 0) return []

  const params = new URLSearchParams(hash.slice(queryIndex + 1))
  const value = params.get(SHARED_SELECTION_PARAM)
  if (!value) return []

  return [
    ...new Set(
      value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ]
}

export async function copyTextToClipboard(text: string) {
  if (!text) throw new Error("Nothing to copy")

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  textarea.style.pointerEvents = "none"

  document.body.appendChild(textarea)
  textarea.select()

  const copied = document.execCommand("copy")
  textarea.remove()

  if (!copied) {
    throw new Error("Clipboard copy failed")
  }
}
