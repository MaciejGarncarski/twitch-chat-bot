import { usePlayerData } from "@/features/player/components/player-data-provider"
import { InteractionNotification } from "@/features/player/components/interaction-notification"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useInteraction } from "@/hooks/use-interaction"
import { usePlayState } from "@/features/player/hooks/use-play-state"
import { useQueue } from "@/features/queue/hooks/use-queue"
import { useVolume } from "@/features/player/hooks/use-volume"
import { useEffect, useRef, useState } from "react"
import ReactPlayer from "react-player"

const MAX_RETRIES = 20
const RETRY_BASE_DELAY_MS = 5000

export function PlayerYT() {
  const [isMuted, setIsMuted] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [isReady, setIsReady] = useState(true)

  const { data: queueData, isLoading: isQueueLoading } = useQueue()
  const { isPlaying, playTime, volume, status, songId } = usePlayerData()
  const { hasInteracted, handleInteract } = useInteraction()
  const playerRef = useRef<HTMLVideoElement>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  usePlayState(playerRef, playTime, isPlaying)
  useVolume(playerRef, volume)
  useAuth()

  const currentSong = queueData?.find((song) => song.id === songId) ?? null
  const songSrc = currentSong?.videoUrl

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRetryCount(0)
    setIsMuted(true)
    setIsReady(false)

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [songSrc, setIsReady])

  const handleReady = () => {
    setIsMuted(false)
    setIsReady(true)
  }

  const handleError = () => {
    setIsReady(false)
    setIsMuted(true)

    if (retryCount >= MAX_RETRIES) return

    const delay = Math.min(RETRY_BASE_DELAY_MS * 2 ** retryCount, 10_000)

    retryTimeoutRef.current = setTimeout(() => {
      setRetryCount((c) => c + 1)
    }, delay)
  }

  if (!songSrc || isQueueLoading || status !== "success") {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-0 bottom-0 cursor-not-allowed opacity-100">
      <ReactPlayer
        key={`${songSrc}-${retryCount}`}
        ref={playerRef}
        src={songSrc}
        volume={hasInteracted && isPlaying && isReady ? volume : 0}
        muted={isMuted || !isReady}
        playing={isPlaying && isReady}
        onReady={handleReady}
        onError={handleError}
        config={{
          youtube: {
            disablekb: 1,
            enablejsapi: 1,
            iv_load_policy: 3,
          },
        }}
      />
      <InteractionNotification hasInteracted={hasInteracted} onInteract={handleInteract} />
    </div>
  )
}
