import z from 'zod'

export const songRequestInputSchema = z.object({
  username: z.string().min(1),
  videoUrl: z.string(),
  videoId: z.string(),
})

export type QueuedItem = {
  id: string
  username: string
  videoUrl: string
  duration: number
  title: string
  requestedAt: Date
  thumbnail: string | null
}

export type QueueTrackedItem = {
  id: string
  username: string
  videoUrl: string
  duration: number
  title: string
  requestedAt: Date
  thumbnail: string | null
  position: number
  timeUntilPlay: number
  formattedTimeUntilPlay: string
}
