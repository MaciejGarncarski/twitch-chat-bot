import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { useI18n } from "@/features/i18n/components/i18n-provider"

export function LanguageSwitcher() {
  const { setLanguage } = useI18n()
  const { t } = useTranslate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default">
          <span>{t("common.language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("en")}>
          <div className="flex items-center gap-2">
            <span>{t("common.en")}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("pl")}>
          <div className="flex items-center gap-2">
            <span>{t("common.pl")}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
