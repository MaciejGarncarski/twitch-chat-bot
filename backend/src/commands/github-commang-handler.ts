import { CommandHandler, Deps } from "@/commands/command";
import { logger } from "@/helpers/logger";
import { TwitchWSMessage } from "@/types/twitch-ws-message";

export class GithubCommandHandler extends CommandHandler {
  private readonly regex = /^!github\b/i;

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText);
  }

  async execute(parsedMessage: TwitchWSMessage, { sendChatMessage }: Deps) {
    const messageId = parsedMessage.payload.event?.message_id;

    logger.info(`[COMMAND] [GITHUB] Sending GitHub repository link.`);
    await sendChatMessage(
      "Link do repozytorium: https://github.com/maciejgarncarski/twitch-chat-bot",
      messageId
    );
  }
}
