import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools"

import type { QueryClient } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { PlayerYT } from "@/features/player/components/player-yt"
import { PlayerDataProvider } from "@/features/player/components/player-data-provider"
import { I18nProvider } from "@/features/i18n/components/i18n-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

interface MyRouterContext {
  queryClient: QueryClient
}

const RootComponent = () => {
  return (
    <>
      <I18nProvider defaultLanguage="pl" storageKey="bot-ui-language">
        <ThemeProvider defaultTheme="system" storageKey="bot-ui-theme">
          <TooltipProvider>
            <PlayerDataProvider>
              <PlayerYT />
              <Outlet />
            </PlayerDataProvider>
          </TooltipProvider>
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
