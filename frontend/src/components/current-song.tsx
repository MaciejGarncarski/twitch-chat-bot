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
      className="flex flex-col relative md:flex-row gap-6 items-center justify-center py-4 w-full px-4 border md:h-36 bg-background/95 rounded-md"
    >
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-background/70 backdrop-blur-xs flex items-center justify-center rounded-md"
          >
            <p className="text-2xl font-medium text-muted-foreground">
              <Pause className="inline mb-1 mr-4" size={24} />
              Zapauzowano
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-48 h-28 relative shrink-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-3 rounded"
      >
        <img
          src={thumbnail || undefined}
          alt={title}
          className="w-full h-full rounded border object-cover border-neutral-800 block"
        />
      </a>
      <div className="flex flex-col  justify-between flex-1 w-full h-full py-2 gap-4 md:gap-0">
        <div className="flex justify-between items-center gap-4 relative">
          <CurrentSongTitle title={title} isPlaying={isPlaying} />
          {isDashboard && (
            <div className={cn(!isPlaying && "z-20 absolute right-0")}>
              <CurrentSongDropdown isPlaying={isPlaying} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-1 md:gap-2 text-muted-foreground flex-col md:flex-row justify-between items-center text-base">
            <div className="flex gap-3 items-center">
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
