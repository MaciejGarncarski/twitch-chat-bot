import { createFileRoute } from '@tanstack/react-router'
import { treaty } from '@elysiajs/eden'
import type { App as AppTreaty } from '@ttv-song-request/eden-rpc'
import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { z } from 'zod'
import useWebSocket from 'react-use-websocket'
import { Button } from '@/components/ui/button'
import { useVolume } from '@/hooks/use-volume'
import { usePlayState } from '@/hooks/use-play-state'
import { useHls } from '@/hooks/use-hls'
import { formatDuration } from '@/utils/format-duration'
import { AnimatePresence, motion } from 'motion/react'
import { Pause, Play } from 'lucide-react'

const playbackSchema = z
  .object({
    isPlaying: z.boolean(),
    volume: z.number(),
    playTime: z.number(),
    startedAt: z.number().nullable(),
    songId: z.string().nullable(),
  })
  .nullable()

export const Route = createFileRoute('/')({
  component: App,
})

const api = treaty<AppTreaty>('localhost:3001')

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)

  const { isLoading, data: queueData } = useQuery({
    queryKey: ['queue'],
    queryFn: async () => {
      const data = await api.queue.get()
      return data.data
    },
    refetchInterval: 2000,
  })

  const { lastJsonMessage } = useWebSocket('ws://localhost:3001/ws')
  const parsedPlaybackData = playbackSchema.safeParse(lastJsonMessage)
  const playbackData = parsedPlaybackData.success ? parsedPlaybackData.data : null

  useHls(videoRef, playbackData?.songId || null)
  usePlayState(videoRef, playbackData?.playTime || 0, playbackData?.isPlaying || false)
  useVolume(videoRef, playbackData?.volume ?? 1)

  const currentSong = queueData?.find((item) => item.id === playbackData?.songId)

  return (
    <div className="text-center bg-black min-h-screen max-w-2xl mx-auto px-8 py-10">
      <div className="flex flex-col gap-4 items-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.p className="py-28 text-white text-2xl">Ładowanie...</motion.p>
          ) : (
            <>
              {currentSong ? (
                <motion.div
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-white flex flex-col gap-2 items-center py-10"
                >
                  <img
                    src={currentSong.thumbnail}
                    alt={currentSong.title}
                    className="h-24 mb-4 rounded border border-gray-500"
                  />

                  <div className="flex flex-col gap-1">
                    <p className="text-xl font-semibold">{currentSong.title}</p>
                  </div>
                  <div className="flex gap-8 items-center">
                    {playbackData?.isPlaying ? (
                      <Button onClick={() => api.pause.post()}>
                        <Pause size={13} />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          api.play.post()
                        }}
                      >
                        <Play />
                        Play
                      </Button>
                    )}
                    <p className="text-xl text-gray-200">
                      Czas: {formatDuration(playbackData?.playTime || 0)} /{' '}
                      {formatDuration(currentSong.duration)}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.p className="py-28 text-white text-2xl">Brak piosenek w kolejce.</motion.p>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col px-2">
        <h2>Kolejka</h2>
        <div className="border rounded-lg border-gray-700 overflow-hidden min-h-56">
          <AnimatePresence>
            {queueData?.map((item, idx) => (
              <motion.div
                key={item.id}
                exit={{ opacity: 0, translateY: 0, translateX: -100 }}
                initial={{ opacity: 0, translateY: 20, translateX: 0 }}
                animate={{ opacity: 1, translateY: 0, translateX: 0 }}
                className="p-4 border-b border-gray-700 bg-gray-900 flex items-center "
              >
                {item.thumbnail && (
                  <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="h-16 object-cover mr-4 rounded border border-gray-500"
                    />
                  </a>
                )}
                <div className="text-left">
                  <div className="text-white font-semibold">{item.title}</div>
                  <div className="text-gray-400 text-sm">
                    Czas trwania: {formatDuration(item.duration)} |{' '}
                    {idx === 0
                      ? '(Aktualnie odtwarzane)'
                      : `Odtwarzane za ${item.formattedTimeUntilPlay}`}
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
