import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsManagementPage } from "@/hooks/use-is-manage-mode"
import { useNavigate } from "@tanstack/react-router"

export function NavigationTabs() {
  const navigate = useNavigate()
  const isManagement = useIsManagementPage()
  const defaultValue = isManagement ? "account" : "player"

  const navigateOnSelect = (value: string) => {
    if (value === "account") {
      navigate({ to: "/" })
      return
    }

    navigate({ to: "/player-only" })
  }

  return (
    <Tabs defaultValue={defaultValue} onValueChange={navigateOnSelect}>
      <TabsList className={"gap-2 px-2"}>
        <TabsTrigger value="account" className={"cursor-pointer"}>
          Zarządzanie
        </TabsTrigger>
        <TabsTrigger value="player" className={"cursor-pointer"}>
          Odtwarzacz
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
