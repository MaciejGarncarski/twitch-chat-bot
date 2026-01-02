import { describe, test, expect } from "bun:test"

import { createMockContext } from "@/commands/__tests__/helpers/create-mock-context"
import { SkipCommandHandler } from "@/commands/skip-command-handler"
import { SongQueue } from "@/core/song-queue"
import { CommandErrorCode } from "@/types/errors"

const COMMAND = "!skip"

describe("SkipCommandHandler", () => {
  const handler = new SkipCommandHandler()

  describe("canHandle", () => {
    test("matches !skip (case insensitive)", () => {
      expect(handler.canHandle("!skip")).toBe(true)
      expect(handler.canHandle("!SKIP")).toBe(true)
      expect(handler.canHandle("!Skip")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("!ski")).toBe(false)
      expect(handler.canHandle("skip")).toBe(false)
      expect(handler.canHandle("!skip now")).toBe(false)
    })
  })

  describe("execute", () => {
    test("skips song when user is mod", async () => {
      const queue = new SongQueue()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })
      await queue.add({ username: "user2", videoId: "sk3rpYkiHe8" })

      const ctx = createMockContext({
        isMod: true,
        message: COMMAND,
        deps: { songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
      expect(queue.getQueue().length).toBe(1)
      expect(queue.getCurrent()?.id).toBe("sk3rpYkiHe8")
    })

    test("skips song when user is the requester", async () => {
      const queue = new SongQueue()
      await queue.add({ username: "test_chatter", videoId: "dQw4w9WgXcQ" })
      await queue.add({ username: "user2", videoId: "sk3rpYkiHe8" })

      const ctx = createMockContext({
        isMod: false,
        username: "test_chatter",
        message: COMMAND,
        deps: { songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
      expect(queue.getQueue().length).toBe(1)
    })

    test("throws error if user is not mod and not the requester", async () => {
      const queue = new SongQueue()
      await queue.add({ username: "other_user", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        isMod: false,
        username: "test_chatter",
        message: "!skip",
        deps: { songQueue: queue },
      })

      expect(handler.execute(ctx)).rejects.toThrow(CommandErrorCode.CANNOT_SKIP_SONG)
    })

    test("sends message when queue is empty", async () => {
      const queue = new SongQueue()

      const ctx = createMockContext({
        isMod: true,
        message: "!skip",
        deps: { songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith("Kolejka jest pusta.", ctx.messageId)
    })
  })
})
