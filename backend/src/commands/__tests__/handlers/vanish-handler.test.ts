import { describe, test, expect } from "bun:test"

import { createMockContext, createCommand } from "@/commands/__tests__/helpers/create-mock-context"
import { VanishCommandHandler } from "@/commands/vanish-command-handler"

const COMMAND = createCommand("vanish")

describe("VanishCommandHandler", () => {
  const handler = new VanishCommandHandler()

  describe("canHandle", () => {
    test("matches vanish command (case insensitive)", () => {
      expect(handler.canHandle("vanish")).toBe(true)
      expect(handler.canHandle("VANISH")).toBe(true)
      expect(handler.canHandle("Vanish")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("vanis")).toBe(false)
      expect(handler.canHandle("vanish me")).toBe(false)
    })
  })

  describe("execute", () => {
    test("times out the user when not a mod", async () => {
      const ctx = createMockContext({
        isMod: false,
        userId: "12345",
        message: COMMAND,
      })

      await handler.execute(ctx)

      expect(ctx.deps.timeoutUser).toHaveBeenCalledTimes(1)
      expect(ctx.deps.timeoutUser).toHaveBeenCalledWith({
        durationInSeconds: 3,
        userIdToTimeout: "12345",
        reason: "!vanish",
      })
    })

    test("does not timeout when user is a mod", async () => {
      const ctx = createMockContext({
        isMod: true,
        userId: "12345",
        message: COMMAND,
      })

      await handler.execute(ctx)

      expect(ctx.deps.timeoutUser).not.toHaveBeenCalled()
    })

    test("does nothing if userId is missing", async () => {
      const ctx = createMockContext({
        isMod: false,
        userId: "",
        message: COMMAND,
      })

      await handler.execute(ctx)

      expect(ctx.deps.timeoutUser).not.toHaveBeenCalled()
    })
  })
})
