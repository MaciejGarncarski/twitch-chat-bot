import { CommandHandler, ExecuteParams } from '@/commands/command'
import { RateLimitConfig } from '@/helpers/rate-limit'
import { CommandError, CommandErrorCode } from '@/types/errors'

export class PlayCommandHandler extends CommandHandler {
  private readonly regex = /^!play\s*$/i

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 2,
  }

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText)
  }

  async execute({ deps: { logger, playbackManager }, payload, isMod }: ExecuteParams) {
    if (!payload.event) {
      throw new Error('No event found in payload.')
    }

    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    logger.info(`[COMMAND] [Playback] Sending play message.`)
    playbackManager.play()
  }
}
