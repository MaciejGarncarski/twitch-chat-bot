import { api } from '@/api/api-treaty'
import { useQuery } from '@tanstack/react-query'

export function useQueue() {
  return useQuery({
    queryKey: ['queue'],
    queryFn: async () => {
      const data = (await api.api.queue.get()) as { data: QueueTrackedItem[] }
      return data.data
    },
    refetchInterval: 1500,
  })
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
  formattedTimeUntilPlay: string
}
