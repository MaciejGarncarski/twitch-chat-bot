import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { CommandError, CommandErrorCode } from "@/types/errors"

export class PlayCommandHandler extends CommandHandler {
  private readonly regex = /^play\s*$/i

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 2,
  }

  canHandle(command: string): boolean {
    return this.regex.test(command)
  }

  async execute({ deps: { logger, playbackManager }, payload, isMod }: CommandContext) {
    if (!payload.event) {
      throw new CommandError(CommandErrorCode.EVENT_NOT_FOUND)
    }

    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    logger.info(`[COMMAND] [Playback] Sending play message.`)
    playbackManager.play()
  }
}
