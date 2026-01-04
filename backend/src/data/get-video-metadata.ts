import { innertube } from "@/data/innertube"

export const getVideoMetadata = async (videoId: string): Promise<SongMetadata> => {
  const info = await innertube.getBasicInfo(videoId)

  const thumbnails = info.basic_info.thumbnail

  if (!info.basic_info.duration || !info.basic_info.title) {
    throw new Error("Could not retrieve video metadata.")
  }

  return {
    duration: info.basic_info.duration,
    title: info.basic_info.title,
    thumbnail: thumbnails && thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : null,
  }
}

export type SongMetadata = {
  title: string
  duration: number
  thumbnail: string | null
}
