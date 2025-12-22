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

export class TwitchAuthManager {
  public accessToken: string | null = null
  public refreshToken: string
  public userId: string = ''

  constructor() {
    this.refreshToken = env.TWITCH_REFRESH_TOKEN
    this.accessToken = env.TWITCH_ACCESS_TOKEN
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

    const data = await response.json()
    if (!response.ok) throw new Error(`Refresh failed: ${JSON.stringify(data)}`)

    this.accessToken = data.access_token
    this.refreshToken = data.refresh_token

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
      const error = await response.json()
      throw new Error(`Invalid token: ${error.message}`)
    }

    const data = await response.json()
    const parsed = userResponseSchema.safeParse(data)

    if (!parsed.success) {
      throw new Error(`Unexpected response structure: ${JSON.stringify(parsed.error)}`)
    }

    this.userId = parsed.data.user_id

    return {
      userId: data.user_id,
      username: data.login,
      scopes: data.scopes,
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

    return res
  }
}

export const twitchAuth = new TwitchAuthManager()
