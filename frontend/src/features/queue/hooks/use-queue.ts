import { api } from "@/api/api-treaty"
import { queryOptions, useQuery } from "@tanstack/react-query"

export const queueQueryOptions = queryOptions({
  queryKey: ["queue"],
  queryFn: async () => {
    const data = (await api.api.queue.get()) as { data: QueueTrackedItem[] }
    return data.data
  },
  refetchInterval: 1000,
})

export function useQueue() {
  return useQuery(queueQueryOptions)
}

export type QueueTrackedItem = {
  id: string
  username: string
  videoUrl: string
  duration: number
  title: string
  requestedAt: Date
  thumbnail: string | null
  timeUntilPlay: number
  videoAuthor: string | null
}
