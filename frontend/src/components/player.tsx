import { api } from '@/api/api-treaty'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/utils/format-duration'
import { useMutation } from '@tanstack/react-query'
import { LoaderIcon, Pause, Play } from 'lucide-react'
import { motion } from 'motion/react'

type PlayerProps = {
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
    playTime: number
  }
}

export const Player = ({ currentSong, playbackData }: PlayerProps) => {
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (playbackData.isPlaying) {
        await api.pause.post()
      } else {
        await api.play.post()
      }

      return new Promise((resolve) => setTimeout(resolve, 1000))
    },
  })

  console.log(isPending)

  return (
    <motion.div
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      initial={{ opacity: 0, transition: { duration: 0.5 } }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className=" flex flex-col gap-2 items-center py-10"
    >
      <img
        src={currentSong.thumbnail || undefined}
        alt={currentSong.title}
        className="h-24 mb-4 rounded border border-gray-500"
      />

      <div className="flex flex-col gap-1">
        <p className="text-xl font-semibold">{currentSong.title}</p>
      </div>
      <div className="flex gap-8 items-center">
        <Button
          type="button"
          variant={'outline'}
          onClick={() => {
            mutate()
          }}
        >
          {isPending ? (
            <>
              <LoaderIcon size={13} className="animate-spin" />
              Ładowanie...
            </>
          ) : (
            <>
              {playbackData.isPlaying ? <Pause size={13} /> : <Play size={13} />}
              {playbackData.isPlaying ? 'Pauzuj' : 'Odtwórz'}
            </>
          )}
        </Button>

        <p className="text-xl text-gray-200">
          Czas: {formatDuration(playbackData?.playTime || 0)} /{' '}
          {formatDuration(currentSong.duration)}
        </p>
      </div>
    </motion.div>
  )
}
