import { describe, test, expect } from "bun:test"

import { createMockContext } from "@/commands/__tests__/helpers/create-mock-context"
import { ShuffleCommandHandler } from "@/commands/shuffle-command-handler"
import { SongQueue } from "@/core/song-queue"
import { CommandErrorCode } from "@/types/errors"

describe("ShuffleCommandHandler", () => {
  const handler = new ShuffleCommandHandler()

  describe("canHandle", () => {
    test("matches !shuffle", () => {
      expect(handler.canHandle("!shuffle")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("!SHUFFLE")).toBe(false) // regex doesn't have 'i' flag
      expect(handler.canHandle("!shuffl")).toBe(false)
      expect(handler.canHandle("shuffle")).toBe(false)
      expect(handler.canHandle("!shuffle now")).toBe(false)
    })
  })

  describe("execute", () => {
    test("shuffles the queue when user is mod", async () => {
      const queue = new SongQueue()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })
      await queue.add({ username: "user2", videoId: "sk3rpYkiHe8" })
      await queue.add({ username: "user3", videoId: "9bZkp7q19f0" })

      const ctx = createMockContext({
        isMod: true,
        message: "!shuffle",
        deps: { songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith(
        "Kolejka została przetasowana.",
        ctx.messageId,
      )
    })

    test("throws error if user is not a mod", async () => {
      const ctx = createMockContext({
        isMod: false,
        message: "!shuffle",
      })

      expect(handler.execute(ctx)).rejects.toThrow(CommandErrorCode.NOT_A_MOD)
    })
  })
})
