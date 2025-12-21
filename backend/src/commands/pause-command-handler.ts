import { CommandHandler, Deps } from "@/commands/command";
import { checkIsMod } from "@/helpers/check-is-mod";
import { CommandError, CommandErrorCode } from "@/types/errors";
import { TwitchWSMessage } from "@/types/twitch-ws-message";

export class PauseCommandHandler extends CommandHandler {
  private readonly regex = /^!pause\s*$/i;

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText);
  }

  async execute(
    parsedMessage: TwitchWSMessage,
    { logger, playbackManager }: Deps
  ) {
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

    logger.info(`[COMMAND] [Playback] Sending pause message.`);

    playbackManager.pause();
  }
}
