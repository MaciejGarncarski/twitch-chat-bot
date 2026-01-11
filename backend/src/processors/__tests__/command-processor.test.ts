import { describe, test, expect, mock, beforeEach } from "bun:test"

mock.module("@/api/send-chat-message", () => ({
  sendChatMessage: mock(() => Promise.resolve()),
}))

mock.module("@/api/timeout-user", () => ({
  timeoutUser: mock(() => Promise.resolve()),
}))

mock.module("@/helpers/logger", () => ({
  logger: {
    info: mock(() => {}),
    warn: mock(() => {}),
    error: mock(() => {}),
  },
}))

mock.module("@/helpers/check-is-mod", () => ({
  checkIsMod: mock(() => false),
}))

mock.module("@/helpers/rate-limit", () => ({
  rateLimiter: {
    check: mock(() => ({ allowed: true })),
  },
}))

mock.module("@/helpers/sanitize-message", () => ({
  sanitizeMessage: mock((msg: string) => msg),
}))

mock.module("@/core/song-request-engine", () => ({
  songRequestEngine: {
    getSongQueue: mock(() => ({})),
    getPlaybackManager: mock(() => ({})),
    getVoteManager: mock(() => ({})),
  },
}))

import { CommandContext, CommandHandler } from "@/commands/command"
import { CommandProcessor } from "@/processors/command-processor"
import { CommandError, CommandErrorCode } from "@/types/errors"
import { TwitchWSMessage } from "@/types/twitch-ws-message"
import { env } from "@/config/env"
import { ITwitchAuthManager } from "@/types/twitch-auth"

const createMockMessage = (
  text: string,
  overrides: Partial<{
    messageType: string
    username: string
    chatterId: string
    broadcasterId: string
  }> = {},
): TwitchWSMessage => ({
  metadata: {
    message_type: overrides.messageType ?? "notification",
  },
  payload: {
    event: {
      broadcaster_user_id: overrides.broadcasterId ?? "broadcaster123",
      broadcaster_user_login: "broadcaster",
      broadcaster_user_name: "Broadcaster",
      source_broadcaster_user_id: null,
      source_broadcaster_user_login: null,
      source_broadcaster_user_name: null,
      chatter_user_id: overrides.chatterId ?? "user123",
      chatter_user_login: overrides.username ?? "testuser",
      chatter_user_name: overrides.username ?? "TestUser",
      message_id: "msg123",
      source_message_id: null,
      is_source_only: null,
      message: {
        text,
        fragments: [],
      },
      badges: [],
      color: "#FFFFFF",
      source_badges: null,
      message_type: "chat_message",
      cheer: null,
      reply: null,
      channel_points_custom_reward_id: null,
      channel_points_animation_id: null,
    },
  },
})

class MockHandler extends CommandHandler {
  executeMock = mock((ctx: CommandContext) => Promise.resolve())
  canHandleMock = mock((msg: string) => true)

  canHandle(msg: string) {
    return this.canHandleMock(msg)
  }

  async execute(ctx: CommandContext) {
    return this.executeMock(ctx)
  }
}

describe("CommandProcessor", () => {
  const prefix = env.COMMAND_PREFIX

  let processor: CommandProcessor
  let mockHandler: MockHandler
  const mockTwitchAuth = {
    userBotUsername: "testbot",
  }

  beforeEach(() => {
    mockHandler = new MockHandler()
    processor = new CommandProcessor([mockHandler], mockTwitchAuth as ITwitchAuthManager)
  })

  test("should ignore non-notification messages", async () => {
    const message = createMockMessage(`${prefix}test`, { messageType: "session_welcome" })

    await processor.process(message)

    expect(mockHandler.canHandleMock).not.toHaveBeenCalled()
  })

  test("should ignore messages without text", async () => {
    const message = createMockMessage("")

    await processor.process(message)

    expect(mockHandler.canHandleMock).not.toHaveBeenCalled()
  })

  test("should call canHandle on handlers", async () => {
    const message = createMockMessage(`${prefix}test`)

    await processor.process(message)

    expect(mockHandler.canHandleMock).toHaveBeenCalledWith("test")
  })

  test("should execute handler when canHandle returns true", async () => {
    const message = createMockMessage(`${prefix}test`)
    mockHandler.canHandleMock.mockReturnValue(true)

    await processor.process(message)

    expect(mockHandler.executeMock).toHaveBeenCalled()
  })

  test("should not execute handler when canHandle returns false", async () => {
    const message = createMockMessage(`${prefix}test`)
    mockHandler.canHandleMock.mockReturnValue(false)

    await processor.process(message)

    expect(mockHandler.executeMock).not.toHaveBeenCalled()
  })

  test("should pass correct context to handler", async () => {
    const message = createMockMessage(`${prefix}test`, { username: "someuser" })
    mockHandler.canHandleMock.mockReturnValue(true)

    await processor.process(message)

    expect(mockHandler.executeMock).toHaveBeenCalled()
    const ctx = mockHandler.executeMock.mock.calls[0][0] as CommandContext
    expect(ctx.username).toBe("someuser")
    expect(ctx.sanitizedCommand).toBe("test")
  })

  test("should stop processing after first matching handler", async () => {
    const secondHandler = new MockHandler()
    processor = new CommandProcessor(
      [mockHandler, secondHandler],
      mockTwitchAuth as ITwitchAuthManager,
    )

    const message = createMockMessage(`${prefix}test`)
    mockHandler.canHandleMock.mockReturnValue(true)
    secondHandler.canHandleMock.mockReturnValue(true)

    await processor.process(message)

    expect(mockHandler.executeMock).toHaveBeenCalled()
    expect(secondHandler.executeMock).not.toHaveBeenCalled()
  })

  test("should handle CommandError.NOT_A_MOD", async () => {
    const message = createMockMessage(`${prefix}test`)
    mockHandler.canHandleMock.mockReturnValue(true)
    mockHandler.executeMock.mockRejectedValue(new CommandError(CommandErrorCode.NOT_A_MOD))

    // Should not throw
    await processor.process(message)
  })

  test("should handle CommandError.INVALID_COMMAND_FORMAT", async () => {
    const message = createMockMessage(`${prefix}test`)
    mockHandler.canHandleMock.mockReturnValue(true)
    mockHandler.executeMock.mockRejectedValue(
      new CommandError(CommandErrorCode.INVALID_COMMAND_FORMAT),
    )

    // Should not throw
    await processor.process(message)
  })

  test("should handle generic errors gracefully", async () => {
    const message = createMockMessage(`${prefix}test`)
    mockHandler.canHandleMock.mockReturnValue(true)
    mockHandler.executeMock.mockRejectedValue(new Error("Something went wrong"))

    // Should not throw
    await processor.process(message)
  })

  test("should treat maciej_ga as mod", async () => {
    const message = createMockMessage(`${prefix}test`, { username: "maciej_ga" })
    mockHandler.canHandleMock.mockReturnValue(true)

    await processor.process(message)

    const ctx = mockHandler.executeMock.mock.calls[0][0] as CommandContext
    expect(ctx.isMod).toBe(true)
  })
})
