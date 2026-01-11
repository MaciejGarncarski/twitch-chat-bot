import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { CommandError, CommandErrorCode } from "@/types/errors"
import { t } from "@/i18n/i18n"

export class WrongSongAllCommandHandler extends CommandHandler {
  private readonly command = "wrongsongall"

  rateLimit: RateLimitConfig = {
    windowMs: 15000,
    max: 1,
  }

  public canHandle(command: string): boolean {
    return this.command === command.toLowerCase()
  }

  async execute({
    deps: { logger, songQueue, sendChatMessage },
    payload,
    username,
    messageId,
  }: CommandContext) {
    if (!payload.event) {
      throw new CommandError(
        CommandErrorCode.EVENT_NOT_FOUND,
        "Event data is required to execute this command.",
      )
    }

    const queue = songQueue.getQueue()

    const userSongs = queue.filter((item, idx) => {
      return item.username === username && idx !== 0
    })

    if (userSongs.length === 0) {
      logger.info(`[COMMAND] [WRONGSONG] No song found for user ${username}.`)
      return
    }

    songQueue.removeBatchByIds(userSongs.map((s) => s.id))

    logger.info(
      `[COMMAND] [WRONGSONG] Removed songs: ${userSongs.map((s) => s.title).join(", ")} for user ${username}.`,
    )
    const songWordKey =
      userSongs.length === 1
        ? "commands.wrongsongall.songSingular"
        : "commands.wrongsongall.songPlural"
    const songWord = t(songWordKey)
    await sendChatMessage(
      t("commands.wrongsongall.removed", { count: userSongs.length, songWord }),
      messageId,
    )
  }
}
