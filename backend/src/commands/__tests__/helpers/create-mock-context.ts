import { mock } from "bun:test"

import { CommandContext } from "@/commands/command"
import { env } from "@/config/env"
import { TwitchMessagePayload } from "@/types/twitch-ws-message"

const createTextFragment = (text: string) => ({
  type: "text" as const,
  text,
  cheermote: null,
  emote: null,
  mention: null,
})

const defaultEvent = {
  broadcaster_user_id: "12345",
  broadcaster_user_login: "test_broadcaster",
  broadcaster_user_name: "Test_Broadcaster",
  source_broadcaster_user_id: null,
  source_broadcaster_user_login: null,
  source_broadcaster_user_name: null,
  chatter_user_id: "67890",
  chatter_user_login: "test_chatter",
  chatter_user_name: "Test_Chatter",
  message_id: "test-message-id",
  source_message_id: null,
  is_source_only: null,
  message: {
    text: "!sr test song",
    fragments: [createTextFragment("!sr test song")],
  },
  badges: [],
  color: "#FF0000",
  source_badges: null,
  message_type: "text",
  cheer: null,
  reply: null,
  channel_points_custom_reward_id: null,
  channel_points_animation_id: null,
}

export const defaultTwitchMessagePayload: TwitchMessagePayload = {
  session: {
    id: "test-session-id",
    reconnect_url: null,
    keepalive_timeout_seconds: 10,
  },
  subscription: {
    id: "test-subscription-id",
    status: "enabled",
    type: "channel.chat.message",
    version: "1",
    condition: {},
    transport: {},
    created_at: "2026-01-01T00:00:00Z",
    cost: 0,
  },
  event: defaultEvent,
}

interface CreateMockContextOptions extends Omit<Partial<CommandContext>, "deps"> {
  message?: string
  deps?: Partial<CommandContext["deps"]>
}

export function createMockDeps(): CommandContext["deps"] {
  return {
    sendChatMessage: mock(() => Promise.resolve()),
    timeoutUser: mock(() => Promise.resolve()),
    logger: {
      info: mock(),
      warn: mock(),
      error: mock(),
    } as unknown as CommandContext["deps"]["logger"],
    songQueue: {
      isEmpty: mock(() => false),
      getQueue: mock(() => []),
      getCurrent: mock(() => null),
      getCurrentSongId: mock(() => null),
      peekNext: mock(() => null),
      getAtPosition: mock(() => null),
      getAvailableSlots: mock(() => 10),
      findPositionInQueue: mock(() => 1),
      add: mock(() => Promise.resolve({})),
      removeById: mock(() => {}),
      removeBatchByIds: mock(() => {}),
      removeCurrent: mock(() => null),
      shuffle: mock(() => {}),
      clearAll: mock(() => {}),
    } as unknown as CommandContext["deps"]["songQueue"],
    playbackManager: {
      play: mock(() => {}),
      pause: mock(() => {}),
      seek: mock(() => {}),
      getPlayTime: mock(() => 0),
      getVolume: mock(() => 50),
      setVolume: mock(() => {}),
      getIsLoopEnabled: mock(() => false),
      toggleLoopEnabled: mock(() => false),
    } as unknown as CommandContext["deps"]["playbackManager"],
    voteManager: {
      hasVoted: mock(() => false),
      addVote: mock(() => {}),
      getCurrentCount: mock(() => 0),
      getVotesNeeded: mock(() => 5),
      reset: mock(() => {}),
    } as unknown as CommandContext["deps"]["voteManager"],
  }
}

export function createMockContext(overrides: CreateMockContextOptions = {}): CommandContext {
  const { message, deps: depsOverrides, ...rest } = overrides
  const messageText = message ?? createCommand("sr test song")

  // Strip the command prefix to get sanitizedCommand (like the real processor does)
  const sanitizedCommand = messageText.startsWith(env.COMMAND_PREFIX)
    ? messageText.slice(env.COMMAND_PREFIX.length)
    : messageText

  const payload: TwitchMessagePayload = rest.payload ?? {
    ...defaultTwitchMessagePayload,
    event: {
      ...defaultEvent,
      message: {
        text: messageText,
        fragments: [createTextFragment(messageText)],
      },
    },
  }

  return {
    payload,
    isMod: rest.isMod ?? false,
    messageId: rest.messageId ?? "test-message-id",
    userId: rest.userId ?? "67890",
    username: rest.username ?? "test_chatter",
    sanitizedCommand: rest.sanitizedCommand ?? sanitizedCommand,
    deps: {
      ...createMockDeps(),
      ...depsOverrides,
    },
  }
}

/**
 * Helper to create a command message with the environment's command prefix.
 * @param command - The command name without prefix (e.g., "help", "skip", "sr youtube.com/...")
 * @returns The full command message with prefix (e.g., "#help" in test environment)
 */
export function createCommand(command: string): string {
  return `${env.COMMAND_PREFIX}${command}`
}
