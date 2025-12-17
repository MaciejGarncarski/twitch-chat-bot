import { api } from '@/api/api-treaty'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/utils/format-duration'
import { useMutation } from '@tanstack/react-query'
import { Clock3, LoaderIcon, Pause, Play, Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type RefObject } from 'react'

type PlayerProps = {
  videoRef: RefObject<HTMLVideoElement | null>
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
}

export const Player = ({ currentSong, playbackData, videoRef }: PlayerProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (playbackData.isPlaying) {
        await api.pause.post()

        if (videoRef.current) {
          videoRef.current.pause()
        }
      } else {
        await api.play.post()
      }

      return new Promise((resolve) => setTimeout(resolve, 1300))
    },
  })

  return (
    <motion.div
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      initial={{ opacity: 0, transition: { duration: 0.5 } }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="flex gap-8 items-center justify-center py-10 w-full px-2"
    >
      <div
        className="w-32 relative shrink-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={currentSong.thumbnail || undefined}
          alt={currentSong.title}
          className="w-full h-h-full rounded border border-gray-600"
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
        <div className="flex justify-between items-center">
          <p className="text-xl font-semibold max-w-[39ch] truncate">{currentSong.title}</p>
        </div>
        <div className="flex gap-2 justify-between items-center">
          <p className="text-base text-gray-200 flex items-center gap-2">
            <Clock3 size={18} /> {formatDuration(playbackData?.playTime || 0)} /{' '}
            {formatDuration(currentSong.duration)}
          </p>
          <p className="flex items-center gap-1">
            {playbackData.volume === 0 ? (
              <VolumeX size={18} className="inline-block mr-1" />
            ) : playbackData.volume < 0.2 ? (
              <Volume size={18} className="inline-block mr-1" />
            ) : playbackData.volume < 0.5 ? (
              <Volume1 size={18} className="inline-block mr-1" />
            ) : (
              <Volume2 size={18} className="inline-block mr-1" />
            )}
            {Math.round(playbackData?.volume * 100) || 0}%
          </p>
        </div>
      </div>
    </motion.div>
  )
}
