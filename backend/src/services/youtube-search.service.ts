import { YTNodes } from "youtubei.js/agnostic"

import { MAX_VIDEO_DURATION_SECONDS, MIN_VIDEO_DURATION_SECONDS } from "@/config/video"
import { innertube } from "@/data/innertube"
import { logger } from "@/helpers/logger"

export interface IYouTubeSearchService {
  extractVideoId(url: string): string | null
  isYouTubeLink(input: string): boolean
  searchVideo(query: string): Promise<{ videoId: string; metadata: SongMetadata } | null>
  searchVideos(query: string): Promise<Array<{ videoId: string; metadata: SongMetadata }>>
  getVideoMetadata(videoId: string): Promise<SongMetadata>
  mapYTNodeToMetadata(video: YTNodes.Video | YTNodes.PlaylistVideo): SongMetadata
}

export class YouTubeSearchService implements IYouTubeSearchService {
  private readonly ytLinkRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})/

  public extractVideoId(url: string): string | null {
    const match = url.match(this.ytLinkRegex)
    return match ? match[1] : null
  }

  public isYouTubeLink(input: string): boolean {
    return this.ytLinkRegex.test(input)
  }

  public async searchVideo(
    query: string,
  ): Promise<{ videoId: string; metadata: SongMetadata } | null> {
    const results = await innertube.search(query, { type: "video" })

    const song = results.videos.find((node): node is YTNodes.Video => node.type === "Video")

    if (!song) {
      return null
    }

    const metadata = this.mapYTNodeToMetadata(song)

    return { videoId: song.video_id, metadata }
  }

  public async searchVideos(
    query: string,
  ): Promise<Array<{ videoId: string; metadata: SongMetadata }>> {
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
      .map((video) => ({
        videoId: video.video_id,
        metadata: this.mapYTNodeToMetadata(video),
      }))
  }

  public async getVideoMetadata(videoId: string): Promise<SongMetadata> {
    try {
      const info = await innertube.getBasicInfo(videoId)
      const thumbnails = info.basic_info.thumbnail

      if (!info.basic_info.duration || !info.basic_info.title) {
        logger.error(
          `[DATA] [GET-VIDEO-METADATA] Missing duration or title for video ID: ${videoId}`,
        )
        throw new Error("Could not retrieve video metadata.")
      }

      return {
        duration: info.basic_info.duration,
        title: info.basic_info.title,
        thumbnail:
          thumbnails && thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : null,
      }
    } catch (error) {
      logger.error(
        error,
        `[DATA] [GET-VIDEO-METADATA] Error retrieving metadata for video ID: ${videoId} - ${error}`,
      )
      throw new Error("Could not retrieve video metadata.")
    }
  }

  public mapYTNodeToMetadata(video: YTNodes.Video | YTNodes.PlaylistVideo): SongMetadata {
    return {
      duration: video.duration?.seconds ?? 0,
      title: video.title.toString(),
      thumbnail: video.thumbnails.at(-1)?.url ?? null,
    }
  }
}

export const youtubeSearchService = new YouTubeSearchService()

export type SongMetadata = {
  title: string
  duration: number
  thumbnail: string | null
}
