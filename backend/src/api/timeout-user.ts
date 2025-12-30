import { twitchAuth } from "@/core/twitch-auth-manager"
import { logger } from "@/helpers/logger"

export const timeoutUser = async ({
  userIdToTimeout,
  durationInSeconds,
  reason,
}: {
  userIdToTimeout: string
  durationInSeconds: number
  reason?: string
}) => {
  await twitchAuth.fetch(
    `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${twitchAuth.broadcasterId}&moderator_id=${twitchAuth.userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          user_id: userIdToTimeout,
          duration: durationInSeconds,
          reason: reason || "Bot timeout",
        },
      }),
    },
  )

  logger.info(`[MOD] Timed out user ${userIdToTimeout} for ${durationInSeconds}s`)
}
