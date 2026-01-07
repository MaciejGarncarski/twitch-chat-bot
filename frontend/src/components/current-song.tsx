import { CurrentSongDropdown } from "@/components/current-song-dropdown"
import { CurrentSongProgressBar } from "@/components/current-song-progress-bar"
import { CurrentSongTitle } from "@/components/current-song-title"
import { DurationIndicator } from "@/components/duration-indicator"
import { LoopIndicator } from "@/components/loop-indicator"
import { VolumeIndicator } from "@/components/volume-indicator"
import { cn } from "@/lib/utils"
import { useLocation } from "@tanstack/react-router"
import { Pause, UserIcon } from "lucide-react"
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
}: CurrentSongProps) => {
  const location = useLocation()
  const isDashboard = !location.href.includes("/player-only")

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
      initial={{ opacity: 0, y: 40, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, y: -40, transition: { duration: 0.3 } }}
      className="bg-background/95 relative flex w-full flex-col items-center justify-center gap-6 rounded-md border px-4 py-4 md:h-36 md:flex-row"
    >
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center rounded-md backdrop-blur-xs"
          >
            <p className="text-muted-foreground text-2xl font-medium">
              <Pause className="mr-4 mb-1 inline" size={24} />
              Zapauzowano
            </p>
          </motion.div>
        )}
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
          {isDashboard && (
            <div className={cn(!isPlaying && "absolute right-0 z-20")}>
              <CurrentSongDropdown isPlaying={isPlaying} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="text-muted-foreground flex flex-col items-center justify-between gap-1 text-base md:flex-row md:gap-2">
            <div className="flex items-center gap-3">
              <DurationIndicator playTime={playTime} duration={duration} />
              <span>-</span>
              <VolumeIndicator volume={volume} />
              <span>-</span>
              <LoopIndicator isLoopEnabled={isLoopEnabled} />
            </div>
            <p className="flex items-center gap-2">
              <UserIcon size={18} />
              {username}
            </p>
          </div>
          <CurrentSongProgressBar videoId={videoId} duration={duration} playTime={playTime} />
        </div>
      </div>
    </motion.div>
  )
}
