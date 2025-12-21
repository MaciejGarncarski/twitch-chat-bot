import { CommandHandler, Deps } from "@/commands/command";
import { logger } from "@/helpers/logger";
import { TwitchWSMessage } from "@/types/twitch-ws-message";
import { songQueue } from "@/connectors/chat-ws";
import { sendChatMessage } from "@/api/send-chat-message";
import { sanitizeMessage } from "@/helpers/sanitize-message";
import { playbackManager } from "@/core/playback-manager";
import { voteManager } from "@/core/vote-manager";
import { CommandError, CommandErrorCode } from "@/types/errors";

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
        const messageId = parsed.payload.event?.message_id;

        if (error instanceof CommandError) {
          switch (error.code) {
            case CommandErrorCode.NOT_A_MOD:
              await sendChatMessage(
                "Tylko moderatorzy mogą używać tej komendy.",
                messageId
              );
              break;
            default:
              logger.error(`[COMMAND] Unhandled CommandError: ${error.code}`);
          }
          return;
        }

        if (error instanceof Error) {
          logger.error(
            `[COMMAND] [EXEC] ${handler.constructor.name} Error executing command: ${error.message}`
          );
        }
      }
    }
  }
}

export default CommandProcessor;
