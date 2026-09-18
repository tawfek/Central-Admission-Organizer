import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Download, ListOrdered } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AppControls } from "@/components/layout/app-controls";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { admissionsQueryOptions } from "@/features/admissions/data/admission-queries";
import { AdmissionFiltersPanel } from "@/features/admissions/components/admission-filters";
import { AdmissionsTable } from "@/features/admissions/components/admissions-table";
import {
  applyAdmissionFilters,
  uniqueAdmissionValues,
} from "@/features/admissions/domain/admission";
import {
  canProceed,
  MAX_SELECTION,
} from "@/features/admissions/domain/selection";
import type { AdmissionFilters } from "@/features/admissions/domain/types";
import { useAdmissionSelection } from "@/app/selection-context";
import { useTelegram, useTelegramMainButton } from "@/integrations/telegram/telegram-context";

const initialFilters: AdmissionFilters = {
  maximumPercent: "",
  branch: "",
  sex: "",
  name: "",
};

export function AdmissionsRoute() {
  const { t } = useTranslation();
  const { data = [], isLoading } = useQuery(admissionsQueryOptions);
  const [filters, setFilters] = React.useState(initialFilters);
  const {
    selectedIds,
    setSelectedIds,
    clear,
    reconcileAvailableIds,
    hasCustomOrder,
  } = useAdmissionSelection();
  const navigate = useNavigate();
  const { isTelegram, hapticSelection, hapticImpact } = useTelegram();

  const filtered = React.useMemo(
    () => applyAdmissionFilters(data, filters),
    [data, filters],
  );
  const branchOptions = React.useMemo(
    () => uniqueAdmissionValues(data, "type"),
    [data],
  );
  const sexOptions = React.useMemo(
    () => uniqueAdmissionValues(data, "sex"),
    [data],
  );

  const availableIds = React.useMemo(
    () => data.map((row) => row.sourceId),
    [data],
  );

  React.useEffect(() => {
    if (!isLoading && data.length > 0) {
      reconcileAvailableIds(availableIds);
    }
  }, [availableIds, data.length, isLoading, reconcileAvailableIds]);

  const handleSelectedIdsChange = React.useCallback(
    (ids: string[]) => {
      if (hasCustomOrder) {
        const current = new Set(selectedIds);
        const added = ids.filter((id) => !current.has(id)).length;
        if (added > 0) {
          toast.info(t("table.appendedToSavedOrder", { count: added }));
        }
      }
      setSelectedIds(ids);
      hapticSelection();
    },
    [hasCustomOrder, hapticSelection, selectedIds, setSelectedIds, t],
  );

  const next = React.useCallback(() => {
    if (!canProceed(selectedIds.length)) return;
    hapticImpact("light");
    navigate({ to: "/selection" });
  }, [hapticImpact, navigate, selectedIds.length]);

  useTelegramMainButton({
    visible: isTelegram && selectedIds.length > 0,
    enabled: canProceed(selectedIds.length),
    text: t("common.nextWithCount", { count: selectedIds.length }),
    onClick: next,
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-4 pb-28 sm:px-6 sm:py-6 lg:px-8">
      <div className="mb-4 flex justify-end">
        <AppControls />
      </div>

      <section className="mb-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:mb-6">
        <div className="p-5 sm:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="shrink-0 rounded-xl bg-zinc-900 p-2.5 text-white dark:bg-zinc-100 dark:text-zinc-950">
              <ListOrdered className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold sm:text-3xl">
                {t("app.title")}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-600 sm:text-base dark:text-zinc-300">
                {t("app.description")}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {t("app.selectionRule")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-zinc-100 bg-zinc-50/70 p-4 sm:flex-row sm:px-8 dark:border-zinc-800 dark:bg-zinc-950/30">
          <Button asChild variant="outline" size="sm">
            <a
              href={`${import.meta.env.BASE_URL}admission-minimums.pdf`}
              target="_blank"
              rel="noreferrer"
            >
              <Download className="h-4 w-4" />
              {t("app.downloadMinimums")}
            </a>
          </Button>
        </div>
      </section>

      <Card className="mb-5 sm:mb-6">
        <CardContent className="pt-5 sm:pt-6">
          <AdmissionFiltersPanel
            filters={filters}
            branchOptions={branchOptions}
            sexOptions={sexOptions}
            onChange={setFilters}
            selectedCount={selectedIds.length}
            onClearSelection={clear}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
          {t("common.loading")}
        </div>
      ) : (
        <AdmissionsTable
          data={filtered}
          selectedIds={selectedIds}
          onSelectedIdsChange={handleSelectedIdsChange}
          scoreFilterValue={filters.maximumPercent}
        />
      )}

      {selectedIds.length > 0 && (
        <div className="telegram-safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-3 py-3 shadow-[0_-12px_30px_rgba(0,0,0,.08)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold sm:text-base">
                {t("table.selectedFooter", { count: selectedIds.length })}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <span>
                  {t("common.selected", {
                    count: selectedIds.length,
                    max: MAX_SELECTION,
                  })}
                </span>
                {hasCustomOrder && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("table.savedOrderPreserved")}
                  </span>
                )}
              </div>
            </div>
            {!isTelegram && (
              <Button
                size="lg"
                className="shrink-0"
                onClick={next}
                disabled={!canProceed(selectedIds.length)}
              >
                {t("common.next")}
              </Button>
            )}
          </div>
        </div>
      )}

      <footer className="mt-10 pb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        ©2020–{new Date().getFullYear()} {t("app.developedBy")}{" "}
        <a
          className="font-medium text-zinc-800 underline-offset-4 hover:underline dark:text-zinc-200"
          href="https://instagram.com/tawfekmt"
          target="_blank"
          rel="nofollow noreferrer"
        >
          {t("app.author")}
        </a>
      </footer>
    </main>
  );
}

