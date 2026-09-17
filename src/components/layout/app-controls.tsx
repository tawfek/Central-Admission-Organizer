import { Languages, Moon, Sun, Monitor } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { setAppLanguage, type AppLanguage } from "@/i18n"
import { useTheme, type Theme } from "@/app/theme-context"

export function AppControls() {
  const { i18n, t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const language: AppLanguage = i18n.language.startsWith("en") ? "en" : "ar"

  return (
    <div className="no-print flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200/80 bg-white/90 p-2 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex items-center gap-2">
        <Languages className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <Select value={language} onValueChange={(value) => void setAppLanguage(value as AppLanguage)}>
          <SelectTrigger aria-label={t("common.language")} className="h-9 w-[112px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ar">العربية</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900" aria-label={t("common.theme")}>
        {([
          ["light", Sun, t("common.light")],
          ["dark", Moon, t("common.dark")],
          ["system", Monitor, t("common.system")]
        ] as const).map(([value, Icon, label]) => (
          <Button
            key={value}
            type="button"
            variant={theme === value ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            aria-label={label}
            title={label}
            onClick={() => setTheme(value as Theme)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  )
}
