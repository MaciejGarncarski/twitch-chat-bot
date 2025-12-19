import path from "node:path";
import { z } from "zod";

const envSchema = z.object({
  API_URL: z.string(),
  APP_ORIGIN: z.string().startsWith("http"),
  PORT: z.string().length(4),
  CACHE_DIR: z.string().default(path.join(import.meta.dir, "..", "cache")),
  HLS_CACHE_TTL_SECONDS: z.coerce.number().int().min(0).default(0),
  NODE_ENV: z
    .union([
      z.literal("development"),
      z.literal("production"),
      z.literal("test"),
    ])
    .default("development"),
  TWITCH_CLIENT_ID: z.string(),
  TWITCH_CLIENT_SECRET: z.string(),
  TWITCH_REFRESH_TOKEN: z.string(),
  TWITCH_ACCESS_TOKEN: z.string(),
  TWITCH_BROADCASTER_ID: z.string(),
  YT_COOKIE: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.log(parsedEnv.error);
  process.exit(1);
}

export const env = parsedEnv.data;
