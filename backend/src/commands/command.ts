import { sendChatMessage } from "@/api/send-chat-message";
import { PlaybackManager } from "@/core/playback-manager";
import { SongQueue } from "@/core/song-queue";
import { logger } from "@/helpers/logger";
import { TwitchWSMessage } from "@/types/twitch-ws-message";

export type Deps = {
  songQueue: SongQueue;
  logger: typeof logger;
  playbackManager: PlaybackManager;
  sendChatMessage: typeof sendChatMessage;
};

export abstract class CommandHandler {
  canHandle(messageText: string): boolean {
    throw new Error("Metoda canHandle musi być zaimplementowana.");
  }

  async execute(parsedMessage: TwitchWSMessage, deps: Deps) {
    throw new Error("Metoda execute musi być zaimplementowana.");
  }
}
