import z from "zod"

export const songRequestInputSchema = z.object({
  username: z.string().min(1),
  videoId: z.string(),
})

export type QueuedItem = {
  id: string
  username: string
  videoUrl: string
  videoAuthor: string | null
  duration: number
  title: string
  requestedAt: Date
  thumbnail: string | null
}
