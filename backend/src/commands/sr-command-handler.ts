import { CommandHandler, Deps } from "@/commands/command";
import { TwitchWSMessage } from "@/types/twitch-ws-message";
import { formatDuration } from "@/helpers/format-duration";
import { logger } from "@/helpers/logger";

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

      if (!isYoutubeLink) {
        const searchResult = await this.searchYoutubeVideo(userInput);
        if (!searchResult) {
          throw new Error("No YT search results found.");
        }
        videoId = searchResult;
        videoLink = `https://www.youtube.com/watch?v=${videoId}`;
      }

      const added = await songQueue.add(
        {
          username: user,
          videoUrl: videoLink,
          videoId: videoId,
        },
        messageId
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

  private async searchYoutubeVideo(query: string): Promise<string | null> {
    const searchQuery = query.startsWith("http") ? query : `ytsearch1:${query}`;

    const command = [
      "yt-dlp",
      searchQuery,
      "--get-id",
      "--no-playlist",
      "--flat-playlist",
    ];

    const process = Bun.spawn(command, {
      stdout: "pipe",
      stderr: "pipe",
    });

    const [outputBytes, errorBytes, exitCode] = await Promise.all([
      Bun.readableStreamToArrayBuffer(process.stdout),
      Bun.readableStreamToArrayBuffer(process.stderr),
      process.exited,
    ]);

    const output = new TextDecoder().decode(outputBytes).trim();
    const errorOutput = new TextDecoder().decode(errorBytes).trim();

    if (exitCode !== 0) {
      logger.error("yt-dlp error output");
      throw new Error(`yt-dlp execution error: ${errorOutput || exitCode}`);
    }

    if (!output) {
      return null;
    }

    logger.info("[COMMAND] [SR] Song found via yt-dlp search");
    return output;
  }
}
