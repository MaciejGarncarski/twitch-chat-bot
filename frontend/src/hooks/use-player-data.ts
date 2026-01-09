import { playbackStatusWSSchema } from "@/schemas/playback-status-ws"
import { useMemo } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"

export function usePlayerData(): PlayerDataReturn {
  const { lastJsonMessage, readyState } = useWebSocket(
    import.meta.env.VITE_WS_URL || "ws://localhost:3001/ws",
    {
      share: true,
      shouldReconnect: () => true,
      reconnectAttempts: 100,
      reconnectInterval: (attemptNumber) => Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
    },
  )

  const parsedPlaybackData = useMemo(
    () => playbackStatusWSSchema.safeParse(lastJsonMessage),
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
  const isLoopEnabled = playbackData?.isLoopEnabled ?? false

  const isConnected = readyState === ReadyState.OPEN

  if (!playbackData) {
    return {
      volume,
      playTime,
      isPlaying,
      songId,
      isLoopEnabled,
      status: "loading",
    }
  }

  return {
    volume,
    playTime,
    isPlaying,
    songId,
    isLoopEnabled,
    status: isConnected ? "success" : "loading",
  }
}

type PlayerDataReturn =
  | {
      volume: number
      playTime: number
      isPlaying: boolean
      songId: string | null
      isLoopEnabled: boolean
      status: "loading"
    }
  | {
      volume: number
      playTime: number
      isPlaying: boolean
      songId: string | null
      isLoopEnabled: boolean
      status: "success"
    }
