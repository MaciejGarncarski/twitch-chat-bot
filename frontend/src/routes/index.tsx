import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { z } from 'zod'
import useWebSocket from 'react-use-websocket'
import { useVolume } from '@/hooks/use-volume'
import { usePlayState } from '@/hooks/use-play-state'
import { AnimatePresence, motion } from 'motion/react'
import { api } from '@/api/api-treaty'
import { Player } from '@/components/player'
import { Queue } from '@/components/queue'
import { PlayerYT } from '@/components/player-yt'
import { BackgroundWakeLock } from '@/components/bg-wake-lock'

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
  const [isReady, setIsReady] = useState(true)
  const playerRef = useRef<HTMLVideoElement>(null)

  const { isLoading, data: queueData } = useQuery({
    queryKey: ['queue'],
    queryFn: async () => {
      const data = (await api.queue.get()) as { data: QueueTrackedItem[] }
      return data.data
    },
    refetchInterval: 1500,
  })

  const { lastJsonMessage } = useWebSocket('ws://localhost:3001/ws', {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  })
  const parsedPlaybackData = playbackSchema.safeParse(lastJsonMessage)
  const playbackData = parsedPlaybackData.success ? parsedPlaybackData.data : null

  usePlayState(playerRef, playbackData?.playTime || 0, playbackData?.isPlaying || false)
  useVolume(playerRef, playbackData?.volume ?? 0.2)
  const currentSong = queueData?.find((item) => item.id === playbackData?.songId)

  return (
    <div className="text-center min-h-screen max-w-3xl mx-auto px-8 py-10 flex flex-col gap-4">
      <div className="flex flex-col gap-4 items-center px-4 min-h-40">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.p
              key="loading"
              className="h-34 flex items-center justify-center text-2xl bg-neutral-900/90 border rounded-md w-full"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Ładowanie...
            </motion.p>
          ) : currentSong && playbackData ? (
            <Player
              isReady={isReady}
              currentSong={currentSong}
              playbackData={playbackData}
              playerRef={playerRef}
            />
          ) : (
            <motion.p
              key="empty"
              className="h-34 flex items-center justify-center text-2xl bg-neutral-900/90 border rounded-md w-full"
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

      {currentSong && (
        <PlayerYT
          isReady={isReady}
          currentSong={currentSong}
          playbackData={playbackData}
          playerRef={playerRef}
          setIsReady={setIsReady}
        />
      )}
      <BackgroundWakeLock />
    </div>
  )
}
