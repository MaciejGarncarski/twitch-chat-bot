import { describe, test, expect } from "bun:test"

import { createMockContext, createCommand } from "@/commands/__tests__/helpers/create-mock-context"
import { ShuffleCommandHandler } from "@/commands/shuffle-command-handler"
import { SongQueue } from "@/core/song-queue"
import { CommandErrorCode } from "@/types/command-errors"

const COMMAND = createCommand("shuffle")

describe("ShuffleCommandHandler", () => {
  const handler = new ShuffleCommandHandler()

  describe("canHandle", () => {
    test("matches shuffle command (case insensitive)", () => {
      expect(handler.canHandle("shuffle")).toBe(true)
      expect(handler.canHandle("SHUFFLE")).toBe(true)
      expect(handler.canHandle("Shuffle")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("shuffl")).toBe(false)
      expect(handler.canHandle("shuffle now")).toBe(false)
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
        message: COMMAND,
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
        message: COMMAND,
      })

      expect(handler.execute(ctx)).rejects.toThrow(CommandErrorCode.NOT_A_MOD)
    })
  })
})
