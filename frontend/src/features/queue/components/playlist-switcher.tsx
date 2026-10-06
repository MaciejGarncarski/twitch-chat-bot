import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { useQueue } from "@/features/queue/hooks/use-queue"
import { useBackupStatus } from "@/features/backup-playlist/hooks/use-backup-playlist"
import { BackupPlaylistSection } from "@/features/backup-playlist/components/backup-playlist-section"
import { Queue } from "@/features/queue/components/queue"
import { useIsModMode } from "@/hooks/use-is-mod-mode"
import { ListMusic, Music2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function PlaylistSwitcher() {
  const { t } = useTranslate()
  const { data: queueData } = useQueue()
  const { isModMode } = useIsModMode()
  const { data: backupStatus } = useBackupStatus(isModMode)
  const upcomingCount = Math.max(0, (queueData?.length ?? 0) - 1)
  const backupCount = backupStatus?.videoIds.length ?? 0

  if (!isModMode) {
    return <Queue showRemoveButton={false} embedded />
  }

  return (
    <Tabs
      defaultValue="queue"
      className="border-border bg-card/75 dark:bg-card/80 flex w-full flex-col gap-4 rounded-3xl border p-3 shadow-xl backdrop-blur-2xl md:p-5"
    >
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center md:gap-4">
        <div>
          <h2 className="text-foreground m-0 text-lg font-semibold tracking-tight">
            {t("common.playlists")}
          </h2>
        </div>
        <TabsList
          className={cn(
            "border-border bg-muted/75 flex h-auto w-auto flex-none items-center justify-center gap-1 rounded-xl border p-1 max-sm:grid max-sm:w-full",
            "max-sm:grid-cols-2",
          )}
        >
          <TabsTrigger
            value="queue"
            className="text-muted-foreground hover:text-foreground data-[active]:border-primary/30 data-[active]:bg-primary/15 data-[active]:text-foreground dark:data-[active]:text-foreground relative flex min-w-0 items-center justify-center gap-1 rounded-lg border border-transparent px-2 text-xs font-medium transition after:hidden data-[active]:shadow-none max-sm:w-full md:gap-2 md:px-3"
          >
            <Music2 className="text-primary dark:text-primary size-4 shrink-0" />
            <span className="whitespace-nowrap">{t("common.queue")}</span>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {upcomingCount}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="backup"
            className="text-muted-foreground hover:text-foreground data-active:border-primary/30 data-active:bg-primary/15 data-active:text-foreground dark:data-active:text-foreground relative flex min-w-0 items-center justify-center gap-1 rounded-lg border border-transparent px-2 text-xs font-medium transition after:hidden data-active:shadow-none max-sm:w-full md:gap-2 md:px-3"
          >
            <ListMusic className="text-primary dark:text-primary size-4 shrink-0" />
            <span className="whitespace-nowrap">{t("player.backup.titleShort")}</span>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {backupCount}
            </span>
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="queue" className="min-w-0 outline-none">
        <Queue showRemoveButton={isModMode} embedded />
      </TabsContent>
      <TabsContent value="backup" className="min-w-0 outline-none">
        <BackupPlaylistSection />
      </TabsContent>
    </Tabs>
  )
}
