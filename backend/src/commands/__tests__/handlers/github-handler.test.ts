import { describe, test, expect } from "bun:test"

import { createMockContext } from "@/commands/__tests__/helpers/create-mock-context"
import { GithubCommandHandler } from "@/commands/github-command-handler"

const COMMAND = "!github"

describe("GitHubCommandHandler", () => {
  const handler = new GithubCommandHandler()

  describe("canHandle", () => {
    test("matches !github (case insensitive)", () => {
      expect(handler.canHandle("!github")).toBe(true)
      expect(handler.canHandle("!GITHUB")).toBe(true)
      expect(handler.canHandle("!GitHub")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("!gh")).toBe(false)
      expect(handler.canHandle("github")).toBe(false)
      expect(handler.canHandle("!git hub")).toBe(false)
    })
  })

  describe("execute", () => {
    test("sends repo link message with available commands", async () => {
      const ctx = createMockContext()
      await handler.execute(ctx)
      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
    })
  })
})
