import { sendChatMessage } from "@/api/send-chat-message"
import { env } from "@/config/env"
import { ensureChatSubscription } from "@/connectors/chat-subscription"
import { logger } from "@/helpers/logger"
import { CommandProcessor } from "@/processors/command-processor"
import { ITwitchAuthManager } from "@/types/twitch-auth"
import { twitchMessageSchema } from "@/types/twitch-ws-message"
import { t } from "@/i18n/i18n"

export class ChatWebSocket {
  private ws?: WebSocket
  private missedMessageTimer?: NodeJS.Timeout
  private readonly reminderIntervalMs = 5 * 60 * 1000 // 5 minutes
  private reminderIntervalId?: NodeJS.Timeout
  private isTransferring = false

  private readonly DEFAULT_WS_URL = "wss://eventsub.wss.twitch.tv/ws"
  private keepaliveTimeoutSeconds = 30_000

  constructor(
    private twitchAuth: ITwitchAuthManager,
    private commandProcessor: CommandProcessor,
  ) {
    this.connect()
  }

  private startRemainderInterval() {
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId)
    }

    this.reminderIntervalId = setInterval(async () => {
      const isLive = await this.twitchAuth.isStreamerBroadcasting()

      if (!isLive) {
        return
      }

      sendChatMessage(t("reminders.helpPrompt", { prefix: env.COMMAND_PREFIX }))
    }, this.reminderIntervalMs)
  }

  private connect(url: string = this.DEFAULT_WS_URL) {
    logger.info(`[CHAT WS] Connecting to ${url}...`)

    const ws = new WebSocket(url)
    this.ws = ws

    this.startRemainderInterval()

    ws.addEventListener("message", async ({ data }) => {
      this.resetKeepaliveTimer()
      await this.handleMessage(data.toString(), ws)
    })

    ws.addEventListener("close", () => {
      this.stopKeepaliveTimer()

      if (this.isTransferring) {
        logger.info("[CHAT WS] Old connection closed successfully (Transfer complete).")
        return
      }

      logger.info("[CHAT WS] Connection lost. Retrying in 3s...")

      this.isTransferring = false

      setTimeout(() => this.connect(), 3000)
    })

    ws.addEventListener("error", (err) => {
      logger.error(err, "[CHAT WS] WebSocket error")
      ws.close()
    })
  }

  private async handleMessage(rawData: string, socketContext: WebSocket) {
    const parsed = twitchMessageSchema.parse(JSON.parse(rawData))
    const { message_type } = parsed.metadata

    switch (message_type) {
      case "session_welcome": {
        const timeoutSeconds = parsed.payload.session?.keepalive_timeout_seconds

        if (timeoutSeconds) {
          this.keepaliveTimeoutSeconds = timeoutSeconds * 1000
        }

        const newSessionId = parsed.payload.session?.id

        if (!newSessionId) return
        this.ws = socketContext
        logger.info(`[CHAT WS] Connected. Session ID: ${newSessionId}`)

        this.resetKeepaliveTimer()

        if (this.isTransferring) {
          logger.info("[CHAT WS] Session transferred. Subscriptions preserved.")
          this.isTransferring = false
        } else {
          logger.info("[CHAT WS] Fresh session. Ensuring chat subscription...")
          await ensureChatSubscription(newSessionId)
        }

        break
      }

      case "session_reconnect": {
        const reconnectUrl = parsed.payload.session?.reconnect_url
        if (!reconnectUrl) return

        logger.warn("[CHAT WS] Twitch requested reconnect (Migration).")

        this.isTransferring = true
        this.connect(reconnectUrl)
        break
      }

      case "notification": {
        await this.commandProcessor.process(parsed)
        break
      }

      case "session_keepalive":
        break
    }
  }

  private resetKeepaliveTimer() {
    this.stopKeepaliveTimer()

    this.missedMessageTimer = setTimeout(() => {
      logger.warn("[CHAT WS] No keepalive received. Connection ghosted.")

      this.ws?.close()
    }, this.keepaliveTimeoutSeconds + 2000)
  }

  private stopKeepaliveTimer() {
    if (this.missedMessageTimer) {
      clearTimeout(this.missedMessageTimer)
      this.missedMessageTimer = undefined
    }
  }
}
