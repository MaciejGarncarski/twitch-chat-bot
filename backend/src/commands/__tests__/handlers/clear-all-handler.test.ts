import { describe, test, expect } from "bun:test"

import { createMockContext, createCommand } from "@/commands/__tests__/helpers/create-mock-context"
import { ClearAllCommandHandler } from "@/commands/clear-all-command-handler"
import { SongQueue } from "@/core/song-queue"
import { CommandErrorCode } from "@/types/errors"

const COMMAND = createCommand("clearall")

describe("ClearAllCommandHandler", () => {
  const handler = new ClearAllCommandHandler()

  describe("canHandle", () => {
    test("matches clearall command (case insensitive)", () => {
      expect(handler.canHandle("clearall")).toBe(true)
      expect(handler.canHandle("CLEARALL")).toBe(true)
      expect(handler.canHandle("ClearAll")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("ca")).toBe(false)
      expect(handler.canHandle("clear all")).toBe(false)
    })
  })

  describe("execute", () => {
    test("clears the entire queue", async () => {
      const queue = new SongQueue()

      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })
      await queue.add({ username: "user1", videoId: "sk3rpYkiHe8" })

      expect(queue.getQueue().length).toBe(2)

      const ctx = createMockContext({
        deps: {
          songQueue: queue,
        },
        isMod: true,
        message: COMMAND,
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith(
        "Kolejka została wyczyszczona.",
        ctx.messageId,
      )
      expect(queue.getQueue().length).toBe(0)
    })
    test("execute throws error if user is not a mod", async () => {
      const ctx = createMockContext({
        isMod: false,
        message: COMMAND,
      })

      expect(handler.execute(ctx)).rejects.toThrow(CommandErrorCode.NOT_A_MOD)
    })
  })
})
