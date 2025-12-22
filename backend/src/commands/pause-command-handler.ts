import { CommandHandler, ExecuteParams } from "@/commands/command";
import { RateLimitConfig } from "@/helpers/rate-limit";
import { checkIsMod } from "@/helpers/check-is-mod";
import { CommandError, CommandErrorCode } from "@/types/errors";

export class PauseCommandHandler extends CommandHandler {
  private readonly regex = /^!pause\s*$/i;

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 2,
  };

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText);
  }

  async execute({ deps: { logger, playbackManager }, payload }: ExecuteParams) {
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
