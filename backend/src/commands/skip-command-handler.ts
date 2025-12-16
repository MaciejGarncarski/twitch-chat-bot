import { CommandHandler, Deps } from "@/commands/command";
import { checkIsMod } from "@/helpers/check-is-mod";
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
    try {
      const messageId = parsedMessage.payload.event?.message_id;

      if (songQueue.isEmpty()) {
        logger.info(`[COMMAND] [SKIP] Queue is empty, skipping not possible.`);
        console.log("HERE");
        await sendChatMessage(`Kolejka jest pusta.`, messageId);
        return;
      }
      const payload = parsedMessage.payload;

      if (!payload.event) {
        throw new Error("No event found in payload.");
      }

      const isMod = checkIsMod(
        payload.event.badges,
        payload.event.chatter_user_id,
        payload.event.broadcaster_user_id
      );

      if (!isMod) {
        throw new Error("NOT_A_MOD");
      }

      const user = parsedMessage.payload.event?.chatter_user_name;

      if (!user) {
        throw new Error("Missing user information.");
      }

      logger.info(`[COMMAND] [SKIP] Requested by ${user}`);

      const skippedSong = songQueue.removeCurrent();

      if (skippedSong) {
        await sendChatMessage(
          `Pominięto utwór ${skippedSong.title} (dodany przez @${skippedSong.username}).`,
          messageId
        );
        return;
      }

      console.log("HERE2");
      await sendChatMessage(`Kolejka jest pusta.`, messageId);
    } catch (error) {
      if (error instanceof Error) {
        await sendChatMessage(
          "Tylko moderatorzy mogą używać tej komendy.",
          parsedMessage.payload.event?.message_id
        );
      }

      logger.error(`[COMMAND] [SKIP] Error executing skip command: ${error}`);
    }
  }
}
