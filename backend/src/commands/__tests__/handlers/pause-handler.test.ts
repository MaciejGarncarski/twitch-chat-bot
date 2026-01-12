import { describe, test, expect } from "bun:test"

import { createMockContext, createCommand } from "@/commands/__tests__/helpers/create-mock-context"
import { PauseCommandHandler } from "@/commands/pause-command-handler"
import { PlaybackManager } from "@/core/playback-manager"
import { CommandErrorCode } from "@/types/command-errors"

const COMMAND = createCommand("pause")

describe("PauseCommandHandler", () => {
  const handler = new PauseCommandHandler()

  describe("canHandle", () => {
    test("matches pause command (case insensitive)", () => {
      expect(handler.canHandle("pause")).toBe(true)
      expect(handler.canHandle("PAUSE")).toBe(true)
      expect(handler.canHandle("Pause")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("paus")).toBe(false)
      expect(handler.canHandle("pause now")).toBe(false)
    })
  })

  describe("execute", () => {
    test("pauses playback when user is mod", async () => {
      const playbackManager = new PlaybackManager()

      const ctx = createMockContext({
        isMod: true,
        message: COMMAND,
        deps: { playbackManager },
      })

      await handler.execute(ctx)

      expect(playbackManager.getIsPlaying()).toBe(false)
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
