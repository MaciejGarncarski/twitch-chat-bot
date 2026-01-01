import { CommandContext, CommandHandler } from "@/commands/command"
import { IPlaybackManager } from "@/core/playback-manager"
import { ISongQueue } from "@/core/song-queue"
import { IVoteManager } from "@/core/vote-manager"
import { TwitchMessagePayload } from "@/types/twitch-ws-message"
import { describe, test, expect, mock } from "bun:test"
import { Logger } from "pino"

describe("command", () => {
  test("should throw not implemented error", async () => {
    class TestCommand extends CommandHandler {}

    const command = new TestCommand()

    expect(() => command.canHandle("test")).toThrowError(
      new Error("Method canHandle has not been implemented."),
    )

    const mockCtx: CommandContext = {
      payload: {} as TwitchMessagePayload,
      deps: {
        songQueue: {} as ISongQueue,
        voteManager: {} as IVoteManager,
        logger: {} as Logger,
        playbackManager: {} as IPlaybackManager,
        timeoutUser: mock(() => Promise.resolve()),
        sendChatMessage: mock(() => Promise.resolve()),
      },
      messageId: undefined,
      userId: undefined,
      username: "testuser",
      sanitizedMessage: "testmessage",
      isMod: false,
    }

    await expect(command.execute(mockCtx)).rejects.toThrowError(
      new Error("Method execute has not been implemented."),
    )
  })
})
