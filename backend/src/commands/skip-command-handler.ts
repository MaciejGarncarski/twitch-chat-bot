import { CommandHandler, ExecuteParams } from '@/commands/command'
import { RateLimitConfig } from '@/helpers/rate-limit'
import { CommandError, CommandErrorCode } from '@/types/errors'

export class SkipCommandHandler extends CommandHandler {
  private readonly regex = /^!skip\s*$/i

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 2,
  }

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText)
  }

  async execute({
    deps: { logger, songQueue, sendChatMessage },
    payload,
    messageId,
    isMod,
  }: ExecuteParams) {
    if (songQueue.isEmpty()) {
      logger.info(`[COMMAND] [SKIP] Queue is empty, skipping not possible.`)
      await sendChatMessage(`Kolejka jest pusta.`, messageId)
      return
    }

    if (!payload.event) {
      throw new Error('No event found in payload.')
    }

    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    const user = payload.event?.chatter_user_name

    if (!user) {
      throw new Error('Missing user information.')
    }

    logger.info(`[COMMAND] [SKIP] Requested by ${user}`)

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
