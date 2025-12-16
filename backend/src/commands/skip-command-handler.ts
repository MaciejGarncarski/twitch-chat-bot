import { CommandHandler, Deps } from "@/commands/command";
import { TwitchWSMessage } from "@/types/twitch-ws-message";

export class SkipCommandHandler extends CommandHandler {
  private readonly regex = /^!skip\s*$/i;

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText);
  }

  async execute(
    parsedMessage: TwitchWSMessage,
    { songQueue, logger, sendChatMessage }: Deps
  ) {
    const messageId = parsedMessage.payload.event?.message_id;

    if (songQueue.isEmpty()) {
      logger.info(`[COMMAND] [SKIP] Queue is empty, skipping not possible.`);
      await sendChatMessage(`Kolejka jest pusta.`, messageId);
      return;
    }

    const user = parsedMessage.payload.event?.chatter_user_name;

    if (!user) {
      throw new Error("Missing user information.");
    }

    logger.info(`[COMMAND] [SKIP] Requested by ${user}`);

    const skippedSong = songQueue.next();

    if (skippedSong) {
      await sendChatMessage(
        `Pominięto utwór ${skippedSong.title} (dodany przez @${skippedSong.userId}).`,
        messageId
      );
      return;
    }

    await sendChatMessage(`Kolejka jest pusta.`, messageId);
  }
}
