import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsManageMode } from "@/hooks/use-is-manage-mode"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { useNavigate } from "@tanstack/react-router"

export function NavigationTabs() {
  const navigate = useNavigate()
  const { t } = useTranslate()
  const isManagement = useIsManageMode()
  const defaultValue = isManagement ? "account" : "player"

  const navigateOnSelect = (value: string) => {
    if (value === "account") {
      navigate({ to: "/" })
      return
    }

    navigate({ to: "/player-only" })
  }

  return (
    <Tabs value={defaultValue} onValueChange={navigateOnSelect}>
      <TabsList className={"gap-2 px-2"}>
        <TabsTrigger value="account" className={"cursor-pointer"}>
          {t("navigation.manageMode")}
        </TabsTrigger>
        <TabsTrigger value="player" className={"cursor-pointer"}>
          {t("navigation.playerMode")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
