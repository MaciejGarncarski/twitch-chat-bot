import { describe, test, expect } from "bun:test"

import { HelpCommandHandler } from "@/commands/help-command-handler"
import { createMockContext, createCommand } from "@/commands/__tests__/helpers/create-mock-context"

const COMMAND = createCommand("help")

describe("HelpCommandHandler", () => {
  const handler = new HelpCommandHandler()

  describe("canHandle", () => {
    test("matches help command (case insensitive)", () => {
      expect(handler.canHandle("help")).toBe(true)
      expect(handler.canHandle("HELP")).toBe(true)
      expect(handler.canHandle("HeLp")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("hel")).toBe(false)
      expect(handler.canHandle("help me")).toBe(false)
    })
  })

  describe("execute", () => {
    test("sends help message with available commands", async () => {
      const ctx = createMockContext()

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
    })
  })
})
