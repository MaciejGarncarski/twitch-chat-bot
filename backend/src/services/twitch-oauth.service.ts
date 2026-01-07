import { env } from "@/config/env"
import { twitchAuth } from "@/core/twitch-auth-manager"
import { logger } from "@/helpers/logger"
import { JWTPayload, JWTPayloadSchema } from "@ttv-song-request/types"
import z from "zod"

const clientId = env.TWITCH_CLIENT_ID
const redirectUri = env.APP_REDIRECT_URI
const scopes = ["user:read:email", "user:read:moderated_channels"].join(" ")

const authParams = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: "code",
  scope: scopes,
})

export const authUrl = `https://id.twitch.tv/oauth2/authorize?${authParams.toString()}`

const twitchModChannelSchema = z.object({
  broadcaster_id: z.string(),
  broadcaster_login: z.string(),
  broadcaster_name: z.string(),
})

const twitchModResponseSchema = z.object({
  data: z.array(twitchModChannelSchema),
  pagination: z
    .object({
      cursor: z.string().optional(),
    })
    .optional(),
})

export async function handleAppAuthCallback(request: Request): Promise<JWTPayload> {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  logger.info(`[USER AUTH] EXCHANGING CODE FOR TOKEN, CODE: ${code}`)

  if (!code) throw new Error("No code provided")

  const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.TWITCH_CLIENT_ID,
      client_secret: env.TWITCH_CLIENT_SECRET,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenResponse.ok) {
    const error = await tokenResponse.json().catch(() => ({}))
    logger.error(error, "Twitch Token Exchange Failed")
    throw new Error(`Failed to exchange code for token: ${JSON.stringify(error)}`)
  }

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token

  const userResponse = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": env.TWITCH_CLIENT_ID,
    },
  })

  if (!userResponse.ok) {
    const error = await userResponse.json().catch(() => ({}))
    logger.error(error, "Twitch User Fetch Failed")
    throw new Error(`Failed to fetch user data: ${JSON.stringify(error)}`)
  }

  const userData = await userResponse.json()
  const parsedData = userResponseSchema.safeParse(userData)

  if (!parsedData.success) {
    logger.error(parsedData.error, "Twitch API User Response Validation Failed")
    throw new Error("Invalid user data structure from Twitch API")
  }

  if (parsedData.data.data.length === 0) {
    throw new Error("No user data found in Twitch API response")
  }

  const user = parsedData.data.data[0]

  const isBroadcaster = user.id === twitchAuth.broadcasterId
  const isExtraMod = env.USERS_TREATED_AS_MODERATORS.includes(user.id)
  const isMod = isBroadcaster || isExtraMod

  if (isMod) {
    return {
      sub: user.id,
      login: user.login,
      avatar: user.profile_image_url || null,
      role: "MOD",
    }
  }

  let isModAfterCheck = false
  let cursor: string | undefined

  do {
    const url = new URL(`https://api.twitch.tv/helix/moderation/channels`)
    url.searchParams.set("user_id", user.id)
    url.searchParams.set("first", "100")
    if (cursor) {
      url.searchParams.set("after", cursor)
    }

    const modCheckResponse = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": env.TWITCH_CLIENT_ID,
      },
    })

    if (!modCheckResponse.ok) {
      const error = await modCheckResponse.json().catch(() => ({}))
      logger.error(error, "Twitch Moderated Channels Fetch Failed")
      throw new Error("Failed to fetch moderated channels from Twitch")
    }

    const rawData = await modCheckResponse.json()
    const result = twitchModResponseSchema.safeParse(rawData)

    if (!result.success) {
      logger.error(result.error, "Twitch API Response Validation Failed")
      throw new Error("Invalid response structure from Twitch API")
    }

    isModAfterCheck = result.data.data.some(
      (channel) => channel.broadcaster_id === twitchAuth.broadcasterId,
    )

    if (isModAfterCheck) {
      break
    }

    cursor = result.data.pagination?.cursor
  } while (cursor)

  const data: JWTPayload = {
    sub: user.id,
    login: user.login,
    role: isModAfterCheck ? "MOD" : "USER",
    avatar: user.profile_image_url || null,
  }

  return data
}

const userResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      login: z.string(),
      display_name: z.string(),
      type: z.string(),
      broadcaster_type: z.string(),
      description: z.string(),
      profile_image_url: z.string(),
      offline_image_url: z.string(),
      view_count: z.number(),
      email: z.string(),
      created_at: z.string(),
    }),
  ),
})
