import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { t } from "@/i18n/i18n"

const ITEMS_TO_SHOW_DEFAULT = 5

export class QueueCommandHandler extends CommandHandler {
  private readonly command = "queue"
  private readonly itemsToShow = ITEMS_TO_SHOW_DEFAULT

  rateLimit: RateLimitConfig = {
    windowMs: 60_000,
    max: 1,
  }

  canHandle(command: string): boolean {
    return this.command === command.toLowerCase()
  }

  async execute({ deps: { logger, songQueue, sendChatMessage }, messageId }: CommandContext) {
    if (songQueue.isEmpty()) {
      logger.info(`[COMMAND] [QUEUE] Queue is empty.`)
      await sendChatMessage(t("commands.errors.queueEmpty"), messageId)
      return
    }

    const queueItems = songQueue.getQueue()
    const itemsToDisplay = Math.min(this.itemsToShow, queueItems.length)
    const queueItemsToShow = queueItems.slice(0, itemsToDisplay)
    const formattedQueue = queueItemsToShow
      .map((item, index) => `${index + 1}. ${item.title}`)
      .join(", ")

    logger.info(`[COMMAND] [QUEUE] Sending current queue.`)
    await sendChatMessage(t("commands.queue.list", { queue: formattedQueue }), messageId)
  }
}
