import { describe, test, expect } from "bun:test"

import { createMockContext, createCommand } from "@/commands/__tests__/helpers/create-mock-context"
import { NextInfoCommandHandler } from "@/commands/next-info-command-handler"
import { PlaybackManager } from "@/core/playback-manager"
import { SongQueue } from "@/core/song-queue"

const COMMAND = createCommand("next")

describe("NextInfoCommandHandler", () => {
  const handler = new NextInfoCommandHandler()

  describe("canHandle", () => {
    test("matches next command (case insensitive)", () => {
      expect(handler.canHandle("next")).toBe(true)
      expect(handler.canHandle("NEXT")).toBe(true)
      expect(handler.canHandle("Next")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("nex")).toBe(false)
      expect(handler.canHandle("next song")).toBe(false)
    })
  })

  describe("execute", () => {
    test("shows next song info", async () => {
      const queue = new SongQueue()
      const playbackManager = new PlaybackManager()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })
      await queue.add({ username: "user2", videoId: "sk3rpYkiHe8" })

      const ctx = createMockContext({
        message: COMMAND,
        deps: { songQueue: queue, playbackManager },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
      const callArgs = (ctx.deps.sendChatMessage as ReturnType<typeof import("bun:test").mock>).mock
        .calls[0]
      expect(callArgs[0]).toContain("Następny utwór:")
    })

    test("sends message when no current song is playing", async () => {
      const queue = new SongQueue()
      const playbackManager = new PlaybackManager()

      const ctx = createMockContext({
        message: COMMAND,
        deps: { songQueue: queue, playbackManager },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith(
        "Żaden utwór nie jest obecnie odtwarzany.",
        ctx.messageId,
      )
    })

    test("sends message when no next song in queue", async () => {
      const queue = new SongQueue()
      const playbackManager = new PlaybackManager()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        message: COMMAND,
        deps: { songQueue: queue, playbackManager },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith(
        "Brak następnego utworu.",
        ctx.messageId,
      )
    })
  })
})
