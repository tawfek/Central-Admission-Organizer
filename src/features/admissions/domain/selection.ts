export const MAX_SELECTION = 50
// Compatibility: the legacy UI copy says 15 minimum, while runtime code enables Next at 2.
export const LEGACY_RUNTIME_MIN_SELECTION = 2

export function canProceed(count: number) {
  return count >= LEGACY_RUNTIME_MIN_SELECTION
}

export function isSelectionWithinLimit(ids: string[]) {
  return ids.length <= MAX_SELECTION
}
