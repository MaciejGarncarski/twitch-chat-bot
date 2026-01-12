import { env } from "@/config/env"
import { logger } from "@/helpers/logger"
import {
  refreshResponseSchema,
  tokenResponseSchema,
  userResponseSchema,
} from "@/schemas/twitch-auth"

export interface ITwitchAuthManager {
  accessToken: string | null
  refreshToken: string
  scopes: string
  authUrl: string
  broadcasterId: string
  userId: string
  userBotUsername: string

  refresh(): Promise<string>
  fetchBroadcasterId(): Promise<string>
  fetchBotUsername(): Promise<void>
  fetchUserId(): Promise<{ userId: string; username: string; scopes: string[] }>
  fetch(url: string, options?: RequestInit): Promise<Response>
  handleCallback(req: Request): Promise<string>
  isStreamerBroadcasting(): Promise<boolean>
}

export class TwitchAuthManager implements ITwitchAuthManager {
  public accessToken: string | null = null
  public refreshToken: string
  public readonly scopes =
    "chat:read chat:edit channel:bot user:read:chat user:write:chat moderator:manage:banned_users"

  public authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${env.TWITCH_CLIENT_ID}&redirect_uri=${env.SETUP_REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(this.scopes)}`
  public broadcasterId: string = ""
  public userId: string = ""
  public userBotUsername: string = ""

  constructor() {
    this.refreshToken = env.TWITCH_REFRESH_TOKEN
  }

  async refresh() {
    logger.info("[TWITCH AUTH] Refreshing Twitch token")

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: env.TWITCH_CLIENT_ID,
        client_secret: env.TWITCH_CLIENT_SECRET,
        refresh_token: this.refreshToken,
        grant_type: "refresh_token",
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(`Refresh failed: ${JSON.stringify(data)}`)
    }

    const parsed = refreshResponseSchema.safeParse(data)

    if (!parsed.success) {
      throw new Error(`Unexpected response structure: ${JSON.stringify(parsed.error)}`)
    }

    this.accessToken = parsed.data.access_token
    this.refreshToken = parsed.data.refresh_token

    return this.accessToken
  }

  async fetchBroadcasterId() {
    const response = await fetch(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(env.TWITCH_BROADCASTER_NAME)}`,
      {
        method: "GET",
        headers: {
          "Client-ID": env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`Failed to fetch broadcaster ID: ${error.message}`)
    }

    const data = await response.json()
    if (!data.data || data.data.length === 0) {
      throw new Error(`No user found with login: ${env.TWITCH_BROADCASTER_NAME}`)
    }

    this.broadcasterId = data.data[0].id
    return this.broadcasterId
  }

  async fetchBotUsername() {
    const response = await fetch(`https://api.twitch.tv/helix/users`, {
      method: "GET",
      headers: {
        "Client-ID": env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`Failed to fetch bot username: ${error.message}`)
    }

    const data = await response.json()
    if (!data.data || data.data.length === 0) {
      throw new Error(`No user data found for the bot`)
    }

    this.userBotUsername = data.data[0].login.toLowerCase()
  }

  async fetchUserId() {
    const response = await fetch("https://id.twitch.tv/oauth2/validate", {
      method: "GET",
      headers: {
        Authorization: `OAuth ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`Invalid token: ${error.message}`)
    }

    const data = await response.json()
    const parsed = userResponseSchema.safeParse(data)

    if (!parsed.success) {
      throw new Error(`Unexpected response structure: ${JSON.stringify(parsed.error)}`)
    }

    this.userId = parsed.data.user_id

    return {
      userId: parsed.data.user_id,
      username: parsed.data.login,
      scopes: parsed.data.scopes,
    }
  }

  async fetch(url: string, options: RequestInit = {}) {
    if (!this.accessToken) await this.refresh()

    const execute = () =>
      fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          "Client-ID": env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

    let res = await execute()

    if (res.status === 401) {
      await this.refresh()
      res = await execute()
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      logger.error({ url, status: res.status, error }, "[TWITCH AUTH] Twitch API request failed")
      throw new Error(`Twitch API request failed: ${JSON.stringify(error)}`)
    }

    return res
  }

  async handleCallback(req: Request): Promise<string> {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")

    if (!code) {
      throw new Error("No code provided in callback URL")
    }

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.TWITCH_CLIENT_ID,
        client_secret: env.TWITCH_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: env.SETUP_REDIRECT_URI,
      }),
    })

    const jsonData = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${JSON.stringify(jsonData)}`)
    }

    const tokensData = tokenResponseSchema.parse(jsonData)
    return tokensData.refresh_token
  }

  public async isStreamerBroadcasting(): Promise<boolean> {
    const requestUrl = `https://api.twitch.tv/helix/streams?user_id=${this.broadcasterId}`

    const response = await this.fetch(requestUrl)
    const data = await response.json()

    const isLive = data.data && data.data.length > 0

    logger.info(`[TWITCH AUTH] Streamer is ${isLive ? "LIVE" : "OFFLINE"}`)

    return isLive
  }
}

export const twitchAuth = new TwitchAuthManager()
