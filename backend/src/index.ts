import { cors } from "@elysiajs/cors"
import { Elysia, t } from "elysia"
import { jwt } from "@elysiajs/jwt"

import { sendChatMessage } from "@/api/send-chat-message"
import { env } from "@/config/env"
import { ChatWebSocket } from "@/connectors/chat-ws"
import { songRequestEngine } from "@/core/song-request-engine"
import { twitchAuth } from "@/core/twitch-auth-manager"
import { setBunServer } from "@/helpers/init-ws"
import { logger } from "@/helpers/logger"
import { JWTPayload, JWTPayloadSchema } from "@ttv-song-request/types"
import { jwtConfig } from "@/config/jwt"
import { authUrl, handleAppAuthCallback } from "@/services/twitch-oauth.service"
import { CommandProcessor } from "@/processors/command-processor"
import { commandHandlers } from "@/commands/handlers"
import { unsubscribeAll } from "@/connectors/chat-subscription"

async function init() {
  await unsubscribeAll()
  await Promise.all([
    twitchAuth.fetchBotUsername(),
    twitchAuth.fetchUserId(),
    twitchAuth.fetchBroadcasterId(),
  ])
  songRequestEngine.setupEventListeners()
  const commandProcessor = new CommandProcessor(commandHandlers, twitchAuth)
  new ChatWebSocket(twitchAuth, commandProcessor)
}

await init()
export const app = new Elysia()
  .use(
    cors({
      origin: env.APP_ORIGINS,
      credentials: true,
    }),
  )
  .use(jwt(jwtConfig))
  .derive(async ({ jwt, cookie: { auth } }): Promise<{ user: null | JWTPayload }> => {
    const token = auth.value as string | undefined

    if (!token) {
      return {
        user: null,
      }
    }

    const data = await jwt.verify(token)
    const parsedData = JWTPayloadSchema.parse(data)

    return { user: parsedData }
  })
  .onStart(async ({ server }) => {
    logger.info(`[SERVER] [UP] listening on ${env.API_URL}`)
    await sendChatMessage(`Bot uruchomiony TwitchLit`)
    setBunServer(server)

    if (env.NODE_ENV === "development") {
      await songRequestEngine.getSongQueue().add({
        username: "maciej_ga",
        videoId: "E8gmARGvPlI",
      })
      await songRequestEngine.getSongQueue().add({
        username: "maciej_ga",
        videoId: "_jZuz3NEr18",
      })
    }
  })
  .onStop(async () => {
    await sendChatMessage("Bot wyłączony StinkyGlitch")
  })
  .onError(async ({ code, status }) => {
    if (code === "NOT_FOUND") {
      return status(404, {
        status: "Endpoint not found",
      })
    }
  })
  .group("/api", (appApiRoutes) => {
    return appApiRoutes
      .get("/", async () => {
        return "hi"
      })
      .get("/queue", async () => {
        const data = songRequestEngine.getSongQueue().getQueue()
        return data
      })
      .group("/auth", (authRoutes) => {
        return authRoutes
          .get("/status", async ({ jwt, cookie: { auth } }) => {
            const token = auth.value as string | undefined

            if (!token) {
              return {
                authenticated: false,
              }
            }

            try {
              const data = await jwt.verify(token)
              const parsedData = JWTPayloadSchema.parse(data)

              return {
                authenticated: true,
                user: parsedData,
              }
            } catch (error) {
              return {
                authenticated: false,
              }
            }
          })
          .get("/sign-in", async ({ redirect }) => {
            return redirect(authUrl)
          })
          .delete("/sign-out", async ({ cookie: { auth } }) => {
            auth.set({
              value: "",
              httpOnly: true,
              maxAge: 0,
              path: "/",
              sameSite: "lax",
              secure: env.NODE_ENV === "production",
            })
            return new Response(null, { status: 204 })
          })
          .get("/tokens", async ({ redirect }) => {
            return redirect(twitchAuth.authUrl)
          })
          .get("/callback/setup", async ({ request }) => {
            const tokens = await twitchAuth.handleCallback(request)
            return tokens
          })
          .get("/callback/app", async ({ request, jwt, cookie: { auth }, redirect }) => {
            const data = await handleAppAuthCallback(request)
            const value = await jwt.sign(data)

            auth.set({
              value,
              httpOnly: true,
              maxAge: 7 * 86400,
              path: "/",
              sameSite: "lax",
              secure: env.NODE_ENV === "production",
            })

            return redirect(env.FRONTEND_URL)
          })
      })
      .group("/player", (playerRoutes) => {
        return playerRoutes

          .post("/pause", async ({ user, status }) => {
            if (user?.role !== "MOD") {
              return status(401, { status: "Unauthorized" })
            }

            songRequestEngine.getPlaybackManager().pause()
            return status(204, null)
          })
          .post("/play", async ({ user, status }) => {
            if (user?.role !== "MOD") {
              return status(401, { status: "Unauthorized" })
            }

            songRequestEngine.getPlaybackManager().play()
            return status(204, null)
          })
          .post("/loop-toggle", async ({ user, status }) => {
            if (user?.role !== "MOD") {
              return status(401, { status: "Unauthorized" })
            }

            songRequestEngine.getPlaybackManager().toggleLoopEnabled()
            return status(204, null)
          })
          .post(
            "/seek",
            async ({ user, status, body: { position } }) => {
              if (user?.role !== "MOD") {
                return status(401, { status: "Unauthorized" })
              }

              songRequestEngine.getPlaybackManager().seek(position)
              return status(204, null)
            },
            {
              body: t.Object({
                position: t.Number(),
              }),
            },
          )
          .post(
            "/volume",
            async ({ user, status, body: { volume } }) => {
              if (user?.role !== "MOD") {
                return status(401, { status: "Unauthorized" })
              }

              songRequestEngine.getPlaybackManager().setVolume(volume)
              return status(204, null)
            },
            {
              body: t.Object({
                volume: t.Number(),
              }),
            },
          )
          .post("/clear-queue", async ({ user, status }) => {
            if (user?.role !== "MOD") {
              return status(401, { status: "Unauthorized" })
            }

            songRequestEngine.getSongQueue().clearAll()
            return status(204, null)
          })
          .post("/skip", async ({ user, status }) => {
            if (user?.role !== "MOD") {
              return status(401, { status: "Unauthorized" })
            }

            songRequestEngine.getSongQueue().removeCurrent()
            return status(204, null)
          })
          .post("/shuffle", async ({ user, status }) => {
            if (user?.role !== "MOD") {
              return status(401, { status: "Unauthorized" })
            }

            songRequestEngine.getSongQueue().shuffle()
            return status(204, null)
          })
          .post(
            "/remove",
            async ({ user, body: { videoId }, status }) => {
              if (user?.role !== "MOD") {
                return status(401, { status: "Unauthorized" })
              }

              songRequestEngine.getSongQueue().removeById(videoId)
              return status(204, null)
            },
            {
              body: t.Object({
                videoId: t.String(),
              }),
            },
          )
      })
      .ws("/ws", {
        open(ws) {
          ws.subscribe("playback-status")
        },
      })
  })
  .listen({ port: env.PORT || 3001 })

process.on("SIGINT", () => {
  logger.info("[SERVER] Received SIGINT. Stopping server...")
  app.stop().then(() => {
    logger.info(`[SERVER] [DOWN] Stopped`)
    process.exit(0)
  })
})

export type App = typeof app
