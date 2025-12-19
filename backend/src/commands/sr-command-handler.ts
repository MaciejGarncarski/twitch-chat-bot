import { CommandHandler, Deps } from "@/commands/command";
import { TwitchWSMessage } from "@/types/twitch-ws-message";
import { formatDuration } from "@/helpers/format-duration";
import z from "zod";
import { SongMetadata } from "@/data/get-video-metadata";
import { innertube } from "@/data/innertube";
import { YTNodes } from "youtubei.js/agnostic";

export class YoutubeSrHandler extends CommandHandler {
  private readonly regex = /^!sr\s+(.+)$/i;
  private readonly ytLinkRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})/;

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText);
  }

  async execute(
    parsedMessage: TwitchWSMessage,
    { songQueue, logger, sendChatMessage }: Deps
  ) {
    const messageText = parsedMessage.payload.event?.message?.text;
    const messageMatch = messageText?.match(this.regex);

    if (!messageMatch || !messageText) {
      throw new Error("Message does not match SR command.");
    }

    const userInput = messageMatch[1];
    const isYoutubeLink = this.ytLinkRegex.test(userInput);
    const messageId = parsedMessage.payload.event?.message_id;
    const user = parsedMessage.payload.event?.chatter_user_name;

    if (!user) {
      throw new Error("Not matching SR command or missing user/messageId.");
    }

    logger.info(`[COMMAND] [SR] ${messageText}`);

    let videoLink = "";
    let videoId = "";

    try {
      if (isYoutubeLink) {
        const newVideoId = this.extractVideoId(userInput);

        if (!newVideoId) {
          throw new Error("Invalid YouTube link.");
        }

        videoId = newVideoId;
        videoLink = `https://www.youtube.com/watch?v=${videoId}`;
      }

      let metadata: SongMetadata | null = null;

      if (!isYoutubeLink) {
        const searchResult = await this.searchYoutubeVideo(userInput);
        if (!searchResult) {
          throw new Error("No YT search results found.");
        }
        videoId = searchResult.videoId;

        metadata = searchResult.metadata;
        videoLink = `https://www.youtube.com/watch?v=${videoId}`;
      }

      const added = await songQueue.add(
        {
          username: user,
          videoUrl: videoLink,
          videoId: videoId,
        },
        metadata || undefined
      );

      const durationFormatted = formatDuration(added.duration);
      const durationUntilPlay = formatDuration(
        songQueue.getDurationBeforePlayingCurrent()
      );

      await sendChatMessage(
        `Dodano do kolejki ${videoLink} przez @${user} (długość: ${durationFormatted}). Pozycja w kolejce ${added.position}. Odtwarzanie za ${durationUntilPlay}.`,
        messageId
      );
    } catch (e) {
      let message = `FootYellow Nie udało się dodać do kolejki ${videoLink} przez @${user} FootYellow`;

      if (e instanceof Error) {
        logger.error(e.message);

        if (e.message === "ALREADY_EXISTS") {
          message = `FootYellow Filmik już dodany FootYellow`;
        } else if (e.message === "QUEUE_FULL") {
          message = `PoroSad Kolejka jest pełna! Spróbuj ponownie później PoroSad`;
        } else if (e.message === "TOO_LONG") {
          message = `FootYellow Za długi filmik FootYellow`;
        } else if (e.message === "TOO_SHORT") {
          message = `FootYellow Za krótki filmik FootYellow`;
        }
      }

      await sendChatMessage(message, messageId);
    }
  }

  private extractVideoId(url: string): string | null {
    const match = url.match(this.ytLinkRegex);
    return match ? match[1] : null;
  }

  private async searchYoutubeVideo(
    query: string
  ): Promise<{ videoId: string; metadata: SongMetadata } | null> {
    const results = await innertube.search(query, { type: "video" });

    const song = results.videos.find(
      (node): node is YTNodes.Video => node.type === "Video"
    );

    if (!song) {
      return null;
    }

    const metadata: SongMetadata = {
      duration: song.duration?.seconds ?? 0,
      title: song.title.toString(),
      thumbnail: song.thumbnails.at(-1)?.url ?? null,
    };

    return { videoId: song.video_id, metadata };
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
      })
    ),
  })
  .transform(
    (data): SongMetadata => ({
      title: data.title.text,
      duration: data.duration.seconds,
      thumbnail: data.thumbnails.at(-1)?.url ?? null,
    })
  );
