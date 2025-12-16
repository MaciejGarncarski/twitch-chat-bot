import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { z } from 'zod'
import useWebSocket from 'react-use-websocket'
import { useVolume } from '@/hooks/use-volume'
import { usePlayState } from '@/hooks/use-play-state'
import { useHls } from '@/hooks/use-hls'
import { formatDuration } from '@/utils/format-duration'
import { AnimatePresence, motion } from 'motion/react'
import { api } from '@/api/api-treaty'
import { Player } from '@/components/player'

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
  useVolume(videoRef, playbackData?.volume ?? 1)

  const currentSong = queueData?.find((item) => item.id === playbackData?.songId)

  return (
    <div className="text-center bg-neutral-900 text-white min-h-screen max-w-2xl mx-auto px-8 py-10">
      <div className="flex flex-col gap-4 items-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.p className="py-28 text-2xl">Ładowanie...</motion.p>
          ) : (
            <>
              {currentSong && playbackData ? (
                <Player currentSong={currentSong} playbackData={playbackData} />
              ) : (
                <motion.p className="py-28 text-2xl">Brak piosenek w kolejce.</motion.p>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col px-2">
        <h2 className="mr-auto ml-2 pb-2 text-lg font-semibold">Kolejka</h2>
        <div className="border rounded-lg border-neutral-700 overflow-hidden min-h-56">
          <AnimatePresence>
            {queueData?.map((item, idx) => (
              <motion.div
                layout
                key={item.id}
                exit={{
                  opacity: 0,
                  translateY: 0,
                  translateX: -100,
                  transition: { duration: 0.3 },
                }}
                initial={{
                  opacity: 0,
                  translateY: 20,
                  translateX: 0,
                  transition: { duration: 0.3 },
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                  translateX: 0,
                  transition: { duration: 0.3 },
                }}
                className="p-4 border-b border-neutral-700 bg-neutral-800 flex gap-4 items-center"
              >
                {item.thumbnail && (
                  <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="h-16 object-cover  rounded border border-neutral-500"
                    />
                  </a>
                )}
                <div className="text-left">
                  <div className="font-semibold">
                    {item.title} | Dodano przez @{item.username}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Czas trwania: {formatDuration(item.duration)}
                    {idx === 0 && ' | (Aktualnie odtwarzane)'}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="">
          <video ref={videoRef} />
        </div>
      </div>
    </div>
  )
}
