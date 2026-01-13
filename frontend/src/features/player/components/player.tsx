import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { DurationIndicator } from "@/features/player/components/duration-indicator"
import { LoopIndicator } from "@/features/player/components/loop-indicator"
import { PlayIndicator } from "@/features/player/components/play-indicator"
import { PlayerManagementDropdown } from "@/features/player/components/player-management-dropdown"
import { PlayerProgressBar } from "@/features/player/components/player-progress-bar"
import { SongTitle } from "@/features/player/components/song-title"
import { VolumeIndicator } from "@/features/player/components/volume-indicator"
import { useIsModMode } from "@/hooks/use-is-mod-mode"
import { cn } from "@/lib/utils"
import { Loader, UserIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

type PlayerProps = {
  thumbnail: string | null
  isLoopEnabled: boolean
  isPlaying: boolean
  volume: number
  author: string | null
  videoId: string
  playTime: number
  title: string
  duration: number
  username: string
  dataStatus: "loading" | "success"
}

export const Player = ({
  volume,
  playTime,
  isPlaying,
  title,
  author,
  duration,
  username,
  thumbnail,
  videoId,
  isLoopEnabled,
  dataStatus,
}: PlayerProps) => {
  const { isModMode } = useIsModMode()
  const { t } = useTranslate()

  return (
    <motion.div
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="bg-background/95 relative flex w-full flex-col items-center justify-center gap-6 rounded-md border px-6 py-4 md:flex-row"
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
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="focus:ring-ring relative block h-28 w-48 shrink-0 rounded focus:ring-2 focus:ring-offset-3 focus:outline-none"
      >
        <img
          src={thumbnail || undefined}
          alt={title}
          className="block h-full w-full rounded border border-neutral-800 object-cover"
        />
      </a>
      <div className="flex h-full w-full flex-1 flex-col justify-between gap-4 py-2 md:gap-4">
        <div className="relative flex items-center justify-between gap-2 md:items-start md:gap-4">
          <div className="max-w-[27ch] px-0 text-left md:px-1">
            <SongTitle title={title} isPlaying={isPlaying} />
            <h4 className="text-muted-foreground max-w-[20ch] truncate text-base">
              {author || ""}
            </h4>
          </div>
          {isModMode && (
            <div className={cn(!isPlaying && "absolute right-0 z-20")}>
              <PlayerManagementDropdown />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="text-muted-foreground flex flex-col items-center justify-between gap-1 text-base md:flex-row md:gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <PlayIndicator isPlaying={isPlaying} />
                <DurationIndicator playTime={playTime} duration={duration} />
              </div>
              <span className="opacity-70">-</span>
              <VolumeIndicator volume={volume} />
              <span className="opacity-70">-</span>
              <LoopIndicator isLoopEnabled={isLoopEnabled} />
            </div>
            <p className="mr-1 flex items-center gap-2">
              <UserIcon size={18} />
              {username}
            </p>
          </div>
          <PlayerProgressBar />
        </div>
      </div>
    </motion.div>
  )
}
