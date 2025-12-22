import { CommandHandler, ExecuteParams } from '@/commands/command'
import { RateLimitConfig } from '@/helpers/rate-limit'

export class VoteSkipCommandHandler extends CommandHandler {
  private readonly regex = /^!voteskip\s*$/i

  rateLimit: RateLimitConfig = {
    windowMs: 8000,
    max: 2,
  }

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText)
  }

  async execute({
    deps: { logger, songQueue, sendChatMessage, voteManager },
    payload,
  }: ExecuteParams) {
    const username = payload.event?.chatter_user_name
    if (!username) {
      throw new Error('Missing user information.')
    }

    if (songQueue.isEmpty()) {
      logger.info(`[COMMAND] [VOTESKIP] Queue is empty, skipping not possible.`)
      await sendChatMessage(`Kolejka jest pusta.`, payload.event?.message_id)
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
        `[VOTESKIP] [${votesCount}/${voteManager.getVotesNeeded()}] @${username} zagłosował za pominięciem utworu.`,
        payload.event?.message_id,
      )
      return
    }

    if (votesCount >= voteManager.getVotesNeeded()) {
      logger.info(`[COMMAND] [VOTESKIP] Vote skip passed with ${votesCount} votes. Skipping song.`)
      voteManager.reset()
      const skippedSong = songQueue.removeCurrent()
      if (skippedSong) {
        await sendChatMessage(
          `[VOTESKIP] [${votesCount}/${voteManager.getVotesNeeded()}] Pominięto utwór ${
            skippedSong.title
          } (dodany przez @${skippedSong.username}).`,
          payload.event?.message_id,
        )
      } else {
        await sendChatMessage(`Kolejka jest pusta.`, payload.event?.message_id)
      }
      return
    }
  }
}
