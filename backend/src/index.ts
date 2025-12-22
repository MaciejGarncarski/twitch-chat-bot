import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'

import { sendChatMessage } from '@/api/send-chat-message'
import { env } from '@/config/env'
import { ChatWebSocket, songQueue } from '@/connectors/chat-ws'
import { playbackManager } from '@/core/playback-manager'
import { twitchAuth } from '@/core/twitch-auth-manager'
import { setBunServer } from '@/helpers/init-ws'
import { logOnStart } from '@/helpers/log-on-start'
import { logger } from '@/helpers/logger'

async function init() {
  await twitchAuth.fetchUserId()
  await twitchAuth.refresh()
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
    logOnStart()
    await sendChatMessage(`Bot uruchomiony${env.NODE_ENV === 'development' ? ' (dev)' : ''}`)
    setBunServer(server)

    if (env.NODE_ENV === 'development') {
      // await songQueue.add({
      //   username: "maciej_ga",
      //   videoUrl: "https://www.youtube.com/watch?v=xuP4g7IDgDM",
      //   videoId: "xuP4g7IDgDM",
      // });
      await songQueue.add({
        username: 'maciej_ga',
        videoUrl: 'https://www.youtube.com/watch?v=E8gmARGvPlI',
        videoId: 'E8gmARGvPlI',
      })
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
      .get('/queue', async () => {
        const data = songQueue.getQueue()
        return data
      })
      .post('/pause', async () => {
        playbackManager.pause()
        return {
          status: 'ok',
        }
      })
      .post('/play', async () => {
        playbackManager.play()
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
  logger.info('Received SIGINT. Stopping server...')
  app.stop().then(() => {
    logger.info('Server stopped')
    process.exit(0)
  })
})
export type App = typeof app
