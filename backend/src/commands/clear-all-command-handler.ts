import { CommandContext, CommandHandler } from '@/commands/command'
import { RateLimitConfig } from '@/helpers/rate-limit'
import { CommandError, CommandErrorCode } from '@/types/errors'

export class ClearAllCommandHandler extends CommandHandler {
  private readonly regex = /^!clearall\s*$/i

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  public canHandle(messageText: string): boolean {
    return this.regex.test(messageText)
  }

  public async execute({ deps, isMod, messageId }: CommandContext): Promise<void> {
    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    deps.songQueue.clearAll()
    deps.logger.info(`[COMMAND] [CLEARALL] Cleared the song queue.`)

    await deps.sendChatMessage(`Kolejka piosenek została wyczyszczona.`, messageId)
  }
}
