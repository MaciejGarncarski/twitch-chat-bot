import { z } from "zod"

const mentionFragment = z.object({
  type: z.literal("mention"),
  text: z.string(),
  mention: z.object({
    user_id: z.string(),
    user_login: z.string(),
    user_name: z.string(),
  }),
})

const textFragment = z.object({
  type: z.literal("text"),
  text: z.string(),
})

const emoteFragment = z.object({
  type: z.literal("emote"),
  text: z.string(),
  emote: z.object({
    id: z.string(),
    emote_set_id: z.string(),
    owner_id: z.string(),
    format: z.array(z.string()),
  }),
})

const cheermoteFragment = z.object({
  type: z.literal("cheermote"),
  text: z.string(),
  cheermote: z.object({
    prefix: z.string(),
    bits: z.number(),
    tier: z.number(),
  }),
})

const messageFragments = z.discriminatedUnion("type", [
  textFragment,
  emoteFragment,
  mentionFragment,
  cheermoteFragment,
])

export type MessageFragment = z.infer<typeof messageFragments>

const replySchema = z.object({
  parent_message_id: z.string(),
  parent_message_body: z.string(),
  parent_user_id: z.string(),
  parent_user_login: z.string(),
  parent_user_name: z.string(),
  thread_message_id: z.string(),
  thread_user_id: z.string(),
  thread_user_login: z.string(),
  thread_user_name: z.string(),
})

export const chatBadgeSchema = z.object({
  set_id: z.string(),
  id: z.string(),
  info: z.string().optional(),
})

export const twitchMessagePayloadSchema = z.object({
  session: z
    .object({
      id: z.string().nullable(),
      reconnect_url: z.string().nullable(),
      keepalive_timeout_seconds: z.number().nullable(),
    })
    .optional(),

  subscription: z
    .object({
      id: z.string(),
      status: z.string(),
      type: z.string(),
      version: z.string(),
      condition: z
        .object({
          broadcaster_user_id: z.string(),
          user_id: z.string(),
        })
        .partial(),
      transport: z.object({
        method: z.string(),
        callback: z.string().optional(),
        session_id: z.string().optional(),
      }),
      created_at: z.iso.datetime(),
      cost: z.number(),
    })
    .optional(),

  event: z
    .object({
      broadcaster_user_id: z.string(),
      broadcaster_user_login: z.string(),
      broadcaster_user_name: z.string(),
      chatter_user_id: z.string(),
      chatter_user_login: z.string(),
      chatter_user_name: z.string(),
      message_id: z.string(),
      message: z.object({
        text: z.string(),
        fragments: z.array(messageFragments),
      }),
      badges: z.array(chatBadgeSchema).default([]),
      color: z.string(),
      message_type: z.enum(["text", "whisper"]),
      cheer: z.object({ bits: z.number() }).nullable().optional(),
      reply: replySchema.nullable().optional(),
      channel_points_custom_reward_id: z.string().nullable().optional(),
    })
    .optional(),
})

export const twitchMessageSchema = z.object({
  metadata: z.object({
    message_id: z.string(),
    message_type: z.enum([
      "session_welcome",
      "session_keepalive",
      "notification",
      "session_reconnect",
      "revocation",
    ]),
    message_timestamp: z.iso.datetime(),
  }),
  payload: twitchMessagePayloadSchema,
})

export type TwitchWSPayload = z.infer<typeof twitchMessagePayloadSchema>
export type TwitchWSMessage = z.infer<typeof twitchMessageSchema>
