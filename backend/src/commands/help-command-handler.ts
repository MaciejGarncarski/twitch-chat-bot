import { CommandHandler, Deps } from "@/commands/command";
import { TwitchWSMessage } from "@/types/twitch-ws-message";

export class HelpCommandHandler extends CommandHandler {
  private readonly regex = /^![^!]/i;

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText);
  }

  async execute(
    parsedMessage: TwitchWSMessage,
    { logger, sendChatMessage }: Deps
  ) {
    const messageId = parsedMessage.payload.event?.message_id;

    logger.info(`[COMMAND] [HELP] Sending help message.`);

    const helpMessage = `Dostępne komendy: !sr <link | fraza>, !song, !queue, !help - pokaż tę wiadomość, !wrongsong - usuń swoją piosenkę z kolejki, !github - link do repozytorium,
    !voteskip, !next - informacje o następnej piosence, !pause - (tylko mod), !play - (tylko mod), !skip (tylko mod), !volume <0-100> (tylko mod)`;

    await sendChatMessage(helpMessage, messageId);
  }
}
