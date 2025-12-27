import { env } from '@/config/env'
import { twitchAuth } from '@/core/twitch-auth-manager'
import { logger } from '@/helpers/logger'

export const timeoutUser = async ({
  userIdToTimeout,
  durationInSeconds,
  reason,
}: {
  userIdToTimeout: string
  durationInSeconds: number
  reason?: string
}) => {
  try {
    const response = await twitchAuth.fetch(
      `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${env.TWITCH_BROADCASTER_ID}&moderator_id=${twitchAuth.userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            user_id: userIdToTimeout,
            duration: durationInSeconds,
            reason: reason || 'Bot timeout',
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to timeout user')
    }

    logger.info(`[MOD] Timed out user ${userIdToTimeout} for ${durationInSeconds}s`)
  } catch (error) {
    logger.error(`[MOD] Error timing out user: ${error}`)
    throw error
  }
}
