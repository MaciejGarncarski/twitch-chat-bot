import { useMemo } from 'react'
import useWebSocket from 'react-use-websocket'
import z from 'zod'

export function usePlayerData() {
  const { lastJsonMessage } = useWebSocket(
    import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws',
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    },
  )

  const parsedPlaybackData = useMemo(
    () => playbackSchema.safeParse(lastJsonMessage),
    [lastJsonMessage],
  )
  const playbackData = useMemo(
    () => (parsedPlaybackData.success ? parsedPlaybackData.data : null),
    [parsedPlaybackData],
  )

  const volume = (playbackData?.volume ?? 20) / 100
  const playTime = playbackData?.playTime ?? 0
  const isPlaying = playbackData?.isPlaying ?? false
  const songId = playbackData?.songId ?? null

  return { volume, playTime, isPlaying, songId }
}

const playbackSchema = z
  .object({
    isPlaying: z.boolean(),
    volume: z.number(),
    playTime: z.number(),
    startedAt: z.number().nullable(),
    songId: z.string().nullable(),
  })
  .nullable()
