import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { CommandError, CommandErrorCode } from "@/types/command-errors"
import { t } from "@/i18n/i18n"

export class SkipCommandHandler extends CommandHandler {
  private readonly command = "skip"

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 2,
  }

  canHandle(command: string): boolean {
    return command.toLowerCase() === this.command
  }

  async execute({
    deps: { logger, songQueue, sendChatMessage },
    username,
    messageId,
    isMod,
  }: CommandContext) {
    if (songQueue.isEmpty()) {
      logger.info(`[COMMAND] [SKIP] Queue is empty, skipping not possible.`)
      await sendChatMessage(t("commands.errors.queueEmpty"), messageId)
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
        t("commands.skip.skipped", { title: skippedSong.title, username: skippedSong.username }),
        messageId,
      )
      return
    }

    await sendChatMessage(t("commands.errors.queueEmpty"), messageId)
  }
}
