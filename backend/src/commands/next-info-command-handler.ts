import { CommandHandler, CommandContext } from "@/commands/command"
import { formatDuration } from "@/helpers/format-duration"
import { getTimeUntilNextSong } from "@/helpers/get-time-until-next-song"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { t } from "@/i18n/i18n"

export class NextInfoCommandHandler extends CommandHandler {
  private readonly command = "next"

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  canHandle(command: string): boolean {
    return command.toLowerCase() === this.command
  }

  async execute({
    deps: { songQueue, sendChatMessage, logger, playbackManager },
    messageId,
  }: CommandContext) {
    const nextSong = songQueue.peekNext()
    const current = songQueue.getCurrent()

    if (!current) {
      logger.info(`[COMMAND] [NEXT] No current song playing.`)
      await sendChatMessage(t("commands.next.noCurrent"), messageId)
      return
    }

    if (!nextSong) {
      logger.info(`[COMMAND] [NEXT] No next song in the queue.`)
      await sendChatMessage(t("commands.next.noNext"), messageId)
      return
    }

    const timeUntilPlay = getTimeUntilNextSong(current, playbackManager.getPlayTime())
    logger.info(`[COMMAND] [NEXT] Next song is ${nextSong.title} added by @${nextSong.username}.`)
    const nextInfoMessage = t("commands.next.message", {
      title: nextSong.title,
      duration: formatDuration(timeUntilPlay),
    })
    await sendChatMessage(nextInfoMessage, messageId)
  }
}
