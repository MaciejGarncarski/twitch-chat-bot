import { CommandHandler, CommandContext } from "@/commands/command"
import { formatDuration } from "@/helpers/format-duration"
import { RateLimitConfig } from "@/helpers/rate-limit"

export class CurrentSongCommandHandler extends CommandHandler {
  private readonly command = "song"

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  canHandle(command: string): boolean {
    return command.toLowerCase() === this.command
  }

  async execute({
    deps: { songQueue, logger, sendChatMessage, playbackManager },
    messageId,
  }: CommandContext) {
    if (songQueue.isEmpty()) {
      logger.info(`[COMMAND] [SKIP] Queue is empty, skipping not possible.`)
      await sendChatMessage(`Kolejka jest pusta.`, messageId)
      return
    }

    const currentSong = songQueue.getCurrent()

    if (!currentSong) {
      return
    }

    const durationToEnd = currentSong.duration - playbackManager.getPlayTime()
    const formatDurationToEnd = formatDuration(durationToEnd)

    logger.info(
      `[COMMAND] [CURRENTSONG] Current song is ${currentSong.title} added by ${currentSong.username}.`,
    )
    await sendChatMessage(
      `Aktualny utwór to ${currentSong.title} (dodany przez @${currentSong.username}). Pozostało do końca: ${formatDurationToEnd}.`,
      messageId,
    )
  }
}
