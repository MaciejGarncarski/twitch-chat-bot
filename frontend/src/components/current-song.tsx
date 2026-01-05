import { CurrentSongDropdown } from "@/components/current-song-dropdown"
import { CurrentSongProgressBar } from "@/components/current-song-progress-bar"
import { CurrentSongTitle } from "@/components/current-song-title"
import { DurationIndicator } from "@/components/duration-indicator"
import { VolumeIndicator } from "@/components/volume-indicator"
import { useLocation } from "@tanstack/react-router"
import { UserIcon } from "lucide-react"
import { motion } from "motion/react"

type CurrentSongProps = {
  thumbnail: string | null
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
}: CurrentSongProps) => {
  const location = useLocation()
  const isDashboard = !location.href.includes("/player-only")

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
      initial={{ opacity: 0, y: 40, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, y: -40, transition: { duration: 0.3 } }}
      className="flex flex-col md:flex-row gap-6 items-center justify-center py-4 w-full px-4 border md:h-36 bg-background/95 rounded-md"
    >
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
        <div className="flex justify-between items-center gap-4">
          <CurrentSongTitle title={title} isPlaying={isPlaying} />
          {isDashboard && <CurrentSongDropdown isPlaying={isPlaying} />}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-1 md:gap-2 text-muted-foreground flex-col md:flex-row justify-between items-center text-base">
            <div className="flex gap-3 items-center">
              <DurationIndicator playTime={playTime} duration={duration} />
              <span>-</span>
              <VolumeIndicator volume={volume} />
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
