import { CommandHandler, ExecuteParams } from '@/commands/command'
import { RateLimitConfig } from '@/helpers/rate-limit'

export class QueueCommandHandler extends CommandHandler {
  private readonly regex = /^!queue\s*$/i

  rateLimit: RateLimitConfig = {
    windowMs: 60_000,
    max: 1,
  }

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText)
  }

  async execute({ deps: { logger, songQueue, sendChatMessage }, messageId }: ExecuteParams) {
    if (songQueue.isEmpty()) {
      logger.info(`[COMMAND] [QUEUE] Queue is empty.`)
      await sendChatMessage(`Kolejka jest pusta.`, messageId)
      return
    }

    const queueItems = songQueue.getQueue()

    const formattedQueue = queueItems
      .map((item, index) => `${index + 1}. ${item.title} (dodany przez @${item.username})`)
      .join('\n')

    logger.info(`[COMMAND] [QUEUE] Sending current queue.`)
    await sendChatMessage(`Aktualna kolejka:\n${formattedQueue}`, messageId)
  }
}
