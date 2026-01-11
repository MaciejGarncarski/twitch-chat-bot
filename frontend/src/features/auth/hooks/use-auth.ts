import { api } from "@/api/api-treaty"
import { queryOptions, useQuery } from "@tanstack/react-query"

export const authQueryOptions = queryOptions({
  queryKey: ["auth"],
  staleTime: 5 * 60 * 1000, // 5 minutes
  queryFn: async () => {
    const response = await api.api.auth.me.get()
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
