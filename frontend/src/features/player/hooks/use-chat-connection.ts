import { api } from "@/api/api-treaty"
import { queryOptions, useQuery } from "@tanstack/react-query"

export const chatConnectionQueryOptions = queryOptions({
  queryKey: ["chat-connection"],
  queryFn: async () => {
    const response = await api.api["chat-connection"].get()
    return response.data?.isConnected ?? false
  },
  refetchInterval: 10_000,
})

export function useChatConnection() {
  return useQuery(chatConnectionQueryOptions)
}
