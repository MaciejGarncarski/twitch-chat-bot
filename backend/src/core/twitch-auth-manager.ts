import z from 'zod'

import { env } from '@/config/env'
import { logger } from '@/helpers/logger'

const userResponseSchema = z.object({
  client_id: z.string(),
  login: z.string(),
  scopes: z.array(z.string()),
  user_id: z.string(),
  expires_in: z.number(),
})

const refreshResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  scope: z.array(z.string()).optional(),
  token_type: z.string().optional(),
})

const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  scope: z.array(z.string()),
  token_type: z.string(),
})

export class TwitchAuthManager {
  public accessToken: string | null = null
  public refreshToken: string
  public readonly scopes =
    'chat:read chat:edit user:bot user:read:chat user:write:chat moderator:manage:banned_users'

  public authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${env.TWITCH_CLIENT_ID}&redirect_uri=${env.REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(this.scopes)}`

  public userId: string = ''

  constructor() {
    this.refreshToken = env.TWITCH_REFRESH_TOKEN
  }

  async refresh() {
    logger.info('[TWITCH AUTH] Refreshing Twitch token')

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.TWITCH_CLIENT_ID,
        client_secret: env.TWITCH_CLIENT_SECRET,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
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

  async fetchUserId() {
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      method: 'GET',
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
          'Client-ID': env.TWITCH_CLIENT_ID,
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
      logger.error({ url, status: res.status, error }, '[TWITCH AUTH] Twitch API request failed')
      throw new Error(`Twitch API request failed: ${JSON.stringify(error)}`)
    }

    return res
  }

  async handleCallback(req: Request): Promise<string> {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')

    if (!code) {
      throw new Error('No code provided in callback URL')
    }

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.TWITCH_CLIENT_ID,
        client_secret: env.TWITCH_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: env.REDIRECT_URI,
      }),
    })

    const jsonData = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${JSON.stringify(jsonData)}`)
    }

    const tokensData = tokenResponseSchema.parse(jsonData)
    return tokensData.refresh_token
  }
}

export const twitchAuth = new TwitchAuthManager()
