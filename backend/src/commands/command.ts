import { Logger } from "pino"

import { sendChatMessage } from "@/api/send-chat-message"
import { timeoutUser } from "@/api/timeout-user"
import { IPlaybackManager } from "@/core/playback-manager"
import { ISongQueue } from "@/core/song-queue"
import { IVoteManager } from "@/core/vote-manager"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { TwitchWSPayload } from "@/schemas/twitch-websocket"
import { IYouTubeSearchService } from "@/services/youtube-search.service"

export type ContextDeps = {
  songQueue: ISongQueue
  voteManager: IVoteManager
  logger: Logger
  playbackManager: IPlaybackManager
  youtubeSearchService: IYouTubeSearchService
  timeoutUser: typeof timeoutUser
  sendChatMessage: typeof sendChatMessage
}

export type CommandContext = {
  payload: TwitchWSPayload
  deps: ContextDeps
  messageId: string | undefined
  userId: string | undefined
  username: string
  sanitizedCommand: string
  isMod: boolean
}

export abstract class CommandHandler {
  rateLimit?: RateLimitConfig

  abstract canHandle(_messageText: string): boolean
  abstract execute(_ctx: CommandContext): Promise<void>
}
