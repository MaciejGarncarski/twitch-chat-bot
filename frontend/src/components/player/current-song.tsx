import { CurrentSongDropdown } from "@/components/player/current-song-dropdown"
import { CurrentSongProgressBar } from "@/components/player/current-song-progress-bar"
import { CurrentSongTitle } from "@/components/player/current-song-title"
import { DurationIndicator } from "@/components/player/duration-indicator"
import { LoopIndicator } from "@/components/player/loop-indicator"
import { PlayIndicator } from "@/components/player/play-indicator"
import { VolumeIndicator } from "@/components/player/volume-indicator"
import { useIsManagementPage } from "@/hooks/use-is-management-page"
import { cn } from "@/lib/utils"
import { Loader, UserIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

type CurrentSongProps = {
  thumbnail: string | null
  isLoopEnabled: boolean
  isPlaying: boolean
  volume: number
  videoId: string
  playTime: number
  title: string
  duration: number
  username: string
  dataStatus: "loading" | "success"
}

export const CurrentSong = ({
  volume,
  playTime,
  isPlaying,
  title,
  duration,
  username,
  thumbnail,
  videoId,
  isLoopEnabled,
  dataStatus,
}: CurrentSongProps) => {
  const isManagement = useIsManagementPage()

  return (
    <motion.div
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      initial={{ opacity: 0, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="bg-background/95 relative flex w-full flex-col items-center justify-center gap-6 rounded-md border px-4 py-4 md:h-36 md:flex-row"
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
              Synchronizacja
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
      <div className="flex h-full w-full flex-1 flex-col justify-between gap-4 py-2 md:gap-0">
        <div className="relative flex items-center justify-between gap-4">
          <CurrentSongTitle title={title} isPlaying={isPlaying} />
          {isManagement && (
            <div className={cn(!isPlaying && "absolute right-0 z-20")}>
              <CurrentSongDropdown />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3.5">
          <div className="text-muted-foreground flex flex-col items-center justify-between gap-1 text-base md:flex-row md:gap-2">
            <div className="flex items-center gap-3">
              <PlayIndicator isPlaying={isPlaying} />
              <DurationIndicator playTime={playTime} duration={duration} />
              <span className="opacity-70">-</span>
              <VolumeIndicator volume={volume} />
              <span className="opacity-70">-</span>
              <LoopIndicator isLoopEnabled={isLoopEnabled} />
            </div>
            <p className="flex items-center gap-2">
              <UserIcon size={18} />
              {username}
            </p>
          </div>
          <CurrentSongProgressBar duration={duration} playTime={playTime} />
        </div>
      </div>
    </motion.div>
  )
}
