import { Elysia } from "elysia"

import { env } from "@/config/env"
import { twitchAuth } from "@/core/twitch-auth-manager"
import { logger } from "@/helpers/logger"

export const app = new Elysia()
  .onStart(async () => {
    logger.info("[SERVER] Starting bot auth server...")
    logger.info(`GO TO: ${twitchAuth.reconnectUrl}`)
  })
  .group("/api", (app) => {
    return app
      .get("/auth/tokens", async ({ redirect }) => {
        return redirect(twitchAuth.reconnectUrl)
      })
      .get("/auth/callback/setup", async ({ request }) => {
        const refreshToken = await twitchAuth.handleCallback(request)

        const html = `
          <main style="font-family: Arial, sans-serif; max-width: 450pt; margin: 37.5pt auto; padding: 15pt; border: 0.75pt solid #ccc; border-radius: 6pt; box-shadow: 0 1.5pt 6pt rgba(0, 0, 0, 0.1);">

            <h1>Setup Complete</h1>
            <p>Copy the refresh token below and add it to your .env file as TWITCH_REFRESH_TOKEN:</p>
            <pre>${refreshToken}</pre>
          </main>
          `

        return new Response(html, { headers: { "Content-Type": "text/html" } })
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
