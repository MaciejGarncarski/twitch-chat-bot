import { useEffect, type RefObject } from 'react'

export const usePlayState = (
  playerRef: RefObject<HTMLVideoElement | null>,
  playTime: number,
  isPlaying: boolean,
) => {
  useEffect(() => {
    const videoElement = playerRef.current

    if (!videoElement) {
      return
    }

    if (isPlaying) {
      if (videoElement.paused) {
        videoElement.play().catch((e) => console.error('Auto-play blocked:', e))
      }
    } else {
      videoElement.pause()
    }

    const localPlayTime = videoElement.currentTime || 0
    const drift = Math.abs(playTime - localPlayTime)
    const MAX_DRIFT = 0.5

    if (drift > MAX_DRIFT) {
      videoElement.currentTime = playTime
    }
  }, [playTime, isPlaying, playerRef])
}
