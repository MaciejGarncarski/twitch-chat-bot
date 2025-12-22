import { env } from '@/config/env'
import { twitchAuth } from '@/core/twitch-auth-manager'

export const sendChatMessage = async (message: string, replyChatId?: string) => {
  await twitchAuth.fetch('https://api.twitch.tv/helix/chat/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      broadcaster_id: env.TWITCH_BROADCASTER_ID,
      sender_id: twitchAuth.userId,
      message: message,
      reply_parent_message_id: replyChatId ? replyChatId : undefined,
    }),
  })
}
