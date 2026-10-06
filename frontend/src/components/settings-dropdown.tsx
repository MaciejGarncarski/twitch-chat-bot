import { BackupPlaylistDialog } from "@/features/backup-playlist/components/backup-playlist-dialog"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { useTheme } from "@/components/theme-provider"
import { useI18n } from "@/features/i18n/components/i18n-provider"
import { ListMusic, Monitor, Moon, Settings, Sun } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"

export function SettingsDropdown() {
  const { t } = useTranslate()
  const { setTheme, theme } = useTheme()
  const { setLanguage, language } = useI18n()
  const auth = useAuth()
  const isMod = auth.data?.isMod || false
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false)

  return (
    <motion.div layout className="flex items-center gap-2">
      {isMod && (
        <BackupPlaylistDialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen} />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="default" variant="outline" />}>
          <Settings className="size-4 sm:size-3" />
          <span className="hidden sm:inline">{t("settings.title")}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
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
          {isMod && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setIsBackupDialogOpen(true)}>
                  <ListMusic />
                  {t("player.backup.title")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
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
