import { Elysia } from 'elysia'

import { sendChatMessage } from '@/api/send-chat-message'
import { env } from '@/config/env'
import { twitchAuth } from '@/core/twitch-auth-manager'
import { logger } from '@/helpers/logger'

export const app = new Elysia()
  .onStart(async () => {
    logger.info('[SERVER] Starting bot auth server...')
    logger.info(`GO TO: ${twitchAuth.authUrl}`)
  })
  .onStop(async () => {
    await sendChatMessage('Bot wyłączony StinkyGlitch')
  })
  .group('/api', (app) => {
    return app
      .get('/auth/tokens', async ({ redirect }) => {
        return redirect(twitchAuth.authUrl)
      })
      .get('/auth/callback', async ({ request }) => {
        const refreshToken = await twitchAuth.handleCallback(request)
        return {
          ['REFRESH_TOKEN']: refreshToken,
        }
      })
  })
  .listen({ port: env.PORT || 3001 })

process.on('SIGINT', () => {
  logger.info('[SERVER] Received SIGINT. Stopping server...')
  app.stop().then(() => {
    logger.info(`[SERVER] [DOWN] Stopped`)
    process.exit(0)
  })
})
export type App = typeof app
