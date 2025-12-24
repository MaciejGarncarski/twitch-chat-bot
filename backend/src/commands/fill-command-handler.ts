import { YTNodes } from 'youtubei.js/agnostic'

import { CommandHandler, ExecuteParams } from '@/commands/command'
import { MAX_VIDEO_DURATION_SECONDS, MIN_VIDEO_DURATION_SECONDS } from '@/config/video'
import { SongMetadata } from '@/data/get-video-metadata'
import { innertube } from '@/data/innertube'

export class FillCommandHandler extends CommandHandler {
  private readonly regex = /^!fill\s+(.+)$/i

  public canHandle(messageText: string): boolean {
    return this.regex.test(messageText)
  }

  public async execute(data: ExecuteParams): Promise<void> {
    const match = data.sanitizedMessage.match(this.regex)
    if (!match) return

    const queueSlotsAvailable = data.deps.songQueue.getAvailableSlots()

    if (queueSlotsAvailable <= 0) {
      await data.deps.sendChatMessage(
        `Kolejka jest pełna! Nie można dodać więcej piosenek.`,
        data.messageId,
      )
      return
    }

    const query = match[1]
    const songs = await this.searchSongsByKeywords(query)

    const shuffledSongs = [...songs]

    for (let i = shuffledSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]]
    }

    const songsToAdd = shuffledSongs.slice(0, queueSlotsAvailable)

    if (songsToAdd.length === 0) {
      await data.deps.sendChatMessage(`Nie znaleziono pasujących utworów.`, data.messageId)
      return
    }

    const username = data.payload.event?.chatter_user_name || 'fill_command'

    let addedCount = 0
    let errorCount = 0

    for (const song of songsToAdd) {
      try {
        await data.deps.songQueue.add({ username: username, videoId: song.videoId }, song.metadata)
        addedCount++
      } catch (error) {
        errorCount++
        data.deps.logger.error(error, `[COMMAND] [FILL] Failed to add song ${song.videoId}`)
      }
    }

    data.deps.logger.info(
      `[COMMAND] [FILL] Added ${addedCount}/${songsToAdd.length} songs for query: ${query}`,
    )

    await data.deps.sendChatMessage(
      `Dodano ${addedCount} piosenek do kolejki dla: ${query}${errorCount > 0 ? ` (${errorCount} nie udało się dodać)` : ''}`,
      data.messageId,
    )
  }

  private async searchSongsByKeywords(query: string): Promise<FillSong[]> {
    const results = await innertube.search(query, {
      type: 'video',
    })

    return results.videos
      .filter((video): video is YTNodes.Video => video.type === 'Video')
      .filter((video) => {
        const duration = video.duration?.seconds
        return (
          duration &&
          duration <= MAX_VIDEO_DURATION_SECONDS &&
          duration >= MIN_VIDEO_DURATION_SECONDS
        )
      })
      .slice(0, 20)
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
