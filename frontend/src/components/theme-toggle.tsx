import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { cn } from "@/lib/utils"

type ThemeToggleProps = {
  withText?: boolean
}

export function ThemeToggle({ withText = true }: ThemeToggleProps) {
  const iconSizeClass = cn("h-[1.3rem] w-[1.3rem]", withText && "mr-1")
  const { setTheme, theme } = useTheme()
  const { t } = useTranslate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={withText ? "default" : "icon"}>
          {theme === "light" && <Sun className={iconSizeClass} />}
          {theme === "dark" && <Moon className={iconSizeClass} />}
          {theme === "system" && <Monitor className={iconSizeClass} />}
          <span className={cn(!withText && "sr-only")}>{t("common.theme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <div className="flex items-center gap-2">
            <Sun className={iconSizeClass} />
            <span>{t("theme.light")}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <div className="flex items-center gap-2">
            <Moon className={iconSizeClass} />
            <span>{t("theme.dark")}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <div className="flex items-center gap-2">
            <Monitor className={iconSizeClass} />
            <span>{t("theme.system")}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
