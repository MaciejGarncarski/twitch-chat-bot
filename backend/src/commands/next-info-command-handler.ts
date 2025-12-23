import { CommandHandler, ExecuteParams } from '@/commands/command'
import { formatDuration } from '@/helpers/format-duration'
import { getTimeUntilNextSong } from '@/helpers/get-time-until-next-song'
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

  async execute({
    deps: { songQueue, sendChatMessage, logger, playbackManager },
    messageId,
  }: ExecuteParams) {
    const nextSong = songQueue.peekNext()
    const current = songQueue.getCurrent()

    if (!current) {
      logger.info(`[COMMAND] [NEXT] No current song playing.`)
      await sendChatMessage(`Żaden utwór nie jest obecnie odtwarzany.`, messageId)
      return
    }

    if (!nextSong) {
      logger.info(`[COMMAND] [NEXT] No next song in the queue.`)
      await sendChatMessage(`Brak następnego utworu.`, messageId)
      return
    }

    const timeUntilPlay = getTimeUntilNextSong(current, playbackManager.getPlayTime())
    logger.info(`[COMMAND] [NEXT] Next song is ${nextSong.title} added by @${nextSong.username}.`)
    const nextInfoMessage = `Następny utwór: ${nextSong.title} odtwarzany za około ${formatDuration(timeUntilPlay)}.`
    await sendChatMessage(nextInfoMessage, messageId)
  }
}
