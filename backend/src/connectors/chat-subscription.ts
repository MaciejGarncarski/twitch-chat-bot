import { env } from '@/config/env'
import { twitchAuth } from '@/core/twitch-auth-manager'
import { logger } from '@/helpers/logger'

export async function unsubscribeAll() {
  const res = await twitchAuth.fetch('https://api.twitch.tv/helix/eventsub/subscriptions')

  const data = await res.json()

  for (const sub of data.data) {
    await unsubscribe(sub.id)
  }
}

async function unsubscribe(subscriptionId: string) {
  const res = await twitchAuth.fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionId}`,
    {
      method: 'DELETE',
    },
  )

  if (res.status === 204) {
    logger.info('[CHAT SUBSCRIPTION] Unsubscribed successfully')
  } else {
    const text = await res.text()
    logger.info(`[CHAT SUBSCRIPTION] Unsubscribed successfully: ${text}`)
  }
}

export async function subscribeToChat(sessId: string) {
  const res = await twitchAuth.fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'channel.chat.message',
      version: '1',
      condition: {
        broadcaster_user_id: env.TWITCH_BROADCASTER_ID,
        user_id: twitchAuth.userId,
      },
      transport: {
        method: 'websocket',
        session_id: sessId,
      },
    }),
  })

  if (!res.ok) {
    logger.error(await res.text())
    throw new Error('Cannot sub')
  }

  logger.info('[CHAT SUBSCRIPTION] Subscribed to chat')
}
