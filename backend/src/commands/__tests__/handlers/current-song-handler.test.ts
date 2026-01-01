import { describe, test, expect } from "bun:test"

import { createMockContext } from "@/commands/__tests__/helpers/create-mock-context"
import { SongQueue } from "@/core/song-queue"
import { CurrentSongCommandHandler } from "@/commands/current-song-command-handler"

describe("CurrentSongCommandHandler", () => {
  const handler = new CurrentSongCommandHandler()

  describe("canHandle", () => {
    test("matches !song (case insensitive)", () => {
      expect(handler.canHandle("!song")).toBe(true)
      expect(handler.canHandle("!SoNg")).toBe(true)
      expect(handler.canHandle("!SONG")).toBe(true)
    })

    test("rejects invalid commands", () => {
      expect(handler.canHandle("!cs")).toBe(false)
      expect(handler.canHandle("song")).toBe(false)
      expect(handler.canHandle("!songs")).toBe(false)
    })
  })

  describe("execute", () => {
    test("sends info about the current song", async () => {
      const queue = new SongQueue()

      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" })

      const ctx = createMockContext({
        deps: {
          songQueue: queue,
        },
        message: "!currentsong",
      })

      await handler.execute(ctx)

      expect(ctx.deps.sendChatMessage).toHaveBeenCalledTimes(1)
      expect(ctx.deps.sendChatMessage).toHaveBeenCalledWith(
        "Aktualny utwór to Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster) (dodany przez @user1). Pozostało do końca: 3:33.",
        ctx.messageId,
      )
    })
  })
})
