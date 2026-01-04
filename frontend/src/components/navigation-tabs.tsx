import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocation, useNavigate } from "@tanstack/react-router"

export function NavigationTabs() {
  const navigate = useNavigate()
  const location = useLocation()
  const defaultValue = location.pathname === "/player-only" ? "player" : "account"

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
        <TabsTrigger value="account">Zarządzanie</TabsTrigger>
        <TabsTrigger value="player">Odtwarzacz</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
