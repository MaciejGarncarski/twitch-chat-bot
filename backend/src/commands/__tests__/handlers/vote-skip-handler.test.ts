import { describe, test, expect } from "bun:test"

import { createMockContext, createCommand } from "@/commands/__tests__/helpers/create-mock-context"
import { VoteSkipCommandHandler } from "@/commands/vote-skip-command-handler"
import { SongQueue } from "@/core/song-queue"
import { MAX_VOTES, VoteManager } from "@/core/vote-manager"

const COMMAND = createCommand("voteskip")

describe("VoteSkipCommandHandler", () => {
  const handler = new VoteSkipCommandHandler()

  describe("canHandle", () => {
    test("matches voteskip command (case insensitive)", () => {
      expect(handler.canHandle("voteskip")).toBe(true)
      expect(handler.canHandle("VOTESKIP")).toBe(true)
      expect(handler.canHandle("VoteSkip")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("vote")).toBe(false)
      expect(handler.canHandle("voteskip now")).toBe(false)
    })
  })

  describe("execute", () => {
    test("adds vote and shows progress", async () => {
      const queue = new SongQueue()
      const voteManager = new VoteManager()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        username: "voter1",
        message: createCommand("voteskip"),
        deps: { songQueue: queue, voteManager },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
      expect(voteManager.getCurrentCount()).toBe(1)
    })

    test("does not count duplicate votes from same user", async () => {
      const queue = new SongQueue()
      const voteManager = new VoteManager()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        username: "voter1",
        message: COMMAND,
        deps: { songQueue: queue, voteManager },
      })

      await handler.execute(ctx)
      await handler.execute(ctx)

      expect(voteManager.getCurrentCount()).toBe(1)
    })

    test("skips song when vote threshold is reached", async () => {
      const queue = new SongQueue()
      const voteManager = new VoteManager()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })
      await queue.add({ username: "user2", videoId: "sk3rpYkiHe8" })

      const contexts = Array.from({ length: MAX_VOTES }, (_, i) =>
        createMockContext({
          username: `voter${i + 1}`,
          message: COMMAND,
          deps: { songQueue: queue, voteManager },
        }),
      )

      for (const ctx of contexts) {
        await handler.execute(ctx)
      }

      expect(queue.getCurrent()?.id).toBe("sk3rpYkiHe8")
      expect(voteManager.getCurrentCount()).toBe(0) // reset after skip
    })

    test("sends message when queue is empty", async () => {
      const queue = new SongQueue()
      const voteManager = new VoteManager()

      const ctx = createMockContext({
        message: COMMAND,
        deps: { songQueue: queue, voteManager },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith("Kolejka jest pusta.", ctx.messageId)
    })
  })
})
