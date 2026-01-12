import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { CommandError, CommandErrorCode } from "@/types/command-errors"

export class PauseCommandHandler extends CommandHandler {
  private readonly command = "pause"

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 2,
  }

  canHandle(command: string): boolean {
    return command.toLowerCase() === this.command
  }

  async execute({ deps: { logger, playbackManager }, payload, isMod }: CommandContext) {
    if (!payload.event) {
      throw new CommandError(CommandErrorCode.EVENT_NOT_FOUND)
    }

    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    logger.info(`[COMMAND] [Playback] Sending pause message.`)

    playbackManager.pause()
  }
}
