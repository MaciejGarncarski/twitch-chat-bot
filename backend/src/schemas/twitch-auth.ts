import z from "zod"

export const userResponseSchema = z.object({
  client_id: z.string(),
  login: z.string(),
  scopes: z.array(z.string()),
  user_id: z.string(),
  expires_in: z.number(),
})

export const refreshResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  scope: z.array(z.string()).optional(),
  token_type: z.string().optional(),
})

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  scope: z.array(z.string()),
  token_type: z.string(),
})
