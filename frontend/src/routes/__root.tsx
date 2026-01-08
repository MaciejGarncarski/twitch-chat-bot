import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools"

import type { QueryClient } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { PlayerYT } from "@/components/player-yt"
import { useDetectTheme } from "@/hooks/use-detect-theme"

interface MyRouterContext {
  queryClient: QueryClient
}

const RootComponent = () => {
  useDetectTheme()

  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Outlet />
        <PlayerYT />
      </ThemeProvider>
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
