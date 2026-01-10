import { describe, test, expect } from "bun:test"

import { createMockContext, createCommand } from "@/commands/__tests__/helpers/create-mock-context"
import { FrontendCommandHandler } from "@/commands/frontend-command-handler"

const COMMAND = createCommand("ui")

describe("FrontendCommandHandler", () => {
  const handler = new FrontendCommandHandler()

  describe("canHandle", () => {
    test("matches frontend command (case insensitive)", () => {
      expect(handler.canHandle("ui")).toBe(true)
      expect(handler.canHandle("UI")).toBe(true)
      expect(handler.canHandle("Ui")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("ul")).toBe(false)
      expect(handler.canHandle("backend")).toBe(false)
      expect(handler.canHandle("u l")).toBe(false)
    })
  })

  describe("execute", () => {
    test("sends frontend UI link message with available commands", async () => {
      const ctx = createMockContext()
      await handler.execute(ctx)
      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith(
        "UI: https://bot.maciej-garncarski.pl/",
        ctx.messageId,
      )
      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
    })
  })
})
