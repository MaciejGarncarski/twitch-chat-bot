import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools"

import type { QueryClient } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { PlayerYT } from "@/features/player/components/player-yt"
import { useDetectTheme } from "@/hooks/use-detect-theme"
import { PlayerDataProvider } from "@/features/player/components/player-data-provider"
import { I18nProvider } from "@/features/i18n/components/i18n-provider"

interface MyRouterContext {
  queryClient: QueryClient
}

const RootComponent = () => {
  useDetectTheme()

  return (
    <>
      <I18nProvider defaultLanguage="pl" storageKey="bot-ui-language">
        <ThemeProvider defaultTheme="system" storageKey="bot-ui-theme">
          <PlayerDataProvider>
            <Outlet />
            <PlayerYT />
          </PlayerDataProvider>
        </ThemeProvider>
      </I18nProvider>
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  )
}
export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})
