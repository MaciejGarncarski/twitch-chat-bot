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
  private ws!: WebSocket;
  private sessionId: string = "";
  private readonly DEFAULT_WS_URL = "wss://eventsub.wss.twitch.tv/ws";
  private keepaliveTimeout: number = 30_000;
  private missedMessageTimer?: NodeJS.Timeout;
  private isReconnecting: boolean = false;

  constructor() {
    this.connect();
  }

  private connect(url: string = this.DEFAULT_WS_URL) {
    const newWs = new WebSocket(url);

    newWs.addEventListener("message", async ({ data }) => {
      this.resetKeepaliveTimer();
      await this.handleMessage(data, newWs);
    });

    newWs.addEventListener("close", () => {
      this.stopKeepaliveTimer();
      logger.info("[CHAT WS] Connection lost. Retrying in 3s...");
      setTimeout(() => this.connect(), 3000);
    });
  }

  async handleMessage(rawData: string, socketContext: WebSocket) {
    const parsed = twitchMessageSchema.parse(JSON.parse(rawData));
    const { message_type } = parsed.metadata;

    switch (message_type) {
      case "session_welcome": {
        const timeoutSeconds =
          parsed.payload.session?.keepalive_timeout_seconds;

        if (timeoutSeconds) {
          this.keepaliveTimeout = timeoutSeconds * 1000;
        }

        const newSessionId = parsed.payload.session?.id;
        if (!newSessionId) {
          logger.error("[CHAT WS] No session ID received.");
          return;
        }

        this.ws = socketContext;
        this.sessionId = newSessionId;

        if (!this.isReconnecting) {
          logger.info("[CHAT WS] Initial connection established.");
          await subscribeToChat(newSessionId);
        } else {
          logger.info("[CHAT WS] Reconnected successfully.");
          this.isReconnecting = false;
        }

        break;
      }

      case "session_reconnect": {
        const reconnectUrl = parsed.payload.session?.reconnect_url;

        this.isReconnecting = true;
        this.ws.close();
        this.resetKeepaliveTimer();

        if (reconnectUrl) {
          logger.info(
            "[CHAT WS] Received reconnect notice. Connecting to new URL..."
          );
          this.connect(reconnectUrl);
          break;
        }
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
      logger.warn(
        "[CHAT WS] No keepalive received. Connection ghosted. Reconnecting..."
      );
      this.ws.close();
    }, this.keepaliveTimeout + 2000);
  }

  private stopKeepaliveTimer() {
    if (this.missedMessageTimer) clearTimeout(this.missedMessageTimer);
  }
}
