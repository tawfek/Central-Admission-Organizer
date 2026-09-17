import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { registerSW } from "virtual:pwa-register"
import "@/i18n"
import { AppProviders } from "@/app/providers"
import { router } from "@/app/router"
import "@/index.css"

registerSW({ immediate: true })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>
)
