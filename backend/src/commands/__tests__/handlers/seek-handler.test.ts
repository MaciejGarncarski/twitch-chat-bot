import { describe, test, expect } from "bun:test"

import { createMockContext, createCommand } from "@/commands/__tests__/helpers/create-mock-context"
import { SeekCommandHandler } from "@/commands/seek-command-handler"
import { PlaybackManager } from "@/core/playback-manager"
import { SongQueue } from "@/core/song-queue"
import { CommandErrorCode } from "@/types/command-errors"

const COMMAND_SECONDS = createCommand("seek 30")
const COMMAND_TIME = createCommand("seek 1:30")

describe("SeekCommandHandler", () => {
  const handler = new SeekCommandHandler()

  describe("canHandle", () => {
    test("matches seek command with seconds (case insensitive)", () => {
      expect(handler.canHandle("seek 30")).toBe(true)
      expect(handler.canHandle("SEEK 30")).toBe(true)
      expect(handler.canHandle("Seek 0")).toBe(true)
      expect(handler.canHandle("seek 120")).toBe(true)
    })

    test("matches seek command with mm:ss format (case insensitive)", () => {
      expect(handler.canHandle("seek 1:30")).toBe(true)
      expect(handler.canHandle("SEEK 1:30")).toBe(true)
      expect(handler.canHandle("Seek 0:00")).toBe(true)
      expect(handler.canHandle("seek 10:45")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("seek")).toBe(false)
      expect(handler.canHandle("seek abc")).toBe(false)
      expect(handler.canHandle("seek 1:60")).toBe(false)
    })
  })

  describe("execute", () => {
    test("seeks to specified seconds when user is mod", async () => {
      const playbackManager = new PlaybackManager()
      const queue = new SongQueue()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        isMod: true,
        message: COMMAND_SECONDS,
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
        message: COMMAND_TIME,
        deps: { playbackManager, songQueue: queue },
      })

      await handler.execute(ctx)

      expect(playbackManager.getPlayTime()).toBe(90)
    })

    test("throws error if user is not a mod", async () => {
      const ctx = createMockContext({
        isMod: false,
        message: COMMAND_SECONDS,
      })

      expect(handler.execute(ctx)).rejects.toThrow(CommandErrorCode.NOT_A_MOD)
    })

    test("sends error message if seek position exceeds song duration", async () => {
      const playbackManager = new PlaybackManager()
      const queue = new SongQueue()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        isMod: true,
        message: createCommand("seek 999"),
        deps: { playbackManager, songQueue: queue },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
    })
  })
})
