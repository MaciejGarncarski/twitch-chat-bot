import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { PlayerManagement } from "@/features/player/components/player-management"
import { PlayerProgressBar } from "@/features/player/components/player-progress-bar"
import { SongTitle } from "@/features/player/components/song-title"
import { useIsModMode } from "@/hooks/use-is-mod-mode"
import { Loader, UserIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

type PlayerProps = {
  thumbnail: string | null
  isPlaying: boolean
  author: string | null
  videoId: string
  playTime: number
  title: string
  duration: number
  username: string
  dataStatus: "loading" | "success"
}

export const Player = ({
  playTime,
  isPlaying,
  title,
  author,
  duration,
  username,
  thumbnail,
  videoId,
  dataStatus,
}: PlayerProps) => {
  const { isModMode } = useIsModMode()
  const { t } = useTranslate()

  return (
    <motion.div
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="bg-background/98 relative flex w-full flex-col items-center justify-center gap-6 rounded-md border px-4 py-3 md:flex-row"
    >
      <AnimatePresence>
        {dataStatus === "loading" ? (
          <motion.div
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            className="bg-background/60 absolute inset-0 z-10 flex items-center justify-center rounded-md backdrop-blur-sm"
          >
            <p className="text-muted-foreground text-2xl font-medium">
              <Loader className="mr-4 mb-1 inline animate-spin" size={24} />
              {t("player.loading.sync")}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <a
        href={`https://youtu.be/${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="focus:ring-ring relative block h-28 w-48 shrink-0 rounded focus:ring-2 focus:ring-offset-3 focus:outline-none"
      >
        <img
          src={thumbnail || undefined}
          alt={title}
          className="border-border block h-full w-full rounded border object-cover"
        />
      </a>
      <div className="flex h-full w-full flex-1 flex-col justify-between gap-4 py-2 md:gap-4">
        <div className="flex items-center justify-between gap-2 md:items-start md:gap-4">
          <div className="w-full px-0 text-left md:max-w-none md:px-1">
            <SongTitle title={title} isPlaying={isPlaying} />
            <div className="flex justify-between">
              <h4 className="text-muted-foreground max-w-[20ch] truncate text-base">
                {author || ""}
              </h4>
              <p className="text-muted-foreground flex items-center gap-2">
                <UserIcon size={18} />
                {username}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {isModMode && <PlayerManagement playTime={playTime} duration={duration} />}
          <PlayerProgressBar />
        </div>
      </div>
    </motion.div>
  )
}
