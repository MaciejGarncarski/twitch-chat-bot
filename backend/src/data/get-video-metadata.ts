import { innertube } from "@/data/innertube";
import z from "zod";

export const getVideoMetadata = async (
  videoId: string
): Promise<SongMetadata> => {
  const info = await innertube.getBasicInfo(videoId);
  const parsed = songMetadataSchema.parse(info);
  return parsed;
};

export const songMetadataSchema = z
  .object({
    basic_info: z.object({
      title: z.string(),
      duration: z.number(),
      thumbnail: z
        .array(
          z.object({
            url: z.string(),
            width: z.number(),
            height: z.number(),
          })
        )
        .optional(),
    }),
  })
  .transform((data): SongMetadata => {
    const thumbnails = data.basic_info.thumbnail;
    const bestThumbnail =
      thumbnails && thumbnails.length > 0
        ? thumbnails[thumbnails.length - 1].url
        : null;

    return {
      title: data.basic_info.title,
      duration: data.basic_info.duration,
      thumbnail: bestThumbnail,
    };
  });

export type SongMetadata = {
  title: string;
  duration: number;
  thumbnail: string | null;
};
