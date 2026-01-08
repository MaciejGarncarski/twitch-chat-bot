import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"

export class QueueCommandHandler extends CommandHandler {
  private readonly command = "!queue"

  rateLimit: RateLimitConfig = {
    windowMs: 60_000,
    max: 1,
  }

  canHandle(messageText: string): boolean {
    return this.command === messageText.toLowerCase()
  }

  async execute({ deps: { logger, songQueue, sendChatMessage }, messageId }: CommandContext) {
    if (songQueue.isEmpty()) {
      logger.info(`[COMMAND] [QUEUE] Queue is empty.`)
      await sendChatMessage(`Kolejka jest pusta.`, messageId)
      return
    }

    const queueItems = songQueue.getQueue()
    const formattedQueue = queueItems.map((item, index) => `${index + 1}. ${item.title}`).join("\n")

    logger.info(`[COMMAND] [QUEUE] Sending current queue.`)
    await sendChatMessage(`Aktualna kolejka:\n${formattedQueue}`, messageId)
  }
}
