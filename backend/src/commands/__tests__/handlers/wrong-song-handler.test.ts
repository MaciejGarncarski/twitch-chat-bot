import { describe, test, expect } from "bun:test"

import { createMockContext, createCommand } from "@/commands/__tests__/helpers/create-mock-context"
import { WrongSongCommandHandler } from "@/commands/wrong-song-command-handler"
import { SongQueue } from "@/core/song-queue"

const COMMAND = createCommand("wrongsong")

describe("WrongSongCommandHandler", () => {
  const handler = new WrongSongCommandHandler()

  describe("canHandle", () => {
    test("matches wrongsong command (case insensitive)", () => {
      expect(handler.canHandle("wrongsong")).toBe(true)
      expect(handler.canHandle("WRONGSONG")).toBe(true)
      expect(handler.canHandle("WrongSong")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("wrong")).toBe(false)
    })
  })

  describe("execute", () => {
    test("removes user's last added song from queue", async () => {
      const queue = new SongQueue()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })
      await queue.add({ username: "test_chatter", videoId: "sk3rpYkiHe8" })
      await queue.add({ username: "test_chatter", videoId: "9bZkp7q19f0" })

      const ctx = createMockContext({
        username: "test_chatter",
        message: createCommand("wrongsong"),
        deps: { songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith("Usunięto z kolejki.", ctx.messageId)
      expect(queue.getQueue().length).toBe(2)
      // Should have removed 9bZkp7q19f0 (last added by test_chatter)
      expect(queue.getQueue().find((s) => s.id === "9bZkp7q19f0")).toBeUndefined()
    })

    test("does nothing if user has no songs in queue", async () => {
      const queue = new SongQueue()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        username: "test_chatter",
        message: COMMAND,
        deps: { songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).not.toHaveBeenCalled()
      expect(queue.getQueue().length).toBe(1)
    })

    test("cannot remove currently playing song", async () => {
      const queue = new SongQueue()
      await queue.add({ username: "test_chatter", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        username: "test_chatter",
        message: COMMAND,
        deps: { songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith(
        "@test_chatter Nie możesz pominąć odtwarzanego utworu.",
        ctx.messageId,
      )
      expect(queue.getQueue().length).toBe(1)
    })
  })
})
