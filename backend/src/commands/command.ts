import { Logger } from "pino";

import { sendChatMessage } from "@/api/send-chat-message";
import { timeoutUser } from "@/api/timeout-user";
import { IPlaybackManager } from "@/core/playback-manager";
import { ISongQueue } from "@/core/song-queue";
import { IVoteManager } from "@/core/vote-manager";
import { RateLimitConfig } from "@/helpers/rate-limit";
import { TwitchMessagePayload } from "@/types/twitch-ws-message";

export type ContextDeps = {
  songQueue: ISongQueue;
  voteManager: IVoteManager;
  logger: Logger;
  playbackManager: IPlaybackManager;
  timeoutUser: typeof timeoutUser;
  sendChatMessage: typeof sendChatMessage;
};

export type CommandContext = {
  payload: TwitchMessagePayload;
  deps: ContextDeps;
  messageId: string | undefined;
  userId: string | undefined;
  username: string;
  sanitizedMessage: string;
  isMod: boolean;
};

export abstract class CommandHandler {
  rateLimit?: RateLimitConfig;

  canHandle(_messageText: string): boolean {
    throw new Error("Method canHandle has not been implemented.");
  }

  async execute(_ctx: CommandContext): Promise<void> {
    throw new Error("Method execute has not been implemented.");
  }
}
