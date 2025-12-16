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

    const helpMessage = `Dostępne komendy: !sr <link do YouTube> - dodaj utwór do kolejki, !currentsong - pokaż aktualny utwór, !queue - pokaż kolejkę, !skip - pomiń aktualny utwór (tylko mod). !volume <0-1> - ustaw głośność (tylko mod). !help - pokaż tę wiadomość. !wrongsong - usuń swoją piosenkę z kolejki. !github - link do repozytorium. !pause - pauzuj odtwarzanie (tylko mod). !play - wznow odtwarzanie (tylko mod).`;

    await sendChatMessage(helpMessage, messageId);
  }
}
