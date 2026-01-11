import z from "zod"

export const twitchUserResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      login: z.string(),
      display_name: z.string(),
      type: z.string(),
      broadcaster_type: z.string(),
      description: z.string(),
      profile_image_url: z.string(),
      offline_image_url: z.string(),
      view_count: z.number(),
      email: z.string().optional(),
      created_at: z.string(),
    }),
  ),
})

export type TwitchUserResponse = z.infer<typeof twitchUserResponseSchema>
