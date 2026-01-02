import { describe, test, expect } from "bun:test"

import { createMockContext } from "@/commands/__tests__/helpers/create-mock-context"
import { QueueCommandHandler } from "@/commands/queue-command-handler"
import { SongQueue } from "@/core/song-queue"

const COMMAND = "!queue"

describe("QueueCommandHandler", () => {
  const handler = new QueueCommandHandler()

  describe("canHandle", () => {
    test("matches !queue (case insensitive)", () => {
      expect(handler.canHandle("!queue")).toBe(true)
      expect(handler.canHandle("!QUEUE")).toBe(true)
      expect(handler.canHandle("!Queue")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("!queu")).toBe(false)
      expect(handler.canHandle("queue")).toBe(false)
      expect(handler.canHandle("!queue list")).toBe(false)
    })
  })

  describe("execute", () => {
    test("sends queue list with songs", async () => {
      const queue = new SongQueue()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })
      await queue.add({ username: "user2", videoId: "sk3rpYkiHe8" })

      const ctx = createMockContext({
        message: COMMAND,
        deps: { songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
      const callArgs = (ctx.deps.sendChatMessage as ReturnType<typeof import("bun:test").mock>).mock
        .calls[0]
      expect(callArgs[0]).toContain("Aktualna kolejka:")
      expect(callArgs[0]).toContain("@user1")
      expect(callArgs[0]).toContain("@user2")
    })

    test("sends empty queue message when queue is empty", async () => {
      const queue = new SongQueue()

      const ctx = createMockContext({
        message: COMMAND,
        deps: { songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith("Kolejka jest pusta.", ctx.messageId)
    })
  })
})
