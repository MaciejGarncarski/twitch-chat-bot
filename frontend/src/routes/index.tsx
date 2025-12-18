import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { z } from 'zod'
import useWebSocket from 'react-use-websocket'
import { useVolume } from '@/hooks/use-volume'
import { usePlayState } from '@/hooks/use-play-state'
import { useHls } from '@/hooks/use-hls'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { api } from '@/api/api-treaty'
import { Player } from '@/components/player'
import { Queue } from '@/components/queue'

const playbackSchema = z
  .object({
    isPlaying: z.boolean(),
    volume: z.number(),
    playTime: z.number(),
    startedAt: z.number().nullable(),
    songId: z.string().nullable(),
  })
  .nullable()

export type QueueTrackedItem = {
  id: string
  username: string
  videoUrl: string
  duration: number
  title: string
  requestedAt: Date
  thumbnail: string | null
  position: number
  timeUntilPlay: number
  formattedTimeUntilPlay: string
}

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)

  const { isLoading, data: queueData } = useQuery({
    queryKey: ['queue'],
    queryFn: async () => {
      const data = (await api.queue.get()) as { data: QueueTrackedItem[] }
      return data.data
    },
    refetchInterval: 1500,
  })

  const { lastJsonMessage } = useWebSocket('ws://localhost:3001/ws')
  const parsedPlaybackData = playbackSchema.safeParse(lastJsonMessage)
  const playbackData = parsedPlaybackData.success ? parsedPlaybackData.data : null

  useHls(videoRef, playbackData?.songId || null)
  usePlayState(videoRef, playbackData?.playTime || 0, playbackData?.isPlaying || false)
  useVolume(videoRef, playbackData?.volume ?? 0.2)

  const currentSong = queueData?.find((item) => item.id === playbackData?.songId)

  return (
    <div className="text-center min-h-screen max-w-2xl mx-auto px-8 py-10 flex flex-col gap-4">
      <div className="flex flex-col gap-4 items-center px-4 min-h-40">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.p
              key="loading"
              className="h-27 flex items-center justify-center text-2xl"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Ładowanie...
            </motion.p>
          ) : currentSong && playbackData ? (
            <Player
              key={`${currentSong.id}-player`}
              currentSong={currentSong}
              playbackData={playbackData}
              videoRef={videoRef}
            />
          ) : (
            <motion.p
              key="empty"
              className="h-27 flex items-center justify-center text-2xl"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Brak piosenek w kolejce.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {isLoading || queueData?.length === 0 ? null : <Queue />}
      </AnimatePresence>

      <div className="">
        <video ref={videoRef} />
      </div>
    </div>
  )
}
