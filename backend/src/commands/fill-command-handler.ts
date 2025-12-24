import { YTNodes } from 'youtubei.js/agnostic'

import { CommandHandler, ExecuteParams } from '@/commands/command'
import { MAX_VIDEO_DURATION_SECONDS } from '@/config/video'
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
    const songs = await this.searchSongsByKeywords(query.split(/\s+/))

    const shuffledSongs = songs.sort(() => Math.random() - 0.5)
    const songsToAdd = shuffledSongs.slice(0, queueSlotsAvailable)

    if (songsToAdd.length === 0) {
      await data.deps.sendChatMessage(`Nie znaleziono pasujących utworów.`, data.messageId)
      return
    }

    const username = data.payload.event?.chatter_user_name || 'fill_command'

    for (const song of songsToAdd) {
      await data.deps.songQueue.add({ username: username, videoId: song.videoId }, song.metadata)
    }

    data.deps.logger.info(`[COMMAND] [FILL] Added ${songsToAdd.length} songs for query: ${query}`)

    await data.deps.sendChatMessage(
      `Dodano ${songsToAdd.length} piosenek do kolejki dla: ${query}`,
      data.messageId,
    )
  }

  private async searchSongsByKeywords(keywords: string[]): Promise<FillSong[]> {
    const results = await innertube.search(keywords.join(' '), {
      type: 'video',
    })

    return results.videos
      .filter((video): video is YTNodes.Video => video.type === 'Video')
      .filter((video) => {
        const duration = video.duration?.seconds
        return duration && duration <= MAX_VIDEO_DURATION_SECONDS
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
