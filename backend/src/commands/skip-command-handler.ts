import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { CommandError, CommandErrorCode } from "@/types/errors"

export class SkipCommandHandler extends CommandHandler {
  private readonly command = "!skip"

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 2,
  }

  canHandle(messageText: string): boolean {
    return messageText.toLowerCase() === this.command
  }

  async execute({
    deps: { logger, songQueue, sendChatMessage },
    username,
    messageId,
    isMod,
  }: CommandContext) {
    if (songQueue.isEmpty()) {
      logger.info(`[COMMAND] [SKIP] Queue is empty, skipping not possible.`)
      await sendChatMessage(`Kolejka jest pusta.`, messageId)
      return
    }

    const isAddedByRequestingUser = songQueue.getCurrent()?.username.toLowerCase() === username

    if (!isAddedByRequestingUser && !isMod) {
      throw new CommandError(CommandErrorCode.CANNOT_SKIP_SONG)
    }

    logger.info(`[COMMAND] [SKIP] Requested by ${username}`)
    const skippedSong = songQueue.removeCurrent()

    if (skippedSong) {
      await sendChatMessage(
        `Pominięto utwór ${skippedSong.title} (dodany przez @${skippedSong.username}).`,
        messageId,
      )
      return
    }

    await sendChatMessage(`Kolejka jest pusta.`, messageId)
  }
}
