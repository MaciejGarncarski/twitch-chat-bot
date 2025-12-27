import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'

import { sendChatMessage } from '@/api/send-chat-message'
import { env } from '@/config/env'
import { ChatWebSocket } from '@/connectors/chat-ws'
import { songRequestEngine } from '@/core/song-request-engine'
import { twitchAuth } from '@/core/twitch-auth-manager'
import { setBunServer } from '@/helpers/init-ws'
import { logger } from '@/helpers/logger'

async function init() {
  await twitchAuth.fetchUserId()
  await twitchAuth.refresh()
  songRequestEngine.setupEventListeners()
  new ChatWebSocket()
}

await init()

export const app = new Elysia()
  .use(
    cors({
      origin: env.APP_ORIGINS,
    }),
  )
  .onStart(async ({ server }) => {
    logger.info(`[SERVER] [UP] listening on ${env.API_URL}`)
    await sendChatMessage(`Bot uruchomiony${env.NODE_ENV === 'development' ? ' (dev)' : ''}`)
    setBunServer(server)

    if (env.NODE_ENV === 'development') {
      // await songRequestEngine.getSongQueue().add({
      //   username: 'maciej_ga',
      //   videoId: 'xuP4g7IDgDM',
      // })
      // await songRequestEngine.getSongQueue().add({
      //   username: 'maciej_ga',
      //   videoId: 'E8gmARGvPlI',
      // })
    }
  })
  .onStop(async () => {
    await sendChatMessage('Bot wyłączony StinkyGlitch')
  })
  .onError(async ({ code, status }) => {
    if (code === 'NOT_FOUND') {
      return status(404, {
        status: 'Endpoint not found',
      })
    }
  })
  .group('/api', (app) => {
    return app
      .get('/', async () => {
        return 'hi'
      })
      .get('/auth/tokens', async ({ redirect }) => {
        return redirect(twitchAuth.authUrl)
      })
      .get('/auth/callback', async ({ request }) => {
        const tokens = await twitchAuth.handleCallback(request)
        return tokens
      })
      .get('/queue', async () => {
        const data = songRequestEngine.getSongQueue().getQueue()
        return data
      })
      .post('/pause', async () => {
        songRequestEngine.getPlaybackManager().pause()
        return {
          status: 'ok',
        }
      })
      .post('/play', async () => {
        songRequestEngine.getPlaybackManager().play()
        return {
          status: 'ok',
        }
      })
      .ws('/ws', {
        open(ws) {
          ws.subscribe('playback-status')
        },
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
