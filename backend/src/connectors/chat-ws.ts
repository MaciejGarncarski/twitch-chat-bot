import { CurrentSongCommandHandler } from "@/commands/current-song-command-handler";
import { GithubCommandHandler } from "@/commands/github-commang-handler";
import { HelpCommandHandler } from "@/commands/help-command-handler";
import { NextInfoCommandHandler } from "@/commands/next-info-command-handler";
import { PauseCommandHandler } from "@/commands/pause-command-handler";
import { PlayCommandHandler } from "@/commands/play-command-handler";
import { QueueCommandHandler } from "@/commands/quque-command-handler";
import { SkipCommandHandler } from "@/commands/skip-command-handler";
import { YoutubeSrHandler } from "@/commands/sr-command-handler";
import { VolumeCommandHandler } from "@/commands/volume-command-handler";
import { VoteSkipCommandHandler } from "@/commands/vote-skip-command-handler";
import { WrongSongCommandHandler } from "@/commands/wrong-song-command-handler";
import {
  subscribeToChat,
  unsubscribeAll,
} from "@/connectors/chat-subscription";
import { SongQueue } from "@/core/song-queue";
import { logger } from "@/helpers/logger";
import CommandProcessor from "@/processors/command-processor";
import { twitchMessageSchema } from "@/types/twitch-ws-message";

await unsubscribeAll();

export const songQueue = new SongQueue();

const commandHandlers = [
  new YoutubeSrHandler(),
  new SkipCommandHandler(),
  new CurrentSongCommandHandler(),
  new QueueCommandHandler(),
  new VolumeCommandHandler(),
  new WrongSongCommandHandler(),
  new GithubCommandHandler(),
  new PlayCommandHandler(),
  new PauseCommandHandler(),
  new VoteSkipCommandHandler(),
  new NextInfoCommandHandler(),
  new HelpCommandHandler(),
];

const processor = new CommandProcessor(commandHandlers);

export class ChatWebSocket {
  private ws?: WebSocket;
  private sessionId = "";
  private missedMessageTimer?: NodeJS.Timeout;

  private isTransferring = false;

  private readonly DEFAULT_WS_URL = "wss://eventsub.wss.twitch.tv/ws";
  private keepaliveTimeoutSeconds = 30_000;

  constructor() {
    this.connect();
  }

  private connect(url: string = this.DEFAULT_WS_URL) {
    logger.info(`[CHAT WS] Connecting to ${url}...`);

    const ws = new WebSocket(url);
    this.ws = ws;

    ws.addEventListener("message", async ({ data }) => {
      console.log("MESSAGE", data);
      this.resetKeepaliveTimer();
      await this.handleMessage(data.toString(), ws);
    });

    ws.addEventListener("close", () => {
      this.stopKeepaliveTimer();

      if (this.isTransferring) {
        logger.info(
          "[CHAT WS] Old connection closed successfully (Transfer complete)."
        );
        return;
      }

      logger.info("[CHAT WS] Connection lost. Retrying in 3s...");

      this.isTransferring = false;

      setTimeout(() => this.connect(), 3000);
    });

    ws.addEventListener("error", (err) => {
      logger.error("[CHAT WS] WebSocket error");
      console.error(err);
      ws.close();
    });
  }

  private async handleMessage(rawData: string, socketContext: WebSocket) {
    const parsed = twitchMessageSchema.parse(JSON.parse(rawData));
    const { message_type } = parsed.metadata;

    switch (message_type) {
      case "session_welcome": {
        const timeoutSeconds =
          parsed.payload.session?.keepalive_timeout_seconds;

        if (timeoutSeconds) {
          this.keepaliveTimeoutSeconds = timeoutSeconds * 1000;
        }

        const newSessionId = parsed.payload.session?.id;
        if (!newSessionId) return;

        this.sessionId = newSessionId;

        this.ws = socketContext;

        logger.info(`[CHAT WS] Connected. Session ID: ${newSessionId}`);

        console.log("WELCOME");
        this.resetKeepaliveTimer();

        if (this.isTransferring) {
          logger.info(
            "[CHAT WS] Session transferred. Subscriptions preserved."
          );
          this.isTransferring = false;
        } else {
          logger.info("[CHAT WS] Fresh session. Subscribing to events...");
          await subscribeToChat(newSessionId);
        }

        break;
      }

      case "session_reconnect": {
        const reconnectUrl = parsed.payload.session?.reconnect_url;
        if (!reconnectUrl) return;

        logger.info("[CHAT WS] Twitch requested reconnect (Migration).");

        this.isTransferring = true;
        this.connect(reconnectUrl);
        break;
      }

      case "notification": {
        await processor.process(parsed);
        break;
      }

      case "session_keepalive":
        break;
    }
  }

  private resetKeepaliveTimer() {
    this.stopKeepaliveTimer();

    this.missedMessageTimer = setTimeout(() => {
      logger.warn("[CHAT WS] No keepalive received. Connection ghosted.");

      this.ws?.close();
    }, this.keepaliveTimeoutSeconds + 2000);
  }

  private stopKeepaliveTimer() {
    if (this.missedMessageTimer) {
      clearTimeout(this.missedMessageTimer);
      this.missedMessageTimer = undefined;
    }
  }
}
