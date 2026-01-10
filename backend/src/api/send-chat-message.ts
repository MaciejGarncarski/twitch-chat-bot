import { twitchAuth } from "@/core/twitch-auth-manager"
import { logger } from "@/helpers/logger"
import z from "zod"

export const sendChatMessage = async (message: string, replyChatId?: string) => {
  const data = await twitchAuth.fetch("https://api.twitch.tv/helix/chat/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      broadcaster_id: twitchAuth.broadcasterId,
      sender_id: twitchAuth.userId,
      message: message,
      reply_parent_message_id: replyChatId ? replyChatId : undefined,
    }),
  })

  const json = await data.json().catch(() => ({}))
  const parsed = responseSchema.safeParse(json)

  if (!parsed.success) {
    logger.error(parsed.error, `[CHAT] Failed to send message: ${message}`)
    return
  }

  if (parsed.data.data.some((item) => !item.is_sent)) {
    logger.error(parsed.data.data, `[CHAT] Failed to send message: ${message}`)
    return
  }

  logger.info(`[CHAT] Sent message: ${message}`)
}

const responseSchema = z.object({
  data: z.array(
    z.union([
      z.object({
        message_id: z.string(),
        is_sent: z.boolean(),
        drop_reason: z.null(),
      }),

      z.object({
        message_id: z.string(),
        is_sent: z.boolean(),
        drop_reason: z.object({
          code: z.string(),
          message: z.string(),
        }),
      }),
    ]),
  ),
})
