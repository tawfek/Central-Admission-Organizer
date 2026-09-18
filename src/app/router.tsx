import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"

import { AppShell } from "@/components/layout/app-shell"
import { AdmissionsRoute } from "@/routes/admissions-route"
import { SelectionRoute } from "@/routes/selection-route"
import { NotFoundRoute } from "@/routes/not-found-route"
import { normalizeTelegramLaunchHash } from "@/integrations/telegram/telegram"

const rootRoute = createRootRoute({
  component: AppShell,
  notFoundComponent: NotFoundRoute,
})

const admissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: AdmissionsRoute,
})

const selectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/selection",
  component: SelectionRoute,
})

const routeTree = rootRoute.addChildren([
  admissionsRoute,
  selectionRoute,
])

normalizeTelegramLaunchHash()

const hashHistory = createHashHistory()

export const router = createRouter({
  routeTree,
  history: hashHistory,
  defaultPreload: "intent",
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}