function normalizeUrl(value: string) {
  return value.replace(/\/+$/, "")
}

export function getPublicAppUrl() {
  const configured = import.meta.env.VITE_APP_URL?.trim()
  if (configured) return normalizeUrl(configured)
  if (typeof window !== "undefined") return normalizeUrl(window.location.origin)
  return ""
}
