import { z } from "zod"

export const JWTPayloadSchema = z.object({
  sub: z.string(),
  login: z.string(),
  role: z.enum(["MOD", "USER"]),
  iat: z.number(),
})

export type JWTPayload = z.infer<typeof JWTPayloadSchema>
