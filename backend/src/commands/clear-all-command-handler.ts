import { CommandHandler, ExecuteParams } from '@/commands/command'
import { CommandError, CommandErrorCode } from '@/types/errors'

export class ClearAllCommandHandler extends CommandHandler {
  private readonly regex = /^!clearall\s*$/i

  public canHandle(messageText: string): boolean {
    return this.regex.test(messageText)
  }

  public async execute({ deps, isMod, messageId }: ExecuteParams): Promise<void> {
    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    deps.songQueue.clearAll()
    deps.logger.info(`[COMMAND] [CLEARALL] Cleared the song queue.`)

    await deps.sendChatMessage(`Kolejka piosenek została wyczyszczona.`, messageId)
  }
}
