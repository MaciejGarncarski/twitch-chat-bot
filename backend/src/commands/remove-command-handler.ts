import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { CommandError, CommandErrorCode } from "@/types/command-errors"
import { t } from "@/i18n/i18n"

export class RemoveCommandHandler extends CommandHandler {
  private readonly regex = /^remove\s([1-9][0-9]?)$/i

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  public canHandle(command: string): boolean {
    return this.regex.test(command)
  }

  public async execute({ deps, isMod, sanitizedCommand }: CommandContext): Promise<void> {
    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    const positionMatch = this.regex.exec(sanitizedCommand)
    if (!positionMatch) {
      throw new CommandError(CommandErrorCode.INVALID_COMMAND_FORMAT)
    }

    const position = parseInt(positionMatch[1], 10) - 1
    const songToRemove = deps.songQueue.getAtPosition(position)

    if (!songToRemove) {
      await deps.sendChatMessage(t("commands.remove.notFound", { position: position + 1 }))
      return
    }

    deps.songQueue.removeById(songToRemove.id)
    await deps.sendChatMessage(
      t("commands.remove.removed", { title: songToRemove.title, position: position + 1 }),
    )
  }
}
