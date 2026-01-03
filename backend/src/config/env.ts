import { z } from "zod"

const isTest = process.env.NODE_ENV === "test"

const envSchema = z.object({
  NODE_ENV: z
    .union([z.literal("development"), z.literal("production"), z.literal("test")])
    .default("development"),
  API_URL: isTest ? z.string().default("http://localhost:3302") : z.string(),
  APP_ORIGINS: isTest
    ? z
        .string()
        .default("http://localhost:3300")
        .transform((str) => str.split(",").map((s) => s.trim()))
        .pipe(z.array(z.url()).min(1))
    : z
        .string()
        .transform((str) => str.split(",").map((s) => s.trim()))
        .pipe(z.array(z.url()).min(1)),
  PORT: isTest ? z.string().length(4).default("3302") : z.string().length(4),
  JWT_SECRET: isTest ? z.string().default("test-secret") : z.string(),
  FRONTEND_URL: z.string().default("http://localhost:3301"),
  COOKIE_DOMAIN: z.string().default("localhost"),
  TWITCH_CLIENT_ID: z.string().default("CHECK_README_FOR_INFO"),
  TWITCH_CLIENT_SECRET: z.string().default("CHECK_README_FOR_INFO"),
  TWITCH_BROADCASTER_NAME: z.string().default("CHECK_README_FOR_INFO"),
  TWITCH_REFRESH_TOKEN: z.string().default("CHECK_README_FOR_INFO"),
  APP_REDIRECT_URI: z.url().default("http://localhost:3302/api/auth/callback/app"),
  SETUP_REDIRECT_URI: z.url().default("http://localhost:3302/api/auth/callback/setup"),
  USERS_TREATED_AS_MODERATORS: z
    .string()
    .default("")
    .transform((str) => str.split(",").map((s) => s.trim().toLowerCase()))
    .pipe(z.array(z.string().min(1)))
    .optional()
    .default([]),
  YT_COOKIE: z.string().optional(),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  // eslint-disable-next-line no-console
  console.log(parsedEnv.error)
  process.exit(1)
}

export const env = parsedEnv.data
