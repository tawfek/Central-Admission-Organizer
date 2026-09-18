import * as React from "react"
import {
  createEmptySelectionState,
  normalizePersistedSelectionState,
  pruneUnavailableSelectionState,
  reconcileSelectionState,
  resetSelectionOrderState,
  setOrderedSelectionState,
  type PersistedSelectionState,
} from "@/features/selection/domain/selection-state"

const STORAGE_KEY = "central-admission-selection-v1"

interface UndoSnapshot {
  orderedIds: string[]
  hasCustomOrder: boolean
}

interface RuntimeSelectionState extends PersistedSelectionState {
  undoSnapshot: UndoSnapshot | null
}

type Action =
  | { type: "replace-selection"; ids: string[] }
  | { type: "set-order"; ids: string[] }
  | { type: "apply-bulk-order"; ids: string[] }
  | { type: "undo-order" }
  | { type: "reset-order" }
  | { type: "prune"; availableIds: string[] }
  | { type: "clear" }

interface SelectionContextValue {
  selectedIds: string[]
  orderedIds: string[]
  selectionSequenceIds: string[]
  hasCustomOrder: boolean
  canUndo: boolean
  setSelectedIds: (ids: string[]) => void
  setOrderedIds: (ids: string[]) => void
  applyBulkOrder: (ids: string[]) => void
  undoOrder: () => void
  resetOrder: () => void
  reconcileAvailableIds: (ids: string[]) => void
  clear: () => void
}

const SelectionContext = React.createContext<SelectionContextValue | null>(null)

function loadInitialState(): RuntimeSelectionState {
  if (typeof window === "undefined") {
    return { ...createEmptySelectionState(), undoSnapshot: null }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const persisted = raw ? normalizePersistedSelectionState(JSON.parse(raw)) : createEmptySelectionState()
    return { ...persisted, undoSnapshot: null }
  } catch {
    return { ...createEmptySelectionState(), undoSnapshot: null }
  }
}

function reducer(state: RuntimeSelectionState, action: Action): RuntimeSelectionState {
  if (action.type === "replace-selection") {
    return {
      ...reconcileSelectionState(state, action.ids),
      undoSnapshot: null,
    }
  }

  if (action.type === "set-order") {
    return {
      ...setOrderedSelectionState(state, action.ids, true),
      undoSnapshot: null,
    }
  }

  if (action.type === "apply-bulk-order") {
    return {
      ...setOrderedSelectionState(state, action.ids, true),
      undoSnapshot: {
        orderedIds: [...state.orderedIds],
        hasCustomOrder: state.hasCustomOrder,
      },
    }
  }

  if (action.type === "undo-order") {
    if (!state.undoSnapshot) return state
    return {
      ...setOrderedSelectionState(
        state,
        state.undoSnapshot.orderedIds,
        state.undoSnapshot.hasCustomOrder,
      ),
      undoSnapshot: null,
    }
  }

  if (action.type === "reset-order") {
    return {
      ...resetSelectionOrderState(state),
      undoSnapshot: {
        orderedIds: [...state.orderedIds],
        hasCustomOrder: state.hasCustomOrder,
      },
    }
  }

  if (action.type === "prune") {
    return {
      ...pruneUnavailableSelectionState(state, action.availableIds),
      undoSnapshot: null,
    }
  }

  return { ...createEmptySelectionState(), undoSnapshot: null }
}

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, loadInitialState)

  React.useEffect(() => {
    const persisted: PersistedSelectionState = {
      version: state.version,
      selectedIds: state.selectedIds,
      selectionSequenceIds: state.selectionSequenceIds,
      orderedIds: state.orderedIds,
      hasCustomOrder: state.hasCustomOrder,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
  }, [
    state.version,
    state.selectedIds,
    state.selectionSequenceIds,
    state.orderedIds,
    state.hasCustomOrder,
  ])

  const setSelectedIds = React.useCallback(
    (ids: string[]) => dispatch({ type: "replace-selection", ids }),
    [],
  )
  const setOrderedIds = React.useCallback(
    (ids: string[]) => dispatch({ type: "set-order", ids }),
    [],
  )
  const applyBulkOrder = React.useCallback(
    (ids: string[]) => dispatch({ type: "apply-bulk-order", ids }),
    [],
  )
  const undoOrder = React.useCallback(() => dispatch({ type: "undo-order" }), [])
  const resetOrder = React.useCallback(() => dispatch({ type: "reset-order" }), [])
  const reconcileAvailableIds = React.useCallback(
    (ids: string[]) => dispatch({ type: "prune", availableIds: ids }),
    [],
  )
  const clear = React.useCallback(() => dispatch({ type: "clear" }), [])

  const value = React.useMemo<SelectionContextValue>(
    () => ({
      selectedIds: state.selectedIds,
      orderedIds: state.orderedIds,
      selectionSequenceIds: state.selectionSequenceIds,
      hasCustomOrder: state.hasCustomOrder,
      canUndo: Boolean(state.undoSnapshot),
      setSelectedIds,
      setOrderedIds,
      applyBulkOrder,
      undoOrder,
      resetOrder,
      reconcileAvailableIds,
      clear,
    }),
    [
      applyBulkOrder,
      clear,
      reconcileAvailableIds,
      resetOrder,
      setOrderedIds,
      setSelectedIds,
      state,
      undoOrder,
    ],
  )

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

export function useAdmissionSelection() {
  const value = React.useContext(SelectionContext)
  if (!value) throw new Error("useAdmissionSelection must be used inside SelectionProvider")
  return value
}
