import { CommandHandler, Deps } from "@/commands/command";
import { checkIsMod } from "@/helpers/check-is-mod";
import { TwitchWSMessage } from "@/types/twitch-ws-message";

export class PlayCommandHandler extends CommandHandler {
  private readonly regex = /^!play\s*$/i;

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText);
  }

  async execute(
    parsedMessage: TwitchWSMessage,
    { logger, sendChatMessage, playbackManager }: Deps
  ) {
    try {
      const messageId = parsedMessage.payload.event?.message_id;
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

      logger.info(`[COMMAND] [Playback] Sending play message.`);
      await sendChatMessage("Wznawiam...", messageId);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "NOT_A_MOD") {
          logger.info(
            `[COMMAND] [PLAY] User is not a mod, cannot execute command.`
          );
          await sendChatMessage(
            "Tylko moderatorzy mogą używać tej komendy.",
            parsedMessage.payload.event?.message_id
          );
          return;
        }
        logger.error(`[COMMAND] [PLAY] Error: ${error.message}`);
      }
    }

    playbackManager.play();
  }
}
