import z from "zod"

export const playbackStatusWSSchema = z.object({
  isPlaying: z.boolean(),
  volume: z.number().min(0).max(100),
  songId: z.string().nullable(),
  playTime: z.number().min(0),
  isLoopEnabled: z.boolean(),
  startedAt: z.number().nullable(),
  serverTime: z.number(),
})

export type PlaybackStatusWS = z.infer<typeof playbackStatusWSSchema>

export type PlayerDataReturn =
  | {
      volume: number
      playTime: number
      isPlaying: boolean
      songId: string | null
      isLoopEnabled: boolean
      status: "loading"
    }
  | {
      volume: number
      playTime: number
      isPlaying: boolean
      songId: string | null
      isLoopEnabled: boolean
      status: "success"
    }
