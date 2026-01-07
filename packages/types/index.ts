import { z } from "zod"

export const JWTPayloadSchema = z.object({
  sub: z.string(),
  login: z.string(),
  role: z.enum(["MOD", "USER"]),
  avatar: z.url().optional().nullable().default(null),
})

export type JWTPayload = z.infer<typeof JWTPayloadSchema>
