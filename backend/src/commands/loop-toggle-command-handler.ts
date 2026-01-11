import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { CommandError, CommandErrorCode } from "@/types/errors"
import { t } from "@/i18n/i18n"

export class LoopToggleCommandHandler extends CommandHandler {
  private readonly command = "loop"

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  public canHandle(command: string): boolean {
    return command.toLowerCase() === this.command
  }

  public async execute({
    deps: { logger, playbackManager, sendChatMessage },
    isMod,
    messageId,
    sanitizedCommand,
    username,
  }: CommandContext): Promise<void> {
    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    const state = playbackManager.toggleLoopEnabled()
    const messageKey = state ? "commands.loop.enabled" : "commands.loop.disabled"
    await sendChatMessage(t(messageKey), messageId)

    logger.info(
      `[COMMAND] [EXEC] [LOOP] User ${username} toggled loop to ${state ? "enabled" : "disabled"} (${sanitizedCommand})`,
    )
  }
}
