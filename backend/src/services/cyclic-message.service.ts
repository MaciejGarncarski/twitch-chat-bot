import { sendChatMessage } from "@/api/send-chat-message"
import { CyclicMessageConfig, cyclicMessages } from "@/config/cyclic-messages"
import { ITwitchAuthManager } from "@/core/twitch-auth-manager"
import { logger } from "@/helpers/logger"
import { t } from "@/i18n/i18n"

interface MessageState {
  lastSentAt: number
  messagesSinceLastSent: number
}

export class CyclicMessageService {
  private readonly states: Map<string, MessageState> = new Map()
  private readonly timers: Map<string, NodeJS.Timeout> = new Map()
  private readonly configs: CyclicMessageConfig[]

  constructor(
    private twitchAuth: ITwitchAuthManager,
    configs: CyclicMessageConfig[] = cyclicMessages,
  ) {
    this.configs = configs

    for (const config of this.configs) {
      this.states.set(config.id, {
        lastSentAt: Date.now(),
        messagesSinceLastSent: 0,
      })
    }
  }

  start(): void {
    logger.info(
      `[CYCLIC MESSAGES] Starting service with ${this.configs.length} configured message(s)`,
    )

    for (const config of this.configs) {
      this.startTimer(config)
    }
  }

  stop(): void {
    logger.info("[CYCLIC MESSAGES] Stopping service")

    for (const timer of this.timers.values()) {
      clearInterval(timer)
    }

    this.timers.clear()
  }

  onChatMessage(): void {
    for (const state of this.states.values()) {
      state.messagesSinceLastSent++
    }
  }

  private startTimer(config: CyclicMessageConfig): void {
    if (this.timers.has(config.id)) {
      clearInterval(this.timers.get(config.id))
    }

    const timer = setInterval(() => {
      this.checkAndSend(config)
    }, config.intervalMs)

    this.timers.set(config.id, timer)
  }

  private async checkAndSend(config: CyclicMessageConfig): Promise<void> {
    const state = this.states.get(config.id)

    if (!state) {
      return
    }

    if (state.messagesSinceLastSent < config.minMessagesBetween) {
      logger.debug(
        `[CYCLIC MESSAGES] Skipping '${config.id}': only ${state.messagesSinceLastSent}/${config.minMessagesBetween} messages`,
      )
      return
    }

    if (config.requireLive) {
      const isLive = await this.twitchAuth.isStreamerBroadcasting()

      if (!isLive) {
        logger.debug(`[CYCLIC MESSAGES] Skipping '${config.id}': stream is offline`)
        return
      }
    }

    const message =
      config.message ?? t(config.messageKey, config.messageParams as Parameters<typeof t>[1])
    await sendChatMessage(message)

    state.lastSentAt = Date.now()
    state.messagesSinceLastSent = 0

    logger.info(`[CYCLIC MESSAGES] Sent message '${config.id}'`)
  }
}
