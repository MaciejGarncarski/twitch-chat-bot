import { useEffect, type RefObject } from "react"

export const useVolume = (playerRef: RefObject<HTMLVideoElement | null>, volume: number) => {
  useEffect(() => {
    const videoElement = playerRef.current

    if (!videoElement) {
      return
    }

    if (volume < 0 || volume > 1) {
      return
    }

    videoElement.volume = volume
  }, [playerRef, volume])
}
