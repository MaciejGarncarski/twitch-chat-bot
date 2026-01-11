import { api } from "@/api/api-treaty"
import { useMutation } from "@tanstack/react-query"

type Props = {
  isPlaying: boolean
}

export function useSetPlayState({ isPlaying }: Props) {
  return useMutation({
    mutationFn: async () => {
      if (isPlaying) {
        await api.api.player.pause.post()
      } else {
        await api.api.player.play.post()
      }

      return new Promise((resolve) => setTimeout(resolve, 200))
    },
  })
}
