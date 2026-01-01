import { describe, test, expect } from "bun:test"

import { createMockContext } from "@/commands/__tests__/helpers/create-mock-context"
import { VolumeCommandHandler } from "@/commands/volume-command-handler"
import { PlaybackManager } from "@/core/playback-manager"
import { CommandErrorCode } from "@/types/errors"

describe("VolumeCommandHandler", () => {
  const handler = new VolumeCommandHandler()

  describe("canHandle", () => {
    test("matches !volume <0-100> (case insensitive)", () => {
      expect(handler.canHandle("!volume 10")).toBe(true)
      expect(handler.canHandle("!Volume 50")).toBe(true)
      expect(handler.canHandle("!VOLUME 100")).toBe(true)
      expect(handler.canHandle("!VOLUME 0")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("!vol")).toBe(false)
      expect(handler.canHandle("volume")).toBe(false)
      expect(handler.canHandle("!vol ume")).toBe(false)
      expect(handler.canHandle("!volume 999")).toBe(false)
      expect(handler.canHandle("!volume -100")).toBe(false)
      expect(handler.canHandle("!volume abcd")).toBe(false)
    })
  })

  describe("execute", () => {
    test("sends volume message with available commands", async () => {
      const playbackManager = new PlaybackManager()

      const ctx = createMockContext({
        isMod: true,
        message: "!volume 50",
        deps: {
          playbackManager: playbackManager,
        },
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith(
        "Ustawiono głośność na 50%.",
        ctx.messageId,
      )
      expect(playbackManager.getVolume()).toBe(50)
    })
  })

  test("execute throws error if user is not a mod", async () => {
    const ctx = createMockContext({
      isMod: false,
      message: "!volume 30",
    })

    expect(handler.execute(ctx)).rejects.toThrow(CommandErrorCode.NOT_A_MOD)
  })
})
