import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools"

import type { QueryClient } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"

interface MyRouterContext {
  queryClient: QueryClient
}

const RootComponent = () => {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Outlet />
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
