import { env } from "@/config/env"
import { twitchAuth } from "@/core/twitch-auth-manager"
import { logger } from "@/helpers/logger"
import z from "zod"

const clientId = env.TWITCH_CLIENT_ID
const redirectUri = env.APP_REDIRECT_URI
const scopes = ["user:read:email", "user:read:moderated_channels"].join("+")

export const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}`

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

export async function handleAppAuthCallback(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  logger.info(`EXCHANGING CODE FOR TOKEN, CODE: ${code}`)

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
    throw new Error(`Failed to fetch user data: ${JSON.stringify(error)}`)
  }

  const userData = await userResponse.json()
  const user = userData.data[0]

  const isBroadcaster = user.id === twitchAuth.broadcasterId
  const isExtraMod = env.USERS_TREATED_AS_MODERATORS.includes(user.id)

  const isMod = isBroadcaster || isExtraMod

  if (isMod) {
    return {
      sub: user.id,
      login: user.login,
      role: "MOD",
    }
  }

  const modCheckResponse = await fetch(
    `https://api.twitch.tv/helix/moderation/channels?user_id=${user.id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": env.TWITCH_CLIENT_ID,
      },
    },
  )

  if (!modCheckResponse.ok) {
    throw new Error("Failed to fetch moderated channels from Twitch")
  }

  const rawData = await modCheckResponse.json()
  const result = twitchModResponseSchema.safeParse(rawData)

  if (!result.success) {
    logger.error(result.error, "Twitch API Response Validation Failed")
    throw new Error("Invalid response structure from Twitch API")
  }

  const isModAfterCheck = result.data.data.some(
    (channel) => channel.broadcaster_id === twitchAuth.broadcasterId,
  )

  const data = {
    sub: user.id,
    login: user.login,
    role: isModAfterCheck ? "MOD" : "USER",
  }

  return data
}
