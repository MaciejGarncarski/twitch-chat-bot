import { BackupPlaylistDialog } from "@/features/backup-playlist/components/backup-playlist-dialog"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { useTheme } from "@/components/theme-provider"
import { useI18n } from "@/features/i18n/components/i18n-provider"
import { Monitor, Moon, Settings, Sun } from "lucide-react"
import { motion } from "motion/react"

export function SettingsDropdown() {
  const { t } = useTranslate()
  const { setTheme, theme } = useTheme()
  const { setLanguage, language } = useI18n()
  const auth = useAuth()
  const isMod = auth.data?.isMod || false

  return (
    <motion.div layout className="flex items-center gap-2">
      {isMod && <BackupPlaylistDialog />}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="default" variant="outline" />}>
          <Settings size={12} />
          <span>{t("settings.title")}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-38" align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("common.theme")}</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={theme === "light"}
              onCheckedChange={() => setTheme("light")}
            >
              {t("theme.light")}
              <Sun className="ml-auto h-4 w-4" />
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={theme === "dark"}
              onCheckedChange={() => setTheme("dark")}
            >
              {t("theme.dark")}
              <Moon className="ml-auto h-4 w-4" />
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={theme === "system"}
              onCheckedChange={() => setTheme("system")}
            >
              {t("theme.system")}
              <Monitor className="ml-auto h-4 w-4" />
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("common.language")}</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={language === "en"}
              onCheckedChange={() => setLanguage("en")}
            >
              {t("common.en")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={language === "pl"}
              onCheckedChange={() => setLanguage("pl")}
            >
              {t("common.pl")}
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}
