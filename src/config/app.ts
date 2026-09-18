function normalizeUrl(value: string) {
  return value.replace(/\/+$/, "")
}

export function getPublicAppUrl() {
  const configured = import.meta.env.VITE_APP_URL?.trim()
  if (configured) return normalizeUrl(configured)

  if (typeof window !== "undefined") {
    const basePath = import.meta.env.BASE_URL || "/"
    return normalizeUrl(new URL(basePath, window.location.origin).toString())
  }

  return ""
}
