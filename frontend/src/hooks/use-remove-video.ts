import { api } from "@/api/api-treaty"
import { useMutation } from "@tanstack/react-query"

export function useRemoveVideo() {
  return useMutation({
    mutationFn: async (videoId: string) => {
      await api.api.player.remove.post({ videoId })
      return new Promise((resolve) => setTimeout(resolve, 200))
    },
    onSettled: (_, __, ___, ____, ctx) => {
      ctx.client.invalidateQueries({ queryKey: ["queue"] })
    },
  })
}
