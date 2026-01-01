import { describe, test, expect } from "bun:test"

import { createMockContext } from "@/commands/__tests__/helpers/create-mock-context"
import { WrongSongAllCommandHandler } from "@/commands/wrong-song-all-command-handler"
import { SongQueue } from "@/core/song-queue"

describe("WrongSongAllCommandHandler", () => {
  const handler = new WrongSongAllCommandHandler()

  describe("canHandle", () => {
    test("matches !wrongsongall (case insensitive)", () => {
      expect(handler.canHandle("!wrongsongall")).toBe(true)
      expect(handler.canHandle("!WRONGSONGALL")).toBe(true)
      expect(handler.canHandle("!WrongSongAll")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("!wrongsong")).toBe(false)
      expect(handler.canHandle("wrongsongall")).toBe(false)
    })
  })

  describe("execute", () => {
    test("removes all user's songs from queue except currently playing", async () => {
      const queue = new SongQueue()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })
      await queue.add({ username: "test_chatter", videoId: "sk3rpYkiHe8" })
      await queue.add({ username: "test_chatter", videoId: "9bZkp7q19f0" })
      await queue.add({ username: "user2", videoId: "kJQP7kiw5Fk" })

      const ctx = createMockContext({
        username: "test_chatter",
        message: "!wrongsongall",
        deps: { songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith(
        "Usunięto 2 utworów z kolejki.",
        ctx.messageId,
      )
      expect(queue.getQueue().length).toBe(2)
    })

    test("does nothing if user has no songs in queue", async () => {
      const queue = new SongQueue()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        username: "test_chatter",
        message: "!wrongsongall",
        deps: { songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).not.toHaveBeenCalled()
      expect(queue.getQueue().length).toBe(1)
    })

    test("does not remove currently playing song even if user's", async () => {
      const queue = new SongQueue()
      await queue.add({ username: "test_chatter", videoId: "dQw4w9WgXcQ" })
      await queue.add({ username: "test_chatter", videoId: "sk3rpYkiHe8" })

      const ctx = createMockContext({
        username: "test_chatter",
        message: "!wrongsongall",
        deps: { songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith(
        "Usunięto 1 utwór z kolejki.",
        ctx.messageId,
      )
      expect(queue.getQueue().length).toBe(1)
      expect(queue.getCurrent()?.id).toBe("dQw4w9WgXcQ")
    })
  })
})
