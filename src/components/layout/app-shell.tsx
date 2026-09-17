import { Outlet } from "@tanstack/react-router"

export function AppShell() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      <Outlet />
    </div>
  )
}
