import { describe, test, expect } from "bun:test"

import { createMockContext } from "@/commands/__tests__/helpers/create-mock-context"
import { ClearAllCommandHandler } from "@/commands/clear-all-command-handler"
import { SongQueue } from "@/core/song-queue"
import { CommandErrorCode } from "@/types/errors"
import { RemoveCommandHandler } from "@/commands/remove-command-handler"

const COMMAND_BASE = "!remove"
const COMMAND = `${COMMAND_BASE} 1`

describe("RemoveCommandHandler", () => {
  const handler = new RemoveCommandHandler()

  describe("canHandle", () => {
    test("matches !remove (case insensitive)", () => {
      expect(handler.canHandle("!remove 1")).toBe(true)
      expect(handler.canHandle("!REMOVE 2")).toBe(true)
      expect(handler.canHandle("!Remove 3")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("!remowe")).toBe(false)
      expect(handler.canHandle("remove")).toBe(false)
      expect(handler.canHandle("!remove -1")).toBe(false)
      expect(handler.canHandle("!remove 999")).toBe(false)
      expect(handler.canHandle("!remove abc")).toBe(false)
    })
  })

  describe("execute", () => {
    test("removes a song from the queue", async () => {
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
      expect(queue.getQueue()[0].id).toBe("sk3rpYkiHe8")
      expect(queue.getQueue().length).toBe(1)
    })

    test("sends message if position is invalid", async () => {
      const queue = new SongQueue()

      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        deps: {
          songQueue: queue,
        },
        isMod: true,
        message: `${COMMAND_BASE} 5`,
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith("Nie ma utworu na pozycji 5.")
      expect(queue.getQueue().length).toBe(1)
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
