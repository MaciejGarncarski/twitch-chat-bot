import { api } from "@/api/api-treaty"
import { useMutation } from "@tanstack/react-query"

export const useSetVolume = () => {
  return useMutation({
    mutationFn: async (newVolume: number) => {
      await api.api.player.volume.post({ volume: newVolume })
    },
  })
}
