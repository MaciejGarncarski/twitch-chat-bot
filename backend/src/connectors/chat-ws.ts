import { CurrentSongCommandHandler } from "@/commands/current-song-command-handler";
import { GithubCommandHandler } from "@/commands/github-commang-handler";
import { HelpCommandHandler } from "@/commands/help-command-handler";
import { PauseCommandHandler } from "@/commands/pause-command-handler";
import { PlayCommandHandler } from "@/commands/play-command-handler";
import { QueueCommandHandler } from "@/commands/quque-command-handler";
import { SkipCommandHandler } from "@/commands/skip-command-handler";
import { YoutubeSrHandler } from "@/commands/sr-command-handler";
import { VolumeCommandHandler } from "@/commands/volume-command-handler";
import { WrongSongCommandHandler } from "@/commands/wrong-song-command-handler";
import {
  subscribeToChat,
  unsubscribeAll,
} from "@/connectors/chat-subscription";
import { SongQueue } from "@/core/queue";
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
  new HelpCommandHandler(),
];
const processor = new CommandProcessor(commandHandlers);

export class ChatWebSocket {
  private ws: WebSocket;
  private sessionId: string;
  private readonly WS_URL = "wss://eventsub.wss.twitch.tv/ws";

  constructor() {
    this.sessionId = "";
    this.ws = new WebSocket(this.WS_URL);

    this.ws.addEventListener("message", async ({ data }) => {
      this.handleMessage(data);
    });
  }

  async handleMessage(data: string) {
    const parsed = twitchMessageSchema.parse(JSON.parse(data));
    if (parsed?.payload?.session?.id) {
      if (!this.sessionId) {
        await subscribeToChat(parsed.payload.session.id);
      }

      this.sessionId = parsed.payload.session.id;
    }

    if (parsed.metadata.message_type === "session_reconnect") {
      if (!parsed.payload?.session?.reconnect_url) {
        throw new Error("Invalid recconect_url");
      }

      this.ws.close();
      this.ws = new WebSocket(parsed.payload.session.reconnect_url);
    }

    if (parsed.metadata.message_type === "notification") {
      await processor.process(parsed);
    }
  }
}
