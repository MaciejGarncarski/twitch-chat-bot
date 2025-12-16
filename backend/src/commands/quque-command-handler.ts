import { CommandHandler, Deps } from "@/commands/command";
import { TwitchWSMessage } from "@/types/twitch-ws-message";

export class QueueCommandHandler extends CommandHandler {
  private readonly regex = /^!queue\s*$/i;

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText);
  }

  async execute(
    parsedMessage: TwitchWSMessage,
    { songQueue, logger, sendChatMessage }: Deps
  ) {
    if (songQueue.isEmpty()) {
      logger.info(`[COMMAND] [QUEUE] Queue is empty.`);
      await sendChatMessage(`Kolejka jest pusta.`);
      return;
    }

    const queueItems = songQueue.getQueue();
    console.log(queueItems);
    const messageId = parsedMessage.payload.event?.message_id;

    const formattedQueue = queueItems
      .map(
        (item, index) =>
          `${index + 1}. ${item.title} (dodany przez @${item.userId})`
      )
      .join("\n");

    logger.info(`[COMMAND] [QUEUE] Sending current queue.`);
    await sendChatMessage(`Aktualna kolejka:\n${formattedQueue}`, messageId);
  }
}
