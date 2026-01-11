import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { CommandError, CommandErrorCode } from "@/types/errors"
import { t } from "@/i18n/i18n"

export class ShuffleCommandHandler extends CommandHandler {
  private readonly command = "shuffle"

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  public canHandle(command: string): boolean {
    return command.toLowerCase() === this.command
  }

  public async execute({
    deps: { logger, songQueue, sendChatMessage },
    isMod,
    messageId,
    username,
  }: CommandContext): Promise<void> {
    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    songQueue.shuffle()
    logger.info(`[COMMAND] [EXEC] [SHUFFLE] User ${username} shuffled the queue`)
    await sendChatMessage(t("commands.shuffle.success"), messageId)
  }
}
