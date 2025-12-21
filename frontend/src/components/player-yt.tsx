import type { QueueTrackedItem } from '@/routes'
import { useState, type RefObject } from 'react'
import ReactPlayer from 'react-player'

type Props = {
  isReady: boolean
  currentSong: QueueTrackedItem | null
  playbackData: {
    volume: number
    isPlaying: boolean
  } | null
  playerRef: RefObject<HTMLVideoElement | null>
  setIsReady: (ready: boolean) => void
}

export function PlayerYT({ currentSong, playbackData, playerRef, setIsReady }: Props) {
  const [isMuted, setIsMuted] = useState(true)

  const isPlaying = playbackData?.isPlaying ?? false
  const volume = playbackData?.volume ?? 0
  const songSrc = currentSong?.videoUrl ?? undefined

  return (
    <ReactPlayer
      src={songSrc}
      volume={volume}
      muted={isMuted}
      ref={playerRef}
      autoPlay
      playing={isPlaying}
      fallback={<div>Loading...</div>}
      className="absolute bottom-0"
      config={{
        youtube: {
          disablekb: 1,
          enablejsapi: 1,
          iv_load_policy: 3,
          cc_load_policy: undefined,
        },
      }}
      onReady={() => {
        setTimeout(() => {
          setIsReady(true)
          setIsMuted(false)
        }, 1500)
      }}
      onError={(e) => {
        console.log('LOG LOG LOG')
        console.error('ReactPlayer Error:', e)
        setIsMuted(true)
        setTimeout(() => {
          setIsReady(true)
        }, 1500)

        setIsReady(false)
      }}
    />
  )
}
