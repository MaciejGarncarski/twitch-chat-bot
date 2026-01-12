import { api } from "@/api/api-treaty"
import { useMutation } from "@tanstack/react-query"

export const useSeekPosition = () => {
  return useMutation({
    mutationFn: async (newPosition: number) => {
      await api.api.player.seek.post({ position: newPosition })
    },
  })
}
