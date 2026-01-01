import { describe, test, expect } from "bun:test"

import { HelpCommandHandler } from "@/commands/help-command-handler"
import { createMockContext } from "@/commands/__tests__/helpers/create-mock-context"

describe("HelpCommandHandler", () => {
  const handler = new HelpCommandHandler()

  describe("canHandle", () => {
    test("matches !help (case insensitive)", () => {
      expect(handler.canHandle("!help")).toBe(true)
      expect(handler.canHandle("!HELP")).toBe(true)
      expect(handler.canHandle("!HeLp")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("!hel")).toBe(false)
      expect(handler.canHandle("help")).toBe(false)
      expect(handler.canHandle("!help me")).toBe(false)
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
