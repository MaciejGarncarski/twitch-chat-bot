import { CommandContext, CommandHandler } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"

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
    deps: { logger, songQueue, sendChatMessage },
    username,
    messageId,
  }: CommandContext) {
    const foundSong = songQueue.getQueue().findLast((item) => item.username === username)

    if (!foundSong) {
      logger.info(`[COMMAND] [WRONGSONG] No song found for user ${username}.`)
      return
    }

    if (songQueue.getCurrentSongId() === foundSong.id) {
      logger.info(
        `[COMMAND] [WRONGSONG] User ${username} tried to skip currently playing song, which is not allowed.`,
      )
      await sendChatMessage(`@${username} Nie możesz pominąć odtwarzanego utworu.`, messageId)

      return
    }

    songQueue.removeById(foundSong.id)
    logger.info(`[COMMAND] [WRONGSONG] Removed song with ID ${foundSong.id} for user ${username}.`)
    await sendChatMessage(`Usunięto z kolejki.`, messageId)
  }
}
