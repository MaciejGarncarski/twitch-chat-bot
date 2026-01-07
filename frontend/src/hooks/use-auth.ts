import { api } from "@/api/api-treaty"
import { queryOptions, useQuery } from "@tanstack/react-query"

export const authQueryOptions = queryOptions({
  queryKey: ["auth"],
  queryFn: async () => {
    const response = await api.api.auth.status.get()
    const isMod = response.data?.user?.role === "MOD"

    return {
      authenticated: response.data?.authenticated || false,
      user: response.data?.user || null,
      avatar: response.data?.user?.avatar || null,
      isMod,
    }
  },
})

export function useAuth() {
  return useQuery(authQueryOptions)
}
