import { CommandContext, CommandHandler } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { t } from "@/i18n/i18n"
import { CommandError, CommandErrorCode } from "@/types/command-errors"

export class ClearAllCommandHandler extends CommandHandler {
  private readonly command = "clearall"

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  public canHandle(command: string): boolean {
    return command.toLowerCase() === this.command
  }

  public async execute({ deps, isMod, messageId }: CommandContext): Promise<void> {
    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    deps.songQueue.clearAll()
    deps.logger.info(`[COMMAND] [CLEARALL] Cleared the song queue.`)

    await deps.sendChatMessage(t("commands.clearall.success"), messageId)
  }
}
