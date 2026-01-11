import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { t } from "@/i18n/i18n"

export class VoteSkipCommandHandler extends CommandHandler {
  private readonly command = "voteskip"

  rateLimit: RateLimitConfig = {
    windowMs: 8000,
    max: 2,
  }

  canHandle(command: string): boolean {
    return command.toLowerCase() === this.command
  }

  async execute({
    deps: { logger, songQueue, sendChatMessage, voteManager },
    messageId,
    username,
  }: CommandContext) {
    if (songQueue.isEmpty()) {
      logger.info(`[COMMAND] [VOTESKIP] Queue is empty, skipping not possible.`)
      await sendChatMessage(t("commands.errors.queueEmpty"), messageId)
      return
    }

    if (voteManager.hasVoted(username)) {
      return
    }
    voteManager.addVote(username)

    const votesCount = voteManager.getCurrentCount()
    const votesLeft = voteManager.getVotesNeeded() - votesCount

    logger.info(
      `[COMMAND] [VOTESKIP] ${username} voted to skip. (${votesCount}/${voteManager.getVotesNeeded()})`,
    )

    if (votesLeft > 0) {
      await sendChatMessage(
        t("commands.voteskip.voteReceived", {
          votes: votesCount,
          needed: voteManager.getVotesNeeded(),
          username,
        }),
        messageId,
      )
      return
    }

    logger.info(`[COMMAND] [VOTESKIP] Vote skip passed with ${votesCount} votes. Skipping song.`)
    const skippedSong = songQueue.removeCurrent()
    voteManager.reset()

    if (skippedSong) {
      await sendChatMessage(
        t("commands.voteskip.skipped", {
          votes: votesCount,
          needed: voteManager.getVotesNeeded(),
          title: skippedSong.title,
          username: skippedSong.username,
        }),
        messageId,
      )
      return
    }

    await sendChatMessage(t("commands.errors.queueEmpty"), messageId)
  }
}
