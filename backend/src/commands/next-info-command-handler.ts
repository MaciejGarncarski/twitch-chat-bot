import { CommandHandler, Deps } from "@/commands/command";
import { formatDuration } from "@/helpers/format-duration";
import { TwitchWSMessage } from "@/types/twitch-ws-message";

export class NextInfoCommandHandler extends CommandHandler {
  private readonly regex = /^!next\s*$/i;

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText);
  }

  async execute(
    parsedMessage: TwitchWSMessage,
    { songQueue, logger, sendChatMessage }: Deps
  ) {
    const messageId = parsedMessage.payload.event?.message_id;
    const nextSong = songQueue.peekNext();

    const timeUntilPlay = songQueue.getDurationBeforePlayingNext();

    if (!nextSong) {
      logger.info(`[COMMAND] [NEXT] No next song in the queue.`);

      await sendChatMessage(`Brak następnego utworu.`, messageId);
      return;
    }

    logger.info(
      `[COMMAND] [NEXT] Next song is ${nextSong.title} added by @${nextSong.username}.`
    );

    const nextInfoMessage = `Następny utwór: ${
      nextSong.title
    } za ${formatDuration(timeUntilPlay)}.`;

    await sendChatMessage(nextInfoMessage, messageId);
  }
}
