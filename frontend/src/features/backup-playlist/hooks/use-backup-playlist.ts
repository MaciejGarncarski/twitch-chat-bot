import { api } from "@/api/api-treaty"
import { useMutation, useQuery } from "@tanstack/react-query"
import { queryOptions } from "@tanstack/react-query"

export type BackupStatus = {
  playlistUrl: string | null
  playlistId: string | null
  videoIds: string[]
  createdAt: string | null
  remaining: number
}

export const backupQueryOptions = queryOptions({
  queryKey: ["backup"],
  queryFn: async () => {
    const { data } = await api.api.backup.get()
    return data as unknown as BackupStatus
  },
  refetchInterval: 5000,
})

export type BackupVideoInfo = {
  id: string
  title: string
  thumbnail: string | null
  duration: number
  author: string | null
}

export const backupVideosQueryOptions = queryOptions({
  queryKey: ["backup", "videos"],
  queryFn: async () => {
    const { data } = await api.api.backup.videos.get()
    return data as unknown as BackupVideoInfo[]
  },
  staleTime: 60_000,
})

export function useBackupStatus() {
  return useQuery(backupQueryOptions)
}

export function useBackupVideos() {
  return useQuery(backupVideosQueryOptions)
}

export function useSetBackupPlaylist() {
  return useMutation({
    mutationFn: async (url: string) => {
      const { data } = await api.api.backup.set.post({ url })
      return data as unknown as { total: number }
    },
    onSettled: (_, __, ___, ____, ctx) => {
      ctx.client.invalidateQueries({ queryKey: ["backup"] })
      ctx.client.invalidateQueries({ queryKey: ["backup", "videos"] })
    },
  })
}

export function useClearBackupPlaylist() {
  return useMutation({
    mutationFn: async () => {
      await api.api.backup.clear.post()
      return new Promise((resolve) => setTimeout(resolve, 200))
    },
    onSettled: (_, __, ___, ____, ctx) => {
      ctx.client.invalidateQueries({ queryKey: ["backup"] })
      ctx.client.invalidateQueries({ queryKey: ["backup", "videos"] })
    },
  })
}

export function useRefillBackupPlaylist() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.api.backup.refill.post()
      return data as unknown as { total: number }
    },
    onSettled: (_, __, ___, ____, ctx) => {
      ctx.client.invalidateQueries({ queryKey: ["backup"] })
      ctx.client.invalidateQueries({ queryKey: ["backup", "videos"] })
    },
  })
}
