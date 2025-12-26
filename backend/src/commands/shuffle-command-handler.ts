import { CommandHandler, ExecuteParams } from '@/commands/command'
import { CommandError, CommandErrorCode } from '@/types/errors'

export class ShuffleCommandHandler extends CommandHandler {
  private readonly regex = /^!shuffle$/

  public canHandle(command: string): boolean {
    return this.regex.test(command)
  }

  public async execute({
    deps: { logger, songQueue, sendChatMessage },
    isMod,
    messageId,
    sanitizedMessage,
    username,
  }: ExecuteParams): Promise<void> {
    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    if (!this.regex.test(sanitizedMessage)) {
      throw new CommandError(CommandErrorCode.INVALID_COMMAND_FORMAT)
    }
    songQueue.shuffle()
    logger.info(`[COMMAND] [EXEC] [SHUFFLE] User ${username} shuffled the queue`)
    await sendChatMessage(`Kolejka została przetasowana.`, messageId)
  }
}
