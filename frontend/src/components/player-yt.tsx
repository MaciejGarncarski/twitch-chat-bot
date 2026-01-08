import { InteractionNotification } from "@/components/player/interaction-notification"
import { useAuth } from "@/hooks/use-auth"
import { useInteraction } from "@/hooks/use-interaction"
import { usePlayState } from "@/hooks/use-play-state"
import { usePlayerData } from "@/hooks/use-player-data"
import { useQueue } from "@/hooks/use-queue"
import { useVolume } from "@/hooks/use-volume"
import { useEffect, useRef, useState } from "react"
import ReactPlayer from "react-player"

const MAX_RETRIES = 5
const RETRY_BASE_DELAY_MS = 5000

export function PlayerYT() {
  const { data: queueData, isLoading: isQueueLoading } = useQueue()
  const { isPlaying, playTime, volume, status } = usePlayerData()
  const { hasInteracted, handleInteract } = useInteraction()
  const playerRef = useRef<HTMLVideoElement>(null)
  const currentSong = queueData?.[0] ?? null

  usePlayState(playerRef, playTime, isPlaying)
  useVolume(playerRef, volume)
  useAuth()

  const [isMuted, setIsMuted] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [isReady, setIsReady] = useState(true)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  if (!songSrc || isQueueLoading || status !== "success") return null

  return (
    <>
      <div className="pointer-events-none fixed right-0 bottom-0 cursor-not-allowed opacity-100">
        <ReactPlayer
          key={`${songSrc}-${retryCount}`}
          ref={playerRef}
          src={songSrc}
          volume={volume}
          muted={isMuted}
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
    </>
  )
}
