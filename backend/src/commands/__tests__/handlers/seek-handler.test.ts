import { describe, test, expect } from "bun:test"

import { createMockContext } from "@/commands/__tests__/helpers/create-mock-context"
import { SeekCommandHandler } from "@/commands/seek-command-handler"
import { PlaybackManager } from "@/core/playback-manager"
import { SongQueue } from "@/core/song-queue"
import { CommandErrorCode } from "@/types/errors"

describe("SeekCommandHandler", () => {
  const handler = new SeekCommandHandler()

  describe("canHandle", () => {
    test("matches !seek with seconds", () => {
      expect(handler.canHandle("!seek 30")).toBe(true)
      expect(handler.canHandle("!seek 0")).toBe(true)
      expect(handler.canHandle("!seek 120")).toBe(true)
    })

    test("matches !seek with mm:ss format", () => {
      expect(handler.canHandle("!seek 1:30")).toBe(true)
      expect(handler.canHandle("!seek 0:00")).toBe(true)
      expect(handler.canHandle("!seek 10:45")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("!seek")).toBe(false)
      expect(handler.canHandle("seek 30")).toBe(false)
      expect(handler.canHandle("!seek abc")).toBe(false)
      expect(handler.canHandle("!seek 1:60")).toBe(false)
    })
  })

  describe("execute", () => {
    test("seeks to specified seconds when user is mod", async () => {
      const playbackManager = new PlaybackManager()
      const queue = new SongQueue()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        isMod: true,
        message: "!seek 30",
        deps: { playbackManager, songQueue: queue },
      })

      await handler.execute(ctx)

      expect(playbackManager.getPlayTime()).toBe(30)
    })

    test("seeks to mm:ss format correctly", async () => {
      const playbackManager = new PlaybackManager()
      const queue = new SongQueue()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        isMod: true,
        message: "!seek 1:30",
        deps: { playbackManager, songQueue: queue },
      })

      await handler.execute(ctx)

      expect(playbackManager.getPlayTime()).toBe(90)
    })

    test("throws error if user is not a mod", async () => {
      const ctx = createMockContext({
        isMod: false,
        message: "!seek 30",
      })

      expect(handler.execute(ctx)).rejects.toThrow(CommandErrorCode.NOT_A_MOD)
    })

    test("sends error message if seek position exceeds song duration", async () => {
      const playbackManager = new PlaybackManager()
      const queue = new SongQueue()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        isMod: true,
        message: "!seek 999",
        deps: { playbackManager, songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
    })
  })
})
