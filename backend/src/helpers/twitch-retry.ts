import { logger } from "@/helpers/logger"
import pRetry from "p-retry"

let nextRequestAllowedAt = 0

export async function twitchFetch(url: string, options?: RequestInit): Promise<Response> {
  return pRetry(
    async () => {
      const now = Date.now()
      if (nextRequestAllowedAt > now) {
        const wait = nextRequestAllowedAt - now
        logger.warn(
          `[TWITCH RETRY] Waiting ${wait}ms for rate limit reset ahead of request to ${url}`,
        )
        await new Promise((r) => setTimeout(r, wait))
      }

      const response = await fetch(url, options)

      const remaining = response.headers.get("Ratelimit-Remaining")
      const reset = response.headers.get("Ratelimit-Reset")

      if (remaining === "0" && reset) {
        nextRequestAllowedAt = parseInt(reset, 10) * 1000
        logger.warn(
          `[TWITCH RETRY] Rate limit bucket exhausted. Next request allowed after ${new Date(nextRequestAllowedAt).toISOString()}`,
        )
      }

      if (response.status === 429) {
        const resetHeader = response.headers.get("Ratelimit-Reset")
        const delay = resetHeader
          ? Math.max(0, parseInt(resetHeader, 10) * 1000 - Date.now())
          : 5000

        logger.warn(`[TWITCH RETRY] Rate limited. Retrying in ${delay}ms`)

        if (resetHeader) {
          nextRequestAllowedAt = parseInt(resetHeader, 10) * 1000
        }

        await new Promise((r) => setTimeout(r, delay))
        throw new Error("Rate limited")
      }

      return response
    },
    {
      retries: 3,
      minTimeout: 0,
      factor: 1,
      onFailedAttempt: (context) => {
        logger.warn(
          `[TWITCH RETRY] Request to ${url} failed (attempt ${context.attemptNumber}): ${context.error.message}`,
        )
      },
    },
  )
}
