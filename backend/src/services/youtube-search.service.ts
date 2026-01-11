import { YTNodes } from "youtubei.js/agnostic"

import { MAX_VIDEO_DURATION_SECONDS, MIN_VIDEO_DURATION_SECONDS } from "@/config/video"
import { SongMetadata } from "@/data/get-video-metadata"
import { innertube } from "@/data/innertube"

export class YouTubeSearchService {
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

  public mapYTNodeToMetadata(video: YTNodes.Video | YTNodes.PlaylistVideo): SongMetadata {
    return {
      duration: video.duration?.seconds ?? 0,
      title: video.title.toString(),
      thumbnail: video.thumbnails.at(-1)?.url ?? null,
    }
  }
}

export const youtubeSearchService = new YouTubeSearchService()
