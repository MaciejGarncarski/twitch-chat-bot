import {
  useBackupStatus,
  useBackupVideos,
} from "@/features/backup-playlist/hooks/use-backup-playlist"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { formatDuration } from "@/utils/format-duration"
import { Clock3, Loader } from "lucide-react"
import { motion } from "motion/react"

export function BackupPlaylistSection() {
  const { t } = useTranslate()
  const { data: status, isLoading: isStatusLoading } = useBackupStatus()
  const { data: videos, isLoading: isVideosLoading } = useBackupVideos()
  const isEmpty = (status?.videoIds.length ?? 0) === 0

  if (isStatusLoading || isVideosLoading) {
    return (
      <div className="text-primary dark:text-primary grid min-h-28 place-items-center">
        <Loader className="animate-spin" />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <p className="border-border text-muted-foreground m-0 rounded-xl border border-dashed px-4 py-8 text-center text-sm">
        {t("player.backup.notSet")}
      </p>
    )
  }

  return (
    <div className="border-border bg-muted/75/75 overflow-hidden rounded-2xl border">
      {videos?.map((video, idx) => (
        <motion.div
          key={video.id}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: Math.min(idx * 0.035, 0.25) }}
          className={`border-border hover:bg-primary/[0.06] flex items-center gap-2.5 border-b p-2 transition-colors md:gap-4 md:px-3 md:py-2.5 ${idx === (videos?.length ?? 0) - 1 ? "border-b-0" : ""}`}
        >
          {video.thumbnail && (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="border-border w-20 shrink-0 rounded-lg border object-cover md:w-24"
            />
          )}
          <div className="min-w-0 flex-1 text-left">
            <h3 className="text-foreground m-0 truncate text-sm font-medium">{video.title}</h3>
            <h4 className="text-muted-foreground mt-1 mb-0 truncate text-xs font-normal">
              {video.author || ""}
            </h4>
            <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs tabular-nums">
              <Clock3 className="size-4" />
              {formatDuration(video.duration)}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
