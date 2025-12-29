import { useEffect, type RefObject } from "react"

export const useVolume = (playerRef: RefObject<HTMLVideoElement | null>, volume: number) => {
  useEffect(() => {
    const videoElement = playerRef.current

    if (!videoElement) {
      console.warn("Video element not found")
      return
    }

    if (volume < 0 || volume > 1) {
      console.warn("Volume must be between 0 and 1")
      return
    }

    videoElement.volume = volume
  }, [playerRef, volume])
}
