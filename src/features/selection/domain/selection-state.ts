export const SELECTION_STORAGE_VERSION = 1

export interface PersistedSelectionState {
  version: typeof SELECTION_STORAGE_VERSION
  selectedIds: string[]
  selectionSequenceIds: string[]
  orderedIds: string[]
  hasCustomOrder: boolean
}

const unique = (ids: string[]) => [...new Set(ids.filter(Boolean))]

export function createEmptySelectionState(): PersistedSelectionState {
  return {
    version: SELECTION_STORAGE_VERSION,
    selectedIds: [],
    selectionSequenceIds: [],
    orderedIds: [],
    hasCustomOrder: false,
  }
}

export function normalizePersistedSelectionState(value: unknown): PersistedSelectionState {
  if (!value || typeof value !== "object") return createEmptySelectionState()

  const candidate = value as Partial<PersistedSelectionState>
  if (candidate.version !== SELECTION_STORAGE_VERSION) return createEmptySelectionState()

  const selectedIds = unique(Array.isArray(candidate.selectedIds) ? candidate.selectedIds.map(String) : [])
  const selectedSet = new Set(selectedIds)

  const sequence = unique(
    Array.isArray(candidate.selectionSequenceIds)
      ? candidate.selectionSequenceIds.map(String).filter((id) => selectedSet.has(id))
      : [],
  )
  const sequenceSet = new Set(sequence)
  const selectionSequenceIds = [...sequence, ...selectedIds.filter((id) => !sequenceSet.has(id))]

  const ordered = unique(
    Array.isArray(candidate.orderedIds)
      ? candidate.orderedIds.map(String).filter((id) => selectedSet.has(id))
      : [],
  )
  const orderedSet = new Set(ordered)
  const orderedIds = [...ordered, ...selectionSequenceIds.filter((id) => !orderedSet.has(id))]

  return {
    version: SELECTION_STORAGE_VERSION,
    selectedIds: selectionSequenceIds,
    selectionSequenceIds,
    orderedIds,
    hasCustomOrder: selectedIds.length > 0 && Boolean(candidate.hasCustomOrder),
  }
}

export function reconcileSelectionState(
  state: PersistedSelectionState,
  nextSelectedIds: string[],
): PersistedSelectionState {
  const requested = unique(nextSelectedIds)
  const requestedSet = new Set(requested)

  const preservedSelected = state.selectedIds.filter((id) => requestedSet.has(id))
  const preservedSet = new Set(preservedSelected)
  const additions = requested.filter((id) => !preservedSet.has(id))
  const selectedIds = [...preservedSelected, ...additions]
  const selectedSet = new Set(selectedIds)

  const preservedSequence = state.selectionSequenceIds.filter((id) => selectedSet.has(id))
  const sequenceSet = new Set(preservedSequence)
  const selectionSequenceIds = [
    ...preservedSequence,
    ...selectedIds.filter((id) => !sequenceSet.has(id)),
  ]

  const preservedOrder = state.orderedIds.filter((id) => selectedSet.has(id))
  const orderSet = new Set(preservedOrder)
  const orderedIds = [...preservedOrder, ...selectedIds.filter((id) => !orderSet.has(id))]

  return {
    version: SELECTION_STORAGE_VERSION,
    selectedIds,
    selectionSequenceIds,
    orderedIds,
    hasCustomOrder: selectedIds.length > 0 ? state.hasCustomOrder : false,
  }
}

export function setOrderedSelectionState(
  state: PersistedSelectionState,
  nextOrderedIds: string[],
  hasCustomOrder = true,
): PersistedSelectionState {
  const selectedSet = new Set(state.selectedIds)
  const requested = unique(nextOrderedIds).filter((id) => selectedSet.has(id))
  const requestedSet = new Set(requested)
  const missing = state.orderedIds
    .filter((id) => selectedSet.has(id) && !requestedSet.has(id))
    .concat(state.selectedIds.filter((id) => !requestedSet.has(id)))

  return {
    ...state,
    orderedIds: unique([...requested, ...missing]),
    hasCustomOrder: state.selectedIds.length > 0 && hasCustomOrder,
  }
}

export function resetSelectionOrderState(state: PersistedSelectionState): PersistedSelectionState {
  return {
    ...state,
    orderedIds: [...state.selectionSequenceIds],
    hasCustomOrder: false,
  }
}

export function pruneUnavailableSelectionState(
  state: PersistedSelectionState,
  availableIds: string[],
): PersistedSelectionState {
  const available = new Set(availableIds)
  return reconcileSelectionState(
    state,
    state.selectedIds.filter((id) => available.has(id)),
  )
}
