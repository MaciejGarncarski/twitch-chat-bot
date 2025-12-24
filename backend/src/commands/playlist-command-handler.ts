import { YTNodes } from 'youtubei.js/agnostic'

import { CommandHandler, ExecuteParams } from '@/commands/command'
import { MAX_VIDEO_DURATION_SECONDS } from '@/config/video'
import { SongMetadata } from '@/data/get-video-metadata'
import { innertube } from '@/data/innertube'

export class PlaylistCommandHandler extends CommandHandler {
  private readonly regex = /^!playlist\s+(.+)$/i
  private readonly urlRegex = /[?&]list=([^#\&\?]+)/

  public canHandle(messageText: string): boolean {
    return this.regex.test(messageText)
  }

  public async execute({
    deps,
    sanitizedMessage,
    messageId,
    payload,
  }: ExecuteParams): Promise<void> {
    const match = sanitizedMessage.match(this.regex)
    if (!match) return

    const query = match[1].trim()
    const queueSlotsAvailable = deps.songQueue.getAvailableSlots()

    if (queueSlotsAvailable <= 0) {
      await deps.sendChatMessage(`Kolejka jest pełna! Nie można dodać playlisty.`, messageId)
      return
    }

    const playlistId = await this.resolvePlaylistId(query)

    if (!playlistId) {
      await deps.sendChatMessage(`Nie znaleziono playlisty dla zapytania: "${query}"`, messageId)
      return
    }

    const videos = await this.fetchPlaylistVideos(playlistId, queueSlotsAvailable)

    if (videos.length === 0) {
      await deps.sendChatMessage(
        `Ta playlista jest pusta lub nie zawiera odpowiednich utworów.`,
        messageId,
      )
      return
    }

    const username = payload.event?.chatter_user_name || 'playlist_command'

    const results = { added: 0, failed: 0, errors: [] as string[] }

    for (const video of videos) {
      try {
        await deps.songQueue.add({ username, videoId: video.videoId }, video.metadata)
        results.added++
      } catch (error) {
        results.failed++
        deps.logger.warn(`Failed to add video ${video.videoId}: ${error}`)
      }
    }

    if (results.added === 0) {
      await deps.sendChatMessage(`Nie udało się dodać żadnego utworu z playlisty.`, messageId)
      return
    }

    const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`

    deps.logger.info(
      `[COMMAND] [PLAYLIST] Added ${results.added} songs from playlist ${playlistUrl}${results.failed > 0 ? ` (${results.failed} failed)` : ''}`,
    )

    const message =
      results.failed > 0
        ? `Dodano ${results.added} utworów z playlisty (${results.failed} pominięto). ${playlistUrl}`
        : `Dodano ${results.added} utworów z playlisty do kolejki! ${playlistUrl}`

    await deps.sendChatMessage(message, messageId)
  }

  private async resolvePlaylistId(query: string): Promise<string | null> {
    const urlMatch = query.match(this.urlRegex)

    if (urlMatch && urlMatch[1]) {
      return urlMatch[1]
    }

    const searchResult = await innertube.search(query, { type: 'playlist' })

    for (const item of searchResult.results || []) {
      if (item.is(YTNodes.GridPlaylist, YTNodes.Playlist, YTNodes.CompactPlaylist)) {
        return item.id
      }

      if (item.is(YTNodes.LockupView) && item.content_type === 'PLAYLIST') {
        const lockupItem = item as unknown as { content_id: string | null }
        return typeof lockupItem.content_id === 'string' ? lockupItem.content_id : null
      }
    }
    return null
  }

  private async fetchPlaylistVideos(playlistId: string, limit: number): Promise<PlaylistSong[]> {
    const playlist = await innertube.getPlaylist(playlistId)

    return playlist.items
      .filter((item): item is YTNodes.PlaylistVideo => item.type === 'PlaylistVideo')
      .filter((video) => {
        const duration = video.duration?.seconds
        return video.id && duration && duration <= MAX_VIDEO_DURATION_SECONDS
      })
      .slice(0, limit)
      .map((video) => ({
        videoId: video.id,
        metadata: {
          title: video.title.toString(),
          thumbnail: video.thumbnails[0]?.url || null,
          duration: video.duration.seconds,
        },
      }))
  }
}

type PlaylistSong = { metadata: SongMetadata; videoId: string }
