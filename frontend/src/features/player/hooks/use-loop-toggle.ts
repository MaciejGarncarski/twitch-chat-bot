import { api } from "@/api/api-treaty"
import { useMutation } from "@tanstack/react-query"

export function useLoopToggle() {
  return useMutation({
    mutationFn: async () => {
      await api.api.player["loop-toggle"].post()

      return new Promise((resolve) => setTimeout(resolve, 200))
    },
  })
}
