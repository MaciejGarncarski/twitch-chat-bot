import { YTNodes } from "youtubei.js/agnostic"

import { CommandContext, CommandHandler } from "@/commands/command"
import { MAX_VIDEO_DURATION_SECONDS, MIN_VIDEO_DURATION_SECONDS } from "@/config/video"
import { SongMetadata } from "@/data/get-video-metadata"
import { innertube } from "@/data/innertube"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { shuffle } from "@/helpers/shuffle"

export class FillCommandHandler extends CommandHandler {
  private readonly regex = /^!fill\s+(.+)$/i

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  public canHandle(messageText: string): boolean {
    return this.regex.test(messageText)
  }

  public async execute({
    sanitizedMessage,
    deps,
    messageId,
    username,
  }: CommandContext): Promise<void> {
    const match = sanitizedMessage.match(this.regex)
    if (!match) return

    const queueSlotsAvailable = deps.songQueue.getAvailableSlots()
    if (queueSlotsAvailable <= 0) {
      await deps.sendChatMessage(`Kolejka jest pełna! Nie można dodać więcej piosenek.`, messageId)
      return
    }

    const query = match[1]
    const songs = await this.searchSongsByKeywords(query)
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

  private async searchSongsByKeywords(query: string): Promise<FillSong[]> {
    const results = await innertube.search(query, {
      type: "video",
    })

    return results.videos
      .filter((video): video is YTNodes.Video => video.type === "Video")
      .filter((video) => {
        const duration = video.duration?.seconds
        return (
          duration &&
          duration <= MAX_VIDEO_DURATION_SECONDS &&
          duration >= MIN_VIDEO_DURATION_SECONDS
        )
      })
      .map((video): { metadata: SongMetadata; videoId: string } => {
        const metadata: SongMetadata = {
          duration: video.duration?.seconds || 0,
          title: video.title.toString(),
          thumbnail: video.thumbnails.at(-1)?.url || null,
        }

        return {
          metadata,
          videoId: video.video_id,
        }
      })
  }
}

type FillSong = { metadata: SongMetadata; videoId: string }
