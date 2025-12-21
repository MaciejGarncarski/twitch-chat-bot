import { api } from '@/api/api-treaty'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/utils/format-duration'
import { useMutation } from '@tanstack/react-query'
import {
  Clock3,
  LoaderIcon,
  Pause,
  Play,
  UserIcon,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type RefObject } from 'react'

type PlayerProps = {
  playerRef: RefObject<HTMLVideoElement | null>
  currentSong: {
    id: string
    title: string
    duration: number
    thumbnail: string | null
    videoUrl: string
    username: string
    requestedAt: Date
  }
  playbackData: {
    isPlaying: boolean
    volume: number
    playTime: number
  }
  isReady: boolean
}

export const Player = ({ currentSong, playbackData, playerRef }: PlayerProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (playbackData.isPlaying) {
        await api.api.pause.post()

        if (playerRef.current) {
          playerRef.current.pause()
        }
      } else {
        await api.api.play.post()
      }

      return new Promise((resolve) => setTimeout(resolve, 1300))
    },
  })

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
      initial={{ opacity: 0, y: 40, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, y: -40, transition: { duration: 0.3 } }}
      className="flex gap-6 items-center justify-center py-4 w-full px-4 border bg-neutral-900/90 rounded-md"
    >
      <div
        className="w-48 h-28 relative shrink-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={currentSong.thumbnail || undefined}
          alt={currentSong.title}
          className="w-full h-full rounded border object-cover border-gray-700 block"
        />

        <AnimatePresence mode="wait">
          {(isHovered || !playbackData.isPlaying) && (
            <motion.button
              animate={{ opacity: 1, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
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
                    {playbackData.isPlaying ? <Pause size={10} /> : <Play size={10} />}
                    {playbackData.isPlaying ? 'Pauzuj' : 'Odtwórz'}
                  </>
                )}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col justify-between gap-4 w-full">
        <div className="flex justify-between items-center gap-2">
          <p className="text-xl font-semibold max-w-[35ch] truncate">{currentSong.title}</p>
        </div>
        <div className="flex gap-2 text-gray-200 justify-between items-center text-lg">
          <div className="flex gap-3 items-center">
            <p className="flex items-center gap-2">
              <Clock3 size={19} /> {formatDuration(playbackData?.playTime || 0)} /{' '}
              {formatDuration(currentSong.duration)}
            </p>
            <span>-</span>
            <p className="flex items-center gap-1 ">
              {playbackData.volume === 0 ? (
                <VolumeX size={20} className="inline-block mr-1" />
              ) : playbackData.volume < 0.2 ? (
                <Volume size={20} className="inline-block mr-1" />
              ) : playbackData.volume < 0.5 ? (
                <Volume1 size={20} className="inline-block mr-1" />
              ) : (
                <Volume2 size={20} className="inline-block mr-1" />
              )}
              {Math.round(playbackData?.volume * 100) || 0}%
            </p>
          </div>
          <p className="flex items-center gap-2">
            <UserIcon size={20} />
            {currentSong.username}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
