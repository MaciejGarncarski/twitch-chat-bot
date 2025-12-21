import { CommandHandler, Deps } from "@/commands/command";
import { checkIsMod } from "@/helpers/check-is-mod";
import { logger } from "@/helpers/logger";
import { sanitizeMessage } from "@/helpers/sanitize-message";
import { CommandError, CommandErrorCode } from "@/types/errors";
import { TwitchWSMessage } from "@/types/twitch-ws-message";

export class VolumeCommandHandler extends CommandHandler {
  private readonly regex = /^!volume(?:\s+(100|[1-9]?\d))?\s*$/;

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText);
  }

  async execute(
    parsedMessage: TwitchWSMessage,
    { playbackManager, sendChatMessage }: Deps
  ) {
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
      throw new CommandError(CommandErrorCode.NOT_A_MOD);
    }

    const messageText = sanitizeMessage(
      parsedMessage.payload.event?.message?.text || ""
    );

    const match = messageText.match(this.regex);
    const isSetVolumeCommand = match ? match[1] !== undefined : false;

    if (!isSetVolumeCommand) {
      const volume = playbackManager.getVolume();
      await sendChatMessage(`Aktualna głośność to ${volume}%.`, messageId);
      return;
    }

    if (!match || !messageId) {
      throw new Error("Not matching VOLUME command or missing messageId.");
    }

    const volume = parseInt(match[1]);

    if (volume > 100 || volume < 0) {
      return;
    }

    playbackManager.setVolume(volume);

    await sendChatMessage(`Ustawiono głośność na ${volume}%.`, messageId);
  }
}
