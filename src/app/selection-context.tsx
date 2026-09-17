import * as React from "react"
import type { Admission } from "@/features/admissions/domain/types"

interface SelectionContextValue {
  selectedIds: string[]
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
  orderedAdmissions: Admission[]
  setOrderedAdmissions: React.Dispatch<React.SetStateAction<Admission[]>>
  clear: () => void
}

const SelectionContext = React.createContext<SelectionContextValue | null>(null)

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [orderedAdmissions, setOrderedAdmissions] = React.useState<Admission[]>([])
  const clear = React.useCallback(() => {
    setSelectedIds([])
    setOrderedAdmissions([])
  }, [])
  return <SelectionContext.Provider value={{ selectedIds, setSelectedIds, orderedAdmissions, setOrderedAdmissions, clear }}>{children}</SelectionContext.Provider>
}

export function useAdmissionSelection() {
  const value = React.useContext(SelectionContext)
  if (!value) throw new Error("useAdmissionSelection must be used inside SelectionProvider")
  return value
}
