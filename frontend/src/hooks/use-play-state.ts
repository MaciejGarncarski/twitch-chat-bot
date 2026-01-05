import { useEffect, useRef, type RefObject } from "react"

const MAX_ALLOWED_DRIFT = 2

export const usePlayState = (
  playerRef: RefObject<HTMLVideoElement | null>,
  serverPlayTime: number,
  isPlaying: boolean,
) => {
  const isProcessingSeek = useRef(false)

  useEffect(() => {
    const media = playerRef.current
    if (!media) return

    if (isPlaying && media.paused) {
      media.play().catch(() => {})
    } else if (!isPlaying && !media.paused) {
      media.pause()
    }

    const localTime = media.currentTime
    const drift = Math.abs(serverPlayTime - localTime)

    if (drift > MAX_ALLOWED_DRIFT && !isProcessingSeek.current) {
      console.log(`[Sync] Skok z ${localTime.toFixed(2)} do ${serverPlayTime.toFixed(2)}`)

      media.currentTime = serverPlayTime

      const onSeeked = () => {
        isProcessingSeek.current = false
        media.removeEventListener("seeked", onSeeked)
      }

      media.addEventListener("seeked", onSeeked)

      setTimeout(() => {
        isProcessingSeek.current = false
      }, 2000)
    }
  }, [serverPlayTime, isPlaying, playerRef])
}
