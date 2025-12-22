import { CommandHandler, ExecuteParams } from '@/commands/command'
import { RateLimitConfig } from '@/helpers/rate-limit'

export class WrongSongCommandHandler extends CommandHandler {
  private readonly regexp = /^!wrongsong\b/i

  rateLimit: RateLimitConfig = {
    windowMs: 15000,
    max: 1,
  }

  public canHandle(message: string): boolean {
    return this.regexp.test(message)
  }

  async execute({
    deps: { logger, songQueue, sendChatMessage, playbackManager },
    payload,
    messageId,
  }: ExecuteParams) {
    const foundSoung = songQueue
      .getQueue()
      .findLast((item) => item.username === payload.event?.chatter_user_name)

    if (!foundSoung) {
      logger.info(
        `[COMMAND] [WRONGSONG] No song found for user ${payload.event?.chatter_user_login}.`,
      )
      return
    }

    if (playbackManager.getCurrentSongId() === foundSoung.id) {
      logger.info(
        `[COMMAND] [WRONGSONG] User ${payload.event?.chatter_user_login} tried to skip currently playing song, which is not allowed.`,
      )
      await sendChatMessage(
        `@${payload.event?.chatter_user_login} Nie możesz pominąć odtwarzanego utworu.`,
        messageId,
      )

      return
    }

    songQueue.removeSongById(foundSoung.id)
    logger.info(
      `[COMMAND] [WRONGSONG] Removed song with ID ${foundSoung.id} for user ${payload.event?.chatter_user_login}.`,
    )
    await sendChatMessage(`Usunięto z kolejki.`, messageId)
  }
}
