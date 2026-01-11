import { CommandContext, CommandHandler } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { shuffle } from "@/helpers/shuffle"
import { youtubeSearchService } from "@/services/youtube-search.service"

export class FillCommandHandler extends CommandHandler {
  private readonly regex = /^fill\s+(.+)$/i

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  public canHandle(command: string): boolean {
    return this.regex.test(command)
  }

  public async execute({
    sanitizedCommand,
    deps,
    messageId,
    username,
  }: CommandContext): Promise<void> {
    const match = sanitizedCommand.match(this.regex)
    if (!match) return

    const queueSlotsAvailable = deps.songQueue.getAvailableSlots()
    if (queueSlotsAvailable <= 0) {
      await deps.sendChatMessage(`Kolejka jest pełna! Nie można dodać więcej piosenek.`, messageId)
      return
    }

    const query = match[1]
    const songs = await youtubeSearchService.searchVideos(query)
    const shuffledSongs = shuffle([...songs])
    const songsToAdd = shuffledSongs.slice(0, queueSlotsAvailable)

    if (songsToAdd.length === 0) {
      await deps.sendChatMessage(`Nie znaleziono pasujących utworów.`, messageId)
      return
    }

    let addedCount = 0
    let errorCount = 0

    for (const song of songsToAdd) {
      try {
        await deps.songQueue.add({ username: username, videoId: song.videoId }, song.metadata)
        addedCount++
      } catch (error) {
        errorCount++
        deps.logger.error(error, `[COMMAND] [FILL] Failed to add song ${song.videoId}`)
      }
    }

    deps.logger.info(
      `[COMMAND] [FILL] Added ${addedCount}/${songsToAdd.length} songs for query: ${query}`,
    )

    await deps.sendChatMessage(
      `Dodano ${addedCount} piosenek do kolejki dla: ${query}${errorCount > 0 ? ` (${errorCount} nie udało się dodać)` : ""}`,
      messageId,
    )
  }
}
