import { YTNodes } from 'youtubei.js/agnostic'
import z from 'zod'

import { CommandHandler, ExecuteParams } from '@/commands/command'
import { getVideoMetadata, SongMetadata } from '@/data/get-video-metadata'
import { innertube } from '@/data/innertube'
import { formatDuration } from '@/helpers/format-duration'
import { getTimeUntilAddedSong } from '@/helpers/get-time-until-added-song'
import { getVideoUrl } from '@/helpers/get-video-url'
import { RateLimitConfig } from '@/helpers/rate-limit'
import { QueueError } from '@/types/queue-errors'

export class YoutubeSrHandler extends CommandHandler {
  private readonly regex = /^!sr\s+(.+)$/i
  private readonly ytLinkRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})/

  rateLimit: RateLimitConfig = {
    windowMs: 8000,
    max: 1,
  }

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText)
  }

  async execute({
    deps: { logger, songQueue, sendChatMessage, playbackManager },
    payload,
    sanitizedMessage,
    messageId,
    username,
  }: ExecuteParams) {
    const messageMatch = sanitizedMessage?.match(this.regex)

    if (!messageMatch || !sanitizedMessage) {
      throw new Error('Message does not match SR command.')
    }

    const userInput = messageMatch[1]
    const isYoutubeLink = this.ytLinkRegex.test(userInput)

    logger.info(`[COMMAND] [SR] ${sanitizedMessage} by ${username}`)

    let videoId = ''
    let metadata: SongMetadata | undefined = undefined

    try {
      if (isYoutubeLink) {
        const newVideoId = this.extractVideoId(userInput)

        if (!newVideoId) {
          throw new Error('Invalid YouTube link.')
        }

        const videoInfo = await getVideoMetadata(newVideoId)
        videoId = newVideoId
        metadata = videoInfo
      }

      if (!isYoutubeLink) {
        const searchResult = await this.searchYoutubeVideo(userInput)
        if (!searchResult) {
          throw new Error('No YT search results found.')
        }
        videoId = searchResult.videoId
        metadata = searchResult.metadata
      }

      const newSongInput = {
        username: username,
        videoId: videoId,
      }

      const added = await songQueue.add(newSongInput, metadata)
      const position = songQueue.findPositionInQueue(added.id)
      const durationFormatted = formatDuration(added.duration)
      const durationUntilPlay = formatDuration(
        getTimeUntilAddedSong(songQueue.getQueue(), playbackManager.getPlayTime()),
      )
      const durationText = durationUntilPlay === '0:00' ? 'teraz' : `za około ${durationUntilPlay}`

      await sendChatMessage(
        `Dodano do kolejki ${metadata?.title} przez @${username} (długość: ${durationFormatted}). Pozycja w kolejce ${position}. Odtwarzanie ${durationText}.`,
        messageId,
      )
    } catch (error) {
      const title = metadata?.title || 'Nieznany'
      const duration = metadata ? formatDuration(metadata.duration) : 'Nieznana'
      const link = videoId ? getVideoUrl(videoId) : 'Brak'

      let message = `FootYellow Nie udało się dodać do kolejki. Tytuł: ${title}, Długość: ${duration}, Link: ${link}`

      if (error instanceof QueueError) {
        logger.error(`[COMMAND] [SR] QueueError: ${error.code}`)

        switch (error.code) {
          case 'ALREADY_EXISTS':
            message = `FootYellow Ten filmik jest już w kolejce!`
            break
          case 'QUEUE_FULL':
            message = `PoroSad Kolejka jest pełna! Spróbuj ponownie później.`
            break
          case 'TOO_SHORT':
            message = `FootYellow Filmik jest za krótki.`
            break
          case 'TOO_LONG':
            message = `FootYellow Filmik jest za długi.`
            break
        }

        await sendChatMessage(message, messageId)
        return
      }

      if (error instanceof Error) {
        logger.error(error.message)
      }
      await sendChatMessage(message, messageId)
    }
  }

  private extractVideoId(url: string): string | null {
    const match = url.match(this.ytLinkRegex)
    return match ? match[1] : null
  }

  private async searchYoutubeVideo(
    query: string,
  ): Promise<{ videoId: string; metadata: SongMetadata } | null> {
    const results = await innertube.search(query, { type: 'video' })

    const song = results.videos.find((node): node is YTNodes.Video => node.type === 'Video')

    if (!song) {
      return null
    }

    const metadata: SongMetadata = {
      duration: song.duration?.seconds ?? 0,
      title: song.title.toString(),
      thumbnail: song.thumbnails.at(-1)?.url ?? null,
    }

    return { videoId: song.video_id, metadata }
  }
}

export const SearchResultSchema = z
  .object({
    title: z.object({
      text: z.string(),
    }),
    duration: z.object({
      seconds: z.number(),
    }),
    thumbnails: z.array(
      z.object({
        url: z.string(),
      }),
    ),
  })
  .transform(
    (data): SongMetadata => ({
      title: data.title.text,
      duration: data.duration.seconds,
      thumbnail: data.thumbnails.at(-1)?.url ?? null,
    }),
  )
