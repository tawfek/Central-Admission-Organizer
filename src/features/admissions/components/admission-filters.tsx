import { Filter, Percent, RotateCcw, Search, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { translateBranch, translateSex } from "../domain/admission"
import type { AdmissionFilters } from "../domain/types"

interface Props {
  filters: AdmissionFilters
  branchOptions: string[]
  sexOptions: string[]
  onChange: (next: AdmissionFilters) => void
  selectedCount: number
  onClearSelection: () => void
}

export function AdmissionFiltersPanel({ filters, branchOptions, sexOptions, onChange, selectedCount, onClearSelection }: Props) {
  const { t } = useTranslation()
  const set = (key: keyof AdmissionFilters, value: string) => onChange({ ...filters, [key]: value })
  const clearFilters = () => onChange({ maximumPercent: "", branch: "", sex: "", name: "" })
  const activeCount = Object.values(filters).filter((value) => value.trim() !== "").length

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-zinc-100 p-2 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"><Filter className="h-4 w-4" /></div>
          <div>
            <h2 className="font-semibold">{t("filters.title")}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("filters.description")}</p>
          </div>
        </div>
        {activeCount > 0 && <Badge variant="secondary">{t("filters.active", { count: activeCount })}</Badge>}
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <label className="grid gap-1.5 lg:col-span-5">
          <span className="text-sm font-medium">{t("filters.search")}</span>
          <div className="relative">
            <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input className="pe-9" placeholder={t("filters.searchPlaceholder")} value={filters.name} onChange={(event) => set("name", event.target.value)} />
          </div>
        </label>

        <label className="grid gap-1.5 lg:col-span-3">
          <span className="text-sm font-medium">{t("filters.score")}</span>
          <div className="relative">
            <Percent className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input className="pe-9" type="number" inputMode="decimal" placeholder={t("filters.scorePlaceholder")} value={filters.maximumPercent} onChange={(event) => set("maximumPercent", event.target.value)} />
          </div>
        </label>

        <label className="grid gap-1.5 lg:col-span-2">
          <span className="text-sm font-medium">{t("filters.branch")}</span>
          <Select value={filters.branch || "all"} onValueChange={(value) => set("branch", value === "all" ? "" : value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {branchOptions.map((branch) => <SelectItem key={branch} value={branch}>{translateBranch(branch, t)}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>

        <label className="grid gap-1.5 lg:col-span-2">
          <span className="text-sm font-medium">{t("filters.sex")}</span>
          <Select value={filters.sex || "all"} onValueChange={(value) => set("sex", value === "all" ? "" : value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {sexOptions.map((sex) => <SelectItem key={sex} value={sex}>{translateSex(sex, t)}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center dark:border-zinc-800">
        <p className="me-auto text-xs leading-5 text-zinc-500 dark:text-zinc-400">{t("filters.scoreHint")}</p>
        <Button type="button" variant="ghost" size="sm" onClick={clearFilters} disabled={activeCount === 0}>
          <RotateCcw className="h-4 w-4" />{t("filters.clearFilters")}
        </Button>

        {selectedCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild><Button type="button" variant="outline" size="sm"><Trash2 className="h-4 w-4" />{t("filters.clearSelection")}</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>{t("filters.clearSelectionTitle")}</AlertDialogTitle><AlertDialogDescription>{t("filters.clearSelectionDescription")}</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel><AlertDialogAction onClick={onClearSelection}>{t("filters.confirmClearSelection")}</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
