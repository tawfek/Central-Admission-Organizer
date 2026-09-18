import * as React from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { useTranslation } from "react-i18next"
import { flexRender, functionalUpdate, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type Column, type ColumnDef, type PaginationState, type RowSelectionState, type SortingState, type Updater } from "@tanstack/react-table"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { percentTone, translateBranch, translateSex } from "../domain/admission"
import { MAX_SELECTION } from "../domain/selection"
import type { Admission } from "../domain/types"

interface Props {
  data: Admission[]
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
  scoreFilterValue: string
}

function SortHeader({ label, column }: { label: string; column: Column<Admission, unknown> }) {
  const sorted = column.getIsSorted()
  return (
    <button className="inline-flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(sorted === "asc")} type="button">
      {label}
      {sorted === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : sorted === "desc" ? <ArrowDown className="h-3.5 w-3.5" /> : <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />}
    </button>
  )
}

export function AdmissionsTable({ data, selectedIds, onSelectedIdsChange, scoreFilterValue }: Props) {
  const { t } = useTranslation()
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 200 })
  const [sorting, setSorting] = React.useState<SortingState>([])
  const previousScoreFilter = React.useRef(scoreFilterValue)
  const [selectionAction, setSelectionAction] = React.useState("")
  const rowSelection = React.useMemo<RowSelectionState>(() => Object.fromEntries(selectedIds.map((id) => [id, true])), [selectedIds])

  React.useEffect(() => { setPagination((current) => ({ ...current, pageIndex: 0 })) }, [data])
  React.useEffect(() => {
    if (previousScoreFilter.current !== scoreFilterValue) {
      setSorting([{ id: "percent", desc: true }])
      previousScoreFilter.current = scoreFilterValue
    }
  }, [scoreFilterValue])

  const commitSelection = React.useCallback((ids: string[]) => {
    const requested = [...new Set(ids)]
    if (requested.length <= MAX_SELECTION) {
      onSelectedIdsChange(requested)
      return
    }

    const requestedSet = new Set(requested)
    const preserved = selectedIds.filter((id) => requestedSet.has(id))
    const preservedSet = new Set(preserved)
    const additions = requested.filter((id) => !preservedSet.has(id))
    const room = Math.max(0, MAX_SELECTION - preserved.length)
    const acceptedAdditions = additions.slice(0, room)

    onSelectedIdsChange([...preserved, ...acceptedAdditions])
    toast.warning(t("table.selectionLimitReached", {
      added: acceptedAdditions.length,
      max: MAX_SELECTION,
    }))
  }, [onSelectedIdsChange, selectedIds, t])

  const updateSelection = React.useCallback((updater: Updater<RowSelectionState>) => {
    const next = functionalUpdate(updater, rowSelection)
    commitSelection(Object.keys(next).filter((id) => next[id]))
  }, [commitSelection, rowSelection])

  const columns = React.useMemo<ColumnDef<Admission>[]>(() => [
    {
      id: "select",
      header: ({ table }) => <Checkbox aria-label={t("table.selectPage")} checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false} onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))} />,
      cell: ({ row }) => <Checkbox aria-label={`${t("table.university")}: ${row.original.name}`} checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(Boolean(value))} />,
      enableSorting: false,
      size: 44
    },
    { accessorKey: "name", header: ({ column }) => <SortHeader label={t("table.university")} column={column} />, cell: ({ row }) => <div className="min-w-[260px] font-medium leading-6">{row.original.name}</div> },
    { accessorKey: "percent", header: ({ column }) => <SortHeader label={t("table.percentage")} column={column} />, cell: ({ row }) => <Badge variant={percentTone(row.original.percent)}>{row.original.percent}%</Badge> },
    { accessorKey: "type", header: ({ column }) => <SortHeader label={t("table.branch")} column={column} />, cell: ({ row }) => translateBranch(row.original.type, t) },
    { accessorKey: "sex", header: ({ column }) => <SortHeader label={t("table.sex")} column={column} />, cell: ({ row }) => translateSex(row.original.sex, t) }
  ], [t])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, rowSelection },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: updateSelection,
    getRowId: (row) => row.sourceId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true
  })

  const pageRows = table.getRowModel().rows

  const replaceScopeSelection = (scopeIds: string[], desiredIds: string[]) => {
    const scope = new Set(scopeIds)
    const outside = selectedIds.filter((id) => !scope.has(id))
    commitSelection([...outside, ...desiredIds])
  }

  const applySelectionAction = (
    mode: "allResults" | "clearResults" | "all" | "invert" | "odd" | "even",
  ) => {
    if (mode === "allResults") {
      commitSelection([...selectedIds, ...data.map((row) => row.sourceId)])
      setSelectionAction("")
      return
    }

    if (mode === "clearResults") {
      const filtered = new Set(data.map((row) => row.sourceId))
      onSelectedIdsChange(selectedIds.filter((id) => !filtered.has(id)))
      setSelectionAction("")
      return
    }

    const pageIds = pageRows.map((row) => row.id)
    if (mode === "all") {
      commitSelection([...selectedIds, ...pageIds])
    } else if (mode === "invert") {
      const selected = new Set(selectedIds)
      replaceScopeSelection(pageIds, pageIds.filter((id) => !selected.has(id)))
    } else {
      replaceScopeSelection(
        pageIds,
        pageIds.filter((_, index) => mode === "odd" ? index % 2 === 0 : index % 2 !== 0),
      )
    }

    setSelectionAction("")
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={data.length < 50 ? "destructive" : "success"}>{t("common.results", { count: data.length })}</Badge>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{t("common.selected", { count: selectedIds.length, max: MAX_SELECTION })}</span>
        </div>
        <Select
          value={selectionAction}
          onValueChange={(value) => {
            setSelectionAction(value)
            applySelectionAction(value as "allResults" | "clearResults" | "all" | "invert" | "odd" | "even")
          }}
        >
          <SelectTrigger className="w-full sm:w-[250px]"><SelectValue placeholder={t("table.selectionActions")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="allResults">{t("table.selectAllResults", { count: data.length })}</SelectItem>
            <SelectItem value="clearResults">{t("table.clearFilteredResults", { count: data.length })}</SelectItem>
            <SelectItem value="all">{t("table.selectAllPage")}</SelectItem>
            <SelectItem value="invert">{t("table.invertPage")}</SelectItem>
            <SelectItem value="odd">{t("table.selectOdd")}</SelectItem>
            <SelectItem value="even">{t("table.selectEven")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white md:block dark:border-zinc-800 dark:bg-zinc-900">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-white dark:bg-zinc-900"><TableRow>{table.getHeaderGroups()[0]?.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {pageRows.length ? pageRows.map((row) => <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-zinc-500 dark:text-zinc-400">{t("common.noResults")}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-2 md:hidden">
        {pageRows.length ? pageRows.map((row) => {
          const admission = row.original
          return (
            <label key={row.id} className={`flex gap-3 rounded-xl border p-3 transition ${row.getIsSelected() ? "border-zinc-400 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>
              <Checkbox className="mt-1" checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(Boolean(value))} />
              <div className="min-w-0 flex-1">
                <div className="font-medium leading-6">{admission.name}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant={percentTone(admission.percent)}>{admission.percent}%</Badge>
                  <Badge variant="secondary">{translateBranch(admission.type, t)}</Badge>
                  <Badge variant="outline">{translateSex(admission.sex, t)}</Badge>
                </div>
              </div>
            </label>
          )
        }) : <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">{t("common.noResults")}</div>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{t("common.page", { current: table.getState().pagination.pageIndex + 1, total: Math.max(table.getPageCount(), 1) })}</span>
          <Select value={String(table.getState().pagination.pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>{[50, 100, 150, 200].map((size) => <SelectItem key={size} value={String(size)}>{t("common.perPage", { count: size })}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>{t("common.previous")}</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>{t("common.next")}</Button>
        </div>
      </div>
    </div>
  )
}
