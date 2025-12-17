import { useEffect, type RefObject } from 'react'

export const useVolume = (videoRef: RefObject<HTMLVideoElement | null>, volume: number) => {
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) {
      return
    }
    videoElement.volume = volume
  }, [videoRef, volume])
}
