import { api } from "@/api/api-treaty"
import { useMutation } from "@tanstack/react-query"
import type { RefObject } from "react"

type Props = {
  isPlaying: boolean
  playerRef: RefObject<HTMLVideoElement | null>
}

export function useSetPlayState({ isPlaying, playerRef }: Props) {
  return useMutation({
    mutationFn: async () => {
      if (isPlaying) {
        await api.api.pause.post()

        if (playerRef.current) {
          playerRef.current.pause()
        }
      } else {
        await api.api.play.post()
      }

      return new Promise((resolve) => setTimeout(resolve, 1300))
    },
  })
}
