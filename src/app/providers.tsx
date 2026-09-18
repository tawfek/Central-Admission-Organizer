import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Toaster } from "sonner"
import { SelectionProvider } from "./selection-context"
import { ThemeProvider, useTheme } from "./theme-context"
import { TelegramProvider } from "@/integrations/telegram/telegram-context"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } }
})

function LocalizedToaster() {
  const { i18n } = useTranslation()
  const { resolvedTheme } = useTheme()
  return <Toaster position="top-center" richColors dir={i18n.dir()} theme={resolvedTheme} />
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <ThemeProvider>
          <SelectionProvider>
            {children}
            <LocalizedToaster />
          </SelectionProvider>
        </ThemeProvider>
      </TelegramProvider>
    </QueryClientProvider>
  )
}
