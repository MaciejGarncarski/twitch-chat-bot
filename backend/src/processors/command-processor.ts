import { CommandHandler, Deps } from "@/commands/command";
import { logger } from "@/helpers/logger";
import { TwitchWSMessage } from "@/types/twitch-ws-message";
import { songQueue } from "@/connectors/chat-ws";
import { sendChatMessage } from "@/api/send-chat-message";
import { sanitizeMessage } from "@/helpers/sanitize-message";
import { playbackManager } from "@/core/playback-manager";
import { voteManager } from "@/core/vote-manager";

class CommandProcessor {
  handlers: CommandHandler[];

  constructor(handlers: CommandHandler[]) {
    this.handlers = handlers;
  }

  async process(parsed: TwitchWSMessage) {
    if (parsed.metadata.message_type !== "notification") {
      return;
    }

    const messageText = parsed.payload.event?.message?.text.trim();

    if (!messageText) {
      logger.warn("[COMMAND] Received message without text.");
      return;
    }
    const sanitizedMessage = sanitizeMessage(messageText);

    const deps: Deps = {
      songQueue,
      logger,
      sendChatMessage,
      playbackManager,
      voteManager,
    };

    for (const handler of this.handlers) {
      const canHandle = handler.canHandle(sanitizedMessage);
      if (!canHandle) {
        continue;
      }

      try {
        logger.info(`[COMMAND] [EXEC] ${handler.constructor.name}`);
        await handler.execute(parsed, deps);
        return;
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Błąd w wykonaniu komendy: ${error.message}`);
        }
      }
    }
  }
}

export default CommandProcessor;
