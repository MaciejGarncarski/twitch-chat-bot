import z from 'zod'

export const playbackStatusWSSchema = z.object({
  isPlaying: z.boolean(),
  volume: z.number().min(0).max(100),
  songId: z.string().nullable(),
  playTime: z.number().min(0),
  startedAt: z.number().nullable(),
  serverTime: z.number(),
})

export type PlaybackStatusWS = z.infer<typeof playbackStatusWSSchema>
