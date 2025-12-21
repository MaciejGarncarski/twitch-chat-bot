import { CommandHandler, Deps } from "@/commands/command";
import { TwitchWSMessage } from "@/types/twitch-ws-message";

export class WrongSongCommandHandler extends CommandHandler {
  private readonly regexp = /^!wrongsong\b/i;

  public canHandle(message: string): boolean {
    return this.regexp.test(message);
  }

  async execute(
    parsedMessage: TwitchWSMessage,
    { logger, sendChatMessage, songQueue, playbackManager }: Deps
  ) {
    const foundSoung = songQueue
      .getQueue()
      .findLast(
        (item) =>
          item.username === parsedMessage.payload.event?.chatter_user_name
      );

    if (!foundSoung) {
      logger.info(
        `[COMMAND] [WRONGSONG] No song found for user ${parsedMessage.payload.event?.chatter_user_login}.`
      );
      return;
    }

    const messageId = parsedMessage.payload.event?.message_id;

    if (playbackManager.getCurrentSongId() === foundSoung.id) {
      logger.info(
        `[COMMAND] [WRONGSONG] User ${parsedMessage.payload.event?.chatter_user_login} tried to skip currently playing song, which is not allowed.`
      );
      await sendChatMessage(
        `@${parsedMessage.payload.event?.chatter_user_login} Nie możesz pominąć odtwarzanego utworu.`,
        messageId
      );

      return;
    }

    songQueue.removeSongById(foundSoung.id);
    logger.info(
      `[COMMAND] [WRONGSONG] Removed song with ID ${foundSoung.id} for user ${parsedMessage.payload.event?.chatter_user_login}.`
    );
    await sendChatMessage(`Usunięto z kolejki.`, messageId);
  }
}
