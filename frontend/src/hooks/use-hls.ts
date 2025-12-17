import Hls from 'hls.js'
import { useEffect, type RefObject } from 'react'

export const useHls = (videoRef: RefObject<HTMLVideoElement | null>, songId: string | null) => {
  useEffect(() => {
    const hlsUrl = 'http://localhost:3001/stream/' + songId + `/${songId}.m3u8`
    const videoElement = videoRef.current
    let hlsInstance: Hls | null = null

    if (!songId || !videoElement) {
      return
    }

    if (Hls.isSupported()) {
      hlsInstance = new Hls()

      hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
        hlsInstance?.loadSource(hlsUrl)
      })
      hlsInstance.attachMedia(videoElement)
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = hlsUrl
      videoElement.load()
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy()
      }
    }
  }, [songId, videoRef])
}
