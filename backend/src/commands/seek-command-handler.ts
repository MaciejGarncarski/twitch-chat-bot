import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { CommandError, CommandErrorCode } from "@/types/command-errors"
import { t } from "@/i18n/i18n"

export class SeekCommandHandler extends CommandHandler {
  private readonly regex = /^seek\s+(?:(\d{1,2}):([0-5]?\d)|(\d{1,3}))$/i

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  public canHandle(command: string): boolean {
    return this.regex.test(command)
  }

  public async execute({
    deps: { logger, playbackManager, songQueue, sendChatMessage },
    isMod,
    messageId,
    sanitizedCommand,
    username,
  }: CommandContext): Promise<void> {
    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    const match = this.regex.exec(sanitizedCommand)

    if (!match) {
      throw new CommandError(CommandErrorCode.INVALID_COMMAND_FORMAT)
    }

    let totalSeekSeconds = 0
    const minutesGroup = match[1]
    const secondsWithMinutes = match[2]
    const secondsOnly = match[3]

    if (minutesGroup !== undefined && secondsWithMinutes !== undefined) {
      totalSeekSeconds = parseInt(minutesGroup, 10) * 60 + parseInt(secondsWithMinutes, 10)
    } else {
      totalSeekSeconds = parseInt(secondsOnly, 10)
    }

    const currentSong = songQueue.getCurrent()

    if (!currentSong) return

    if (totalSeekSeconds >= currentSong.duration) {
      await sendChatMessage(
        t("commands.seek.beyondDuration", {
          seek: totalSeekSeconds,
          duration: currentSong.duration,
        }),
        messageId,
      )
      return
    }

    playbackManager.seek(totalSeekSeconds)
    logger.info(
      `[COMMAND] [EXEC] [SEEK] User ${username} seeked to ${totalSeekSeconds}s (${sanitizedCommand})`,
    )
  }
}
