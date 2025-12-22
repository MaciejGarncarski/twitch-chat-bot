import z from 'zod'

const mentionFragment = z.object({
  type: z.literal('mention'),
  text: z.string(),
  cheermote: z.object().nullable(),
  emote: z.null(),
  mention: z.object({
    user_id: z.string(),
    user_login: z.string(),
    user_name: z.string(),
  }),
})

const textFragment = z.object({
  type: z.literal('text'),
  text: z.string(),
  cheermote: z.object().nullable(),
  mention: z.object().nullable(),
  emote: z.null(),
})

const emoteFragment = z.object({
  type: z.literal('emote'),
  text: z.string(),
  cheermote: z.object().nullable(),
  emote: z
    .object({
      id: z.string(),
      emote_set_id: z.string(),
      owner_id: z.string(),
      format: z.array(z.string()),
    })
    .nullable(),
  mention: z.object().nullable(),
})

const messageFragments = z.union([emoteFragment, textFragment, mentionFragment])

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

export const badgesSchema = z.array(chatBadgeSchema).nullable().optional()

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
      condition: z.object(),
      transport: z.object(),
      created_at: z.iso.datetime(),
      cost: z.number(),
    })
    .optional(),
  event: z
    .object({
      broadcaster_user_id: z.string(),
      broadcaster_user_login: z.string(),
      broadcaster_user_name: z.string(),
      source_broadcaster_user_id: z.null(),
      source_broadcaster_user_login: z.null(),
      source_broadcaster_user_name: z.null(),
      chatter_user_id: z.string(),
      chatter_user_login: z.string(),
      chatter_user_name: z.string(),
      message_id: z.string(),
      source_message_id: z.null(),
      is_source_only: z.null(),
      message: z.object({
        text: z.string(),
        fragments: z.array(messageFragments),
      }),
      badges: badgesSchema,
      color: z.string(),
      source_badges: z.null(),
      message_type: z.string(),
      cheer: z.null(),
      reply: replySchema.nullable(),
      channel_points_custom_reward_id: z.null(),
      channel_points_animation_id: z.null(),
    })
    .optional(),
})

export const twitchMessageSchema = z.object({
  metadata: z.object({
    message_type: z.string(),
  }),
  payload: twitchMessagePayloadSchema,
})

export type TwitchMessagePayload = z.infer<typeof twitchMessagePayloadSchema>
export type TwitchWSMessage = z.infer<typeof twitchMessageSchema>
