import { describe, test, expect } from "bun:test"

import { createMockContext } from "@/commands/__tests__/helpers/create-mock-context"
import { SongQueue } from "@/core/song-queue"
import { CommandErrorCode } from "@/types/errors"
import { LoopToggleCommandHandler } from "@/commands/loop-toggle-command-handler"
import { PlaybackManager } from "@/core/playback-manager"

const COMMAND = "!loop"

describe("LoopToggleCommandHandler", () => {
  const handler = new LoopToggleCommandHandler()

  describe("canHandle", () => {
    test("matches !loop (case insensitive)", () => {
      expect(handler.canHandle("!loop")).toBe(true)
      expect(handler.canHandle("!LOOP")).toBe(true)
      expect(handler.canHandle("!Loop")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("!loopx")).toBe(false)
      expect(handler.canHandle("loop")).toBe(false)
      expect(handler.canHandle("!loop now")).toBe(false)
    })
  })

  describe("execute", () => {
    test("toggles loop when user is mod", async () => {
      const queue = new SongQueue()
      const playbackManager = new PlaybackManager()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        isMod: true,
        message: COMMAND,
        deps: { songQueue: queue, playbackManager },
      })

      const initialLoopState = ctx.deps.playbackManager.getIsLoopEnabled()

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
      expect(ctx.deps.playbackManager.getIsLoopEnabled()).toBe(!initialLoopState)
    })
    test("rejects when user is not mod", async () => {
      const queue = new SongQueue()
      const playbackManager = new PlaybackManager()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        isMod: false,
        message: COMMAND,
        deps: { songQueue: queue, playbackManager },
      })

      await expect(handler.execute(ctx)).rejects.toMatchObject({
        code: CommandErrorCode.NOT_A_MOD,
      })

      expect(ctx.deps.sendChatMessage).not.toHaveBeenCalled()
    })
  })
})
