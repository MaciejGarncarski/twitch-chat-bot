import {
  useBackupStatus,
  useBackupVideos,
} from "@/features/backup-playlist/hooks/use-backup-playlist"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/utils/format-duration"
import { ChevronDown, Clock3, Loader } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"

export function BackupPlaylistSection() {
  const { t } = useTranslate()
  const { data: status } = useBackupStatus()
  const [isOpen, setIsOpen] = useState(false)
  const { data: videos, isLoading } = useBackupVideos()

  const count = status?.videoIds.length ?? 0
  const isEmpty = count === 0

  if (isEmpty) return null

  return (
    <motion.div
      className={cn("bg-background flex flex-col gap-1 rounded-md border px-4 py-4 pb-4")}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 text-left"
      >
        <ChevronDown
          size={18}
          className={cn(
            "text-muted-foreground transition-transform duration-200",
            !isOpen && "-rotate-90",
          )}
        />
        <h2 className="text-muted-foreground mr-auto text-xl font-semibold">
          {t("player.backup.title")}
          <span className="text-muted-foreground/60 ml-2 text-base font-normal">({count})</span>
        </h2>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="animation-duration-[2s] animate-spin" />
                </div>
              ) : (
                <div className="bg-secondary/30 border-border min-h-18 overflow-hidden rounded-lg border">
                  {videos?.map((video, idx) => (
                    <div
                      key={video.id}
                      className={cn(
                        "bg-secondary focus-within:bg-background hover:bg-background flex flex-col items-center gap-6 border-b p-3 md:flex-row",
                        idx === (videos?.length ?? 0) - 1 && "border-b-0",
                      )}
                    >
                      {video.thumbnail && (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-11 w-20 shrink-0 rounded border border-neutral-700 object-cover md:h-22 md:w-39"
                        />
                      )}
                      <div className="flex w-full min-w-0 flex-col gap-1 text-left">
                        <h3 className="max-w-[40ch] truncate font-semibold md:text-lg">
                          {video.title}
                        </h3>
                        <h4 className="text-muted-foreground max-w-[20ch] truncate text-sm">
                          {video.author || ""}
                        </h4>
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <Clock3 size={14} />
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
