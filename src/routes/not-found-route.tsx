import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

export function NotFoundRoute() {
  const { t } = useTranslation()
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl font-bold">404</div>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400">{t("notFound.title")}</p>
        <Button asChild className="mt-5"><Link to="/">{t("notFound.home")}</Link></Button>
      </div>
    </main>
  )
}
