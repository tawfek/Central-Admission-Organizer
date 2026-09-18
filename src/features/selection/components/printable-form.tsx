import { useTranslation } from "react-i18next"
import { getPublicAppUrl } from "@/config/app"
import type { Admission } from "@/features/admissions/domain/types"

export function PrintableForm({ items }: { items: Admission[] }) {
  const { t } = useTranslation()
  const appUrl = getPublicAppUrl()

  return (
    <div className="print-card rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-950 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50">
      <h1 className="mb-1 text-center text-xl font-bold">{t("selection.printTitle")}</h1>
      <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("selection.printSubtitle")}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-zinc-900 dark:border-zinc-100">
              <th className="p-2 text-start">{t("selection.sequence")}</th>
              <th className="p-2 text-start">{t("selection.university")}</th>
              <th className="p-2 text-center">{t("selection.percentage")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.sourceId} className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-2 font-semibold">{index + 1}</td>
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-center font-semibold">{item.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 border-t border-zinc-200 pt-4 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        {t("selection.generatedBy")} {appUrl ? <a className="font-medium underline" dir="ltr" href={appUrl}>{appUrl}</a> : null}
      </div>
    </div>
  )
}
