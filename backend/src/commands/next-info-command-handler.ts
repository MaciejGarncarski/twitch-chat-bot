import { CommandHandler, ExecuteParams } from '@/commands/command'
import { formatDuration } from '@/helpers/format-duration'
import { RateLimitConfig } from '@/helpers/rate-limit'

export class NextInfoCommandHandler extends CommandHandler {
  private readonly regex = /^!next\s*$/i

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText)
  }

  async execute({ deps: { songQueue, sendChatMessage, logger }, messageId }: ExecuteParams) {
    const nextSong = songQueue.peekNext()

    const timeUntilPlay = songQueue.getDurationBeforePlayingNext()

    if (!nextSong) {
      logger.info(`[COMMAND] [NEXT] No next song in the queue.`)

      await sendChatMessage(`Brak następnego utworu.`, messageId)
      return
    }

    logger.info(`[COMMAND] [NEXT] Next song is ${nextSong.title} added by @${nextSong.username}.`)

    const nextInfoMessage = `Następny utwór: ${nextSong.title} za ${formatDuration(timeUntilPlay)}.`

    await sendChatMessage(nextInfoMessage, messageId)
  }
}
