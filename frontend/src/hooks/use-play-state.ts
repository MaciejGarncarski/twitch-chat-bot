import { useEffect, type RefObject } from "react"

const MAX_ALLOWED_DRIFT = 0.8

export const usePlayState = (
  playerRef: RefObject<HTMLAudioElement | HTMLVideoElement | null>,
  serverPlayTime: number,
  isPlaying: boolean,
) => {
  useEffect(() => {
    const media = playerRef.current
    if (!media) return

    if (isPlaying && media.paused) {
      media.play().catch((e) => {
        console.warn("[Playback] Playback postponed (user interaction required):", e)
      })
    } else if (!isPlaying && !media.paused) {
      media.pause()
    }

    const localTime = media.currentTime
    const drift = Math.abs(serverPlayTime - localTime)

    if (drift > MAX_ALLOWED_DRIFT) {
      media.currentTime = serverPlayTime
    }
  }, [serverPlayTime, isPlaying, playerRef])
}
