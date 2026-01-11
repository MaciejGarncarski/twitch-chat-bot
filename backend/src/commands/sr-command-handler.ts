import { CommandContext, CommandHandler } from "@/commands/command"
import { getVideoMetadata, SongMetadata } from "@/data/get-video-metadata"
import { formatDuration } from "@/helpers/format-duration"
import { getTimeUntilAddedSong } from "@/helpers/get-time-until-added-song"
import { getVideoUrl } from "@/helpers/get-video-url"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { youtubeSearchService } from "@/services/youtube-search.service"
import { QueueError } from "@/types/queue-errors"
import { t } from "@/i18n/i18n"

export class YoutubeSrHandler extends CommandHandler {
  private readonly regex = /^sr\s+(.+)$/i

  rateLimit: RateLimitConfig = {
    windowMs: 8000,
    max: 1,
  }

  canHandle(command: string): boolean {
    return this.regex.test(command)
  }

  async execute({
    deps: { logger, songQueue, sendChatMessage, playbackManager },
    sanitizedCommand,
    messageId,
    username,
  }: CommandContext) {
    const messageMatch = sanitizedCommand?.match(this.regex)

    if (!messageMatch || !sanitizedCommand) {
      throw new Error("Message does not match SR command.")
    }

    const userInput = messageMatch[1]
    const isYoutubeLink = youtubeSearchService.isYouTubeLink(userInput)

    logger.info(`[COMMAND] [SR] ${sanitizedCommand} by ${username}`)

    let videoId = ""
    let metadata: SongMetadata | undefined = undefined

    try {
      if (isYoutubeLink) {
        const newVideoId = youtubeSearchService.extractVideoId(userInput)
        if (!newVideoId) {
          throw new Error("Invalid YouTube link.")
        }

        logger.info(`[COMMAND] [SR] Extracted video ID: ${newVideoId}`)

        const videoInfo = await getVideoMetadata(newVideoId)
        videoId = newVideoId
        metadata = videoInfo
      }

      if (!isYoutubeLink) {
        const searchResult = await youtubeSearchService.searchVideo(userInput)
        if (!searchResult) {
          throw new Error("No YT search results found.")
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
      const playTime =
        durationUntilPlay === "0:00"
          ? t("commands.sr.playNow")
          : t("commands.sr.playIn", { duration: durationUntilPlay })

      await sendChatMessage(
        t("commands.sr.added", {
          title: metadata?.title ?? "",
          username,
          duration: durationFormatted,
          position: position || 0,
          playTime,
        }),
        messageId,
      )
    } catch (error) {
      const title = metadata?.title || t("common.None")
      const duration = metadata ? formatDuration(metadata.duration) : t("common.None")
      const link = videoId ? getVideoUrl(videoId) : t("common.None")

      let message = t("commands.sr.failed", { title, duration, link })

      if (error instanceof QueueError) {
        logger.error(`[COMMAND] [SR] QueueError: ${error.code}`)

        switch (error.code) {
          case "ALREADY_EXISTS":
            message = t("commands.sr.alreadyExists")
            break
          case "QUEUE_FULL":
            message = t("commands.sr.queueFull")
            break
          case "TOO_SHORT":
            message = t("commands.sr.tooShort")
            break
          case "TOO_LONG":
            message = t("commands.sr.tooLong")
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
}
