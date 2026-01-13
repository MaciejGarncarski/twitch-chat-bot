import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import { useIsModMode } from "@/hooks/use-is-mod-mode"

export function Navigation() {
  const { t } = useTranslate()
  const { isModMode, setModMode } = useIsModMode()
  const { data } = useAuth()

  if (!data || !data.isMod) {
    return <div></div>
  }

  const navigateOnSelect = (value: string) => {
    if (value === "mod") {
      setModMode(true)
    } else {
      setModMode(false)
    }
  }

  return (
    <Label
      className={buttonVariants({
        variant: "outline",
        className: "px-3 py-2 flex items-center gap-3 cursor-pointer",
      })}
    >
      <Switch
        className={"cursor-pointer"}
        checked={isModMode}
        onCheckedChange={(checked) => navigateOnSelect(checked ? "mod" : "player")}
      />
      {t("navigation.modMode")}
    </Label>
  )
}
