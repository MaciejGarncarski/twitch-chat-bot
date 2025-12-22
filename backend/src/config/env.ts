import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .union([z.literal('development'), z.literal('production'), z.literal('test')])
    .default('development'),
  API_URL: z.string(),
  APP_ORIGINS: z
    .string()
    .transform((str) => str.split(',').map((s) => s.trim()))
    .pipe(z.array(z.url()).min(1)),
  PORT: z.string().length(4),
  TWITCH_CLIENT_ID: z.string(),
  TWITCH_CLIENT_SECRET: z.string(),
  TWITCH_REFRESH_TOKEN: z.string(),
  TWITCH_ACCESS_TOKEN: z.string(),
  TWITCH_BROADCASTER_ID: z.string(),
  YT_COOKIE: z.string().optional(),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.log(parsedEnv.error)
  process.exit(1)
}

export const env = parsedEnv.data
