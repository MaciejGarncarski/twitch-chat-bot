import { CommandHandler, Deps } from "@/commands/command";
import { playbackManager } from "@/core/playback-manager";
import { formatDuration } from "@/helpers/format-duration";
import { TwitchWSMessage } from "@/types/twitch-ws-message";

export class CurrentSongCommandHandler extends CommandHandler {
  private readonly regex = /^!currentsong\s*$/i;

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

    const currentSong = songQueue.getCurrent();

    if (!currentSong) {
      return;
    }

    const durationToEnd = currentSong.duration - playbackManager.getPlayTime();
    const formatDurationToEnd = formatDuration(durationToEnd);

    logger.info(
      `[COMMAND] [CURRENTSONG] Current song is ${currentSong.title} added by ${currentSong.username}.`
    );
    await sendChatMessage(
      `Aktualny utwór to ${currentSong.title} (dodany przez @${currentSong.username}). Pozostało do końca: ${formatDurationToEnd}.`,
      messageId
    );
  }
}
