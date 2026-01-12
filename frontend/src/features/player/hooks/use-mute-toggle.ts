import { api } from "@/api/api-treaty"
import { useMutation } from "@tanstack/react-query"

export function useMuteToggle() {
  return useMutation({
    mutationFn: async () => {
      await api.api.player.muteToggle.post()

      return new Promise((resolve) => setTimeout(resolve, 200))
    },
  })
}
