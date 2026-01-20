import { CommandContext, CommandHandler } from "@/commands/command"
import { formatDuration } from "@/helpers/format-duration"
import { getTimeUntilAddedSong } from "@/helpers/get-time-until-added-song"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { SongMetadata } from "@/services/youtube-search.service"
import { t } from "@/i18n/i18n"
import { YtError, YtErrorCode } from "@/types/yt-errors"

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
    deps: { logger, youtubeSearchService, songQueue, sendChatMessage, playbackManager },
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

    if (isYoutubeLink) {
      const newVideoId = youtubeSearchService.extractVideoId(userInput)

      if (!newVideoId) {
        logger.error("[COMMAND] [SR] Failed to extract video ID from YouTube link.")
        throw new YtError(YtErrorCode.INVALID_VIDEO_ID)
      }

      logger.info(`[COMMAND] [SR] Extracted video ID: ${newVideoId}`)

      const videoInfo = await youtubeSearchService.getVideoMetadata(newVideoId)
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
        link: `https://youtu.be/${videoId}`,
      }),
      messageId,
    )
  }
}
