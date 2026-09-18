import * as React from "react"
import { ArrowDownWideNarrow, ArrowRight, CheckCircle2, Link2, MapPin, Printer, RotateCcw, Undo2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { AppControls } from "@/components/layout/app-controls"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPublicAppUrl } from "@/config/app"
import { admissionsQueryOptions } from "@/features/admissions/data/admission-queries"
import { useAdmissionSelection } from "@/app/selection-context"
import { SortableChoiceList } from "@/features/selection/components/sortable-choice-list"
import { PrintableForm } from "@/features/selection/components/printable-form"
import { IRAQ_LOCATIONS, findIraqLocation } from "@/features/selection/data/iraq-locations"
import { prioritizeByCustomTerm, prioritizeByLocation, sortByPercentage } from "@/features/selection/domain/order"
import { buildSelectionShareUrl, copyTextToClipboard, readSharedSelectionIds } from "@/features/selection/domain/share"
import { useTelegram, useTelegramBackButton } from "@/integrations/telegram/telegram-context"

export function SelectionRoute() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const {
    isTelegram,
    hapticSelection,
    hapticSuccess,
    hapticWarning,
    hapticError,
    hapticImpact,
  } = useTelegram()
  const { data = [], isLoading } = useQuery(admissionsQueryOptions)
  const {
    orderedIds,
    setOrderedIds,
    applyBulkOrder,
    undoOrder,
    resetOrder,
    reconcileAvailableIds,
    hasCustomOrder,
    canUndo,
  } = useAdmissionSelection()
  const [locationId, setLocationId] = React.useState("")
  const [customCity, setCustomCity] = React.useState("")
  const sharedInitialIds = React.useMemo(() => readSharedSelectionIds(), [])
  const isSharedView = sharedInitialIds.length > 0
  const [sharedOrderedIds, setSharedOrderedIds] = React.useState(sharedInitialIds)
  const [sharedHasCustomOrder, setSharedHasCustomOrder] = React.useState(false)
  const [sharedUndo, setSharedUndo] = React.useState<{ ids: string[]; hasCustomOrder: boolean } | null>(null)

  const goBack = React.useCallback(() => {
    hapticImpact("light")
    navigate({ to: "/" })
  }, [hapticImpact, navigate])

  useTelegramBackButton(goBack, true)

  const availableIds = React.useMemo(() => data.map((item) => item.sourceId), [data])

  React.useEffect(() => {
    if (!isSharedView && !isLoading && data.length > 0) reconcileAvailableIds(availableIds)
  }, [availableIds, data.length, isLoading, isSharedView, reconcileAvailableIds])

  const admissionById = React.useMemo(
    () => new Map(data.map((item) => [item.sourceId, item])),
    [data],
  )
  const activeOrderedIds = isSharedView ? sharedOrderedIds : orderedIds
  const orderedAdmissions = React.useMemo(
    () => activeOrderedIds.map((id) => admissionById.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [activeOrderedIds, admissionById],
  )

  const setCurrentOrderedIds = React.useCallback((ids: string[]) => {
    if (isSharedView) {
      setSharedOrderedIds(ids)
      setSharedHasCustomOrder(true)
      setSharedUndo(null)
      hapticSelection()
      return
    }
    setOrderedIds(ids)
    hapticSelection()
  }, [hapticSelection, isSharedView, setOrderedIds])

  const applyCurrentBulkOrder = React.useCallback((ids: string[]) => {
    if (isSharedView) {
      setSharedUndo({ ids: [...sharedOrderedIds], hasCustomOrder: sharedHasCustomOrder })
      setSharedOrderedIds(ids)
      setSharedHasCustomOrder(true)
      return
    }
    applyBulkOrder(ids)
  }, [applyBulkOrder, isSharedView, sharedHasCustomOrder, sharedOrderedIds])

  const currentHasCustomOrder = isSharedView ? sharedHasCustomOrder : hasCustomOrder
  const currentCanUndo = isSharedView ? Boolean(sharedUndo) : canUndo

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4 text-sm text-zinc-500 dark:text-zinc-400">
        {t("common.loading")}
      </main>
    )
  }

  if (!orderedAdmissions.length) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-4">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-bold">{t("selection.emptyTitle")}</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t("selection.emptyDescription")}</p>
            <Button className="mt-5" onClick={() => navigate({ to: "/" })}><ArrowRight className={`h-4 w-4 ${i18n.dir() === "ltr" ? "rotate-180" : ""}`} />{t("common.back")}</Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const prioritizePreset = () => {
    if (!locationId) return
    const location = findIraqLocation(locationId)
    if (!location) return
    const result = prioritizeByLocation(orderedAdmissions, location)
    const label = t(location.translationKey)
    if (!result.matches) {
      toast.warning(t("selection.noCityMatches", { city: label }))
      hapticWarning()
      return
    }
    applyCurrentBulkOrder(result.items.map((item) => item.sourceId))
    toast.success(t("selection.cityMatches", { count: result.matches, city: label }))
    hapticSuccess()
  }

  const prioritizeCustom = () => {
    const term = customCity.trim()
    if (!term) return
    const result = prioritizeByCustomTerm(orderedAdmissions, term)
    if (!result.matches) {
      toast.warning(t("selection.noCityMatches", { city: term }))
      hapticWarning()
      return
    }
    applyCurrentBulkOrder(result.items.map((item) => item.sourceId))
    toast.success(t("selection.cityMatches", { count: result.matches, city: term }))
    hapticSuccess()
  }

  const sortPercentage = () => {
    applyCurrentBulkOrder(sortByPercentage(orderedAdmissions).map((item) => item.sourceId))
    toast.success(t("selection.percentageSorted"))
    hapticSuccess()
  }

  const undo = () => {
    if (isSharedView) {
      if (!sharedUndo) return
      setSharedOrderedIds(sharedUndo.ids)
      setSharedHasCustomOrder(sharedUndo.hasCustomOrder)
      setSharedUndo(null)
    } else {
      undoOrder()
    }
    toast.success(t("selection.undoDone"))
    hapticSuccess()
  }

  const reset = () => {
    if (isSharedView) {
      setSharedUndo({ ids: [...sharedOrderedIds], hasCustomOrder: sharedHasCustomOrder })
      setSharedOrderedIds(sharedInitialIds)
      setSharedHasCustomOrder(false)
    } else {
      resetOrder()
    }
    toast.success(t("selection.resetDone"))
    hapticSuccess()
  }

  const publicAppUrl = getPublicAppUrl()
  const selectionShareUrl = buildSelectionShareUrl(orderedAdmissions, publicAppUrl)

  const copySelectionLink = async () => {
    try {
      await copyTextToClipboard(selectionShareUrl)
      toast.success(t("selection.linkCopied"))
      hapticSuccess()
    } catch {
      toast.error(t("selection.copyLinkFailed"))
      hapticError()
    }
  }

  return (
    <main className="print-shell mx-auto min-h-screen w-full max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="no-print mb-4 flex justify-end"><AppControls /></div>

      <div className="no-print mb-5 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div>
          {!isTelegram && (
            <Button variant="ghost" onClick={goBack}>
              <ArrowRight className={`h-4 w-4 ${i18n.dir() === "ltr" ? "rotate-180" : ""}`} />
              {t("common.back")}
            </Button>
          )}
        </div>
        <div className="lg:text-center">
          <h1 className="font-bold">{t("selection.title")}</h1>
          <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{t("selection.description")}</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Button onClick={() => { hapticImpact("light"); window.print() }}>
            <Printer className="h-4 w-4" />
            {t("selection.print")}
          </Button>
          <Button variant="outline" onClick={copySelectionLink}>
            <Link2 className="h-4 w-4" />
            {t("selection.copyLink")}
          </Button>
        </div>
      </div>

      <Card className="no-print mb-5">
        <CardHeader>
          <CardTitle>{t("selection.toolsTitle")}</CardTitle>
          <CardDescription>{t("selection.toolsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950/30">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isSharedView ? t("selection.sharedView") : t("selection.autoSaved")}
              </Badge>
              {isSharedView
                ? <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("selection.sharedViewHint")}</span>
                : currentHasCustomOrder && <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("selection.savedOrder")}</span>}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button type="button" variant="outline" size="sm" disabled={!currentCanUndo} onClick={undo}>
                <Undo2 className="h-4 w-4" />
                {t("selection.undo")}
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={!currentHasCustomOrder} onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                {t("selection.resetOrder")}
              </Button>
            </div>
          </div>
          <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">{t("selection.resetOrderHint")}</p>
          <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-3 flex items-center gap-2">
              <ArrowDownWideNarrow className="h-4 w-4 text-zinc-500" />
              <div><div className="text-sm font-semibold">{t("selection.sortPercentage")}</div><div className="text-xs text-zinc-500 dark:text-zinc-400">{t("selection.sortPercentageHint")}</div></div>
            </div>
            <Button className="w-full" variant="secondary" onClick={sortPercentage}>{t("selection.sortPercentage")}</Button>
          </div>

          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-zinc-500" /><div className="text-sm font-semibold">{t("selection.prioritizeCity")}</div></div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Select value={locationId || undefined} onValueChange={setLocationId}>
                <SelectTrigger><SelectValue placeholder={t("selection.chooseCity")} /></SelectTrigger>
                <SelectContent>
                  {IRAQ_LOCATIONS.map((location) => <SelectItem key={location.id} value={location.id}>{t(location.translationKey)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="secondary" disabled={!locationId} onClick={prioritizePreset}>{t("selection.prioritize")}</Button>
            </div>
            <div className="my-3 flex items-center gap-2 text-xs text-zinc-400"><span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" /><span>{t("selection.customCity")}</span><span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" /></div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Input dir={i18n.dir()} value={customCity} onChange={(event) => setCustomCity(event.target.value)} placeholder={t("selection.customCityPlaceholder")} onKeyDown={(event) => { if (event.key === "Enter") prioritizeCustom() }} />
              <Button variant="outline" disabled={!customCity.trim()} onClick={prioritizeCustom}>{t("selection.prioritize")}</Button>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>

      <div className="no-print mb-6">
        <SortableChoiceList
          items={orderedAdmissions}
          onChange={(items) => setCurrentOrderedIds(items.map((item) => item.sourceId))}
        />
      </div>
      <div className="hidden print:block"><PrintableForm items={orderedAdmissions} /></div>
    </main>
  )
}
