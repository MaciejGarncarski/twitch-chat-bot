import { describe, test, expect } from "bun:test"

import { createMockContext } from "@/commands/__tests__/helpers/create-mock-context"
import { PlayCommandHandler } from "@/commands/play-command-handler"
import { PlaybackManager } from "@/core/playback-manager"
import { CommandErrorCode } from "@/types/errors"

const COMMAND = "!play"

describe("PlayCommandHandler", () => {
  const handler = new PlayCommandHandler()

  describe("canHandle", () => {
    test("matches !play (case insensitive)", () => {
      expect(handler.canHandle("!play")).toBe(true)
      expect(handler.canHandle("!PLAY")).toBe(true)
      expect(handler.canHandle("!Play")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("!pla")).toBe(false)
      expect(handler.canHandle("play")).toBe(false)
      expect(handler.canHandle("!play now")).toBe(false)
    })
  })

  describe("execute", () => {
    test("starts playback when user is mod", async () => {
      const playbackManager = new PlaybackManager()

      const ctx = createMockContext({
        isMod: true,
        message: COMMAND,
        deps: { playbackManager },
      })

      await handler.execute(ctx)

      expect(playbackManager.getIsPlaying()).toBe(true)
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
