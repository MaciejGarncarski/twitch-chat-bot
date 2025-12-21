import { CurrentSongProgressBar } from '@/components/current-song-progress-bar'
import { CurrentSongTitle } from '@/components/current-song-title'
import { DurationIndicator } from '@/components/duration-indicator'
import { buttonVariants } from '@/components/ui/button'
import { VolumeIndicator } from '@/components/volume-indicator'
import { useSetPlayState } from '@/hooks/use-set-play-state'
import { cn } from '@/lib/utils'
import { LoaderIcon, Pause, Play, UserIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type RefObject } from 'react'

type CurrentSongProps = {
  playerRef: RefObject<HTMLVideoElement | null>
  thumbnail: string | null
  isPlaying: boolean
  volume: number
  playTime: number
  title: string
  duration: number
  username: string
}

export const CurrentSong = ({
  volume,
  playTime,
  playerRef,
  isPlaying,
  title,
  duration,
  username,
  thumbnail,
}: CurrentSongProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const { mutate, isPending } = useSetPlayState({ isPlaying, playerRef })

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
      initial={{ opacity: 0, y: 40, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, y: -40, transition: { duration: 0.3 } }}
      className="flex gap-6 items-center justify-center py-4 w-full px-4 border h-36 bg-neutral-900/95 rounded-md"
    >
      <div
        className="w-48 h-28 relative shrink-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={thumbnail || undefined}
          alt={title}
          className="w-full h-full rounded border object-cover border-neutral-800 block"
        />

        <AnimatePresence mode="wait">
          {(isHovered || !isPlaying) && (
            <motion.button
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => {
                mutate()
              }}
              className="absolute cursor-pointer top-0 z-10 bg-neutral-900/40 h-full w-full flex items-center justify-center rounded"
            >
              <span
                className={cn('cursor-pointer', buttonVariants({ size: 'sm', variant: 'default' }))}
              >
                {isPending ? (
                  <>
                    <LoaderIcon size={10} className="animate-spin" />
                    Ładowanie...
                  </>
                ) : (
                  <>
                    {isPlaying ? <Pause size={10} /> : <Play size={10} />}
                    {isPlaying ? 'Pauzuj' : 'Odtwórz'}
                  </>
                )}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col justify-between flex-1 h-full py-2">
        <div className="flex justify-between items-center gap-2">
          <CurrentSongTitle title={title} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 text-gray-200 justify-between items-center text-base">
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
          <CurrentSongProgressBar duration={duration} playTime={playTime} />
        </div>
      </div>
    </motion.div>
  )
}
