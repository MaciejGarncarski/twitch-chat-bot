import { api } from "@/api/api-treaty"
import { useMutation } from "@tanstack/react-query"

export function useSkip() {
  return useMutation({
    mutationFn: async () => {
      await api.api.player.skip.post()

      return new Promise((resolve) => setTimeout(resolve, 200))
    },
    onSettled: (_, __, ___, ____, ctx) => {
      ctx.client.invalidateQueries({ queryKey: ["queue"] })
    },
  })
}
