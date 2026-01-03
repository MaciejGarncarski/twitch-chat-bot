import { api } from "@/api/api-treaty"
import { useMutation } from "@tanstack/react-query"

export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      return api.api.auth["sign-out"].delete()
    },
    onSuccess: (_, __, ___, ctx) => {
      ctx.client.invalidateQueries({ queryKey: ["auth"] })
    },
  })
}
