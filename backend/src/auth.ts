import { Elysia } from "elysia"

import { sendChatMessage } from "@/api/send-chat-message"
import { env } from "@/config/env"
import { twitchAuth } from "@/core/twitch-auth-manager"
import { logger } from "@/helpers/logger"

export const app = new Elysia()
  .onStart(async () => {
    logger.info("[SERVER] Starting bot auth server...")
    logger.info(`GO TO: ${twitchAuth.authUrl}`)
  })
  .onStop(async () => {
    await sendChatMessage("Bot wyłączony StinkyGlitch")
  })
  .group("/api", (app) => {
    return app
      .get("/auth/tokens", async ({ redirect }) => {
        return redirect(twitchAuth.authUrl)
      })
      .get("/auth/callback/setup", async ({ request }) => {
        const refreshToken = await twitchAuth.handleCallback(request)

        const html = `
          <main style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">

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
