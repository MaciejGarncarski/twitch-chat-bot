import type { QueueTrackedItem } from '@/hooks/use-queue'
import { useEffect, useRef, useState, type RefObject } from 'react'
import ReactPlayer from 'react-player'

const MAX_RETRIES = 5
const RETRY_BASE_DELAY_MS = 5000

type Props = {
  volume: number
  isPlaying: boolean
  currentSong: QueueTrackedItem | null
  playerRef: RefObject<HTMLVideoElement | null>
  setIsReady: (ready: boolean) => void
}

export function PlayerYT({ currentSong, volume, isPlaying, playerRef, setIsReady }: Props) {
  const [isMuted, setIsMuted] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const songSrc = currentSong?.videoUrl

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRetryCount(0)
    setIsMuted(true)
    setIsReady(false)

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
  }, [songSrc, setIsReady])

  const handleReady = () => {
    retryTimeoutRef.current = setTimeout(() => {
      setIsMuted(false)
      setIsReady(true)
    }, RETRY_BASE_DELAY_MS)
  }

  const handleError = (error: unknown) => {
    console.error('ReactPlayer error:', error)

    setIsReady(false)
    setIsMuted(true)

    if (retryCount >= MAX_RETRIES) {
      console.error('Max retries reached. Giving up.')
      return
    }

    const delay = Math.min(RETRY_BASE_DELAY_MS * 2 ** retryCount, 10_000)

    retryTimeoutRef.current = setTimeout(() => {
      setRetryCount((c) => c + 1)
    }, delay)
  }

  if (!songSrc) return null

  return (
    <ReactPlayer
      key={`${songSrc}-${retryCount}`}
      ref={playerRef}
      src={songSrc}
      volume={volume}
      muted={isMuted}
      playing={isPlaying}
      fallback={<div>Loading…</div>}
      className="absolute bottom-0"
      config={{
        youtube: {
          disablekb: 1,
          enablejsapi: 1,
          iv_load_policy: 3,
        },
      }}
      onReady={handleReady}
      onError={handleError}
    />
  )
}
