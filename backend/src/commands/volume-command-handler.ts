import { CommandHandler, ExecuteParams } from '@/commands/command'
import { RateLimitConfig } from '@/helpers/rate-limit'
import { CommandError, CommandErrorCode } from '@/types/errors'

export class VolumeCommandHandler extends CommandHandler {
  private readonly regex = /^!volume(?:\s+(100|[1-9]?\d))?\s*$/

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText)
  }

  async execute({
    deps: { playbackManager, sendChatMessage },
    payload,
    sanitizedMessage,
    messageId,
    isMod,
  }: ExecuteParams) {
    if (!payload.event) {
      throw new Error('No event found in payload.')
    }

    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    const match = sanitizedMessage.match(this.regex)
    const isSetVolumeCommand = match ? match[1] !== undefined : false

    if (!isSetVolumeCommand) {
      const volume = playbackManager.getVolume()
      await sendChatMessage(`Aktualna głośność to ${volume}%.`, messageId)
      return
    }

    if (!match || !messageId) {
      throw new Error('Not matching VOLUME command or missing messageId.')
    }

    const volume = parseInt(match[1])

    if (volume > 100 || volume < 0) {
      return
    }

    playbackManager.setVolume(volume)

    await sendChatMessage(`Ustawiono głośność na ${volume}%.`, messageId)
  }
}
