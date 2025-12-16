import { CommandHandler, Deps } from "@/commands/command";
import { TwitchWSMessage } from "@/types/twitch-ws-message";
import { formatDuration } from "@/helpers/format-duration";

export class YoutubeSrHandler extends CommandHandler {
  private readonly regex =
    /^!sr\s+(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText);
  }

  async execute(
    parsedMessage: TwitchWSMessage,
    { songQueue, logger, sendChatMessage }: Deps
  ) {
    const messageText = parsedMessage.payload.event?.message?.text;

    if (!messageText) {
      throw new Error("No messageText found.");
    }

    const match = messageText.match(this.regex);

    const messageId = parsedMessage.payload.event?.message_id;
    const user = parsedMessage.payload.event?.chatter_user_name;

    if (!match || !user || !messageText) {
      throw new Error("Not matching SR command or missing user/messageId.");
    }

    const videoId = match[1];
    const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

    logger.info(`[COMMAND] [SR] ${messageText}`);

    try {
      const added = await songQueue.add({
        userId: user,
        videoUrl: videoLink,
        videoId: videoId,
      });

      const durationUntilPlay = songQueue.getDurationBeforePlayingCurrent();

      await sendChatMessage(
        `Dodano do kolejki ${videoLink} przez @${user} (długość: ${formatDuration(
          added.duration
        )}). Pozycja w kolejce ${
          added.position
        }. Odtwarzanie za ${formatDuration(durationUntilPlay)}.`,
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
}
