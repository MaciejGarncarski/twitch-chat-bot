import { CommandHandler, Deps } from "@/commands/command";
import { TwitchWSMessage } from "@/types/twitch-ws-message";

export class VoteSkipCommandHandler extends CommandHandler {
  private readonly regex = /^!voteskip\s*$/i;

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText);
  }

  async execute(
    parsedMessage: TwitchWSMessage,
    { songQueue, logger, sendChatMessage, voteManager }: Deps
  ) {
    const username = parsedMessage.payload.event?.chatter_user_name;
    if (!username) {
      throw new Error("Missing user information.");
    }

    if (songQueue.isEmpty()) {
      logger.info(
        `[COMMAND] [VOTESKIP] Queue is empty, skipping not possible.`
      );
      await sendChatMessage(
        `Kolejka jest pusta.`,
        parsedMessage.payload.event?.message_id
      );
      return;
    }

    if (voteManager.hasVoted(username)) {
      return;
    }
    voteManager.addVote(username);

    const votesCount = voteManager.getCurrentCount();
    const votesLeft = voteManager.getVotesNeeded() - votesCount;

    logger.info(
      `[COMMAND] [VOTESKIP] ${username} voted to skip. (${votesCount}/${voteManager.getVotesNeeded()})`
    );

    if (votesLeft > 0) {
      await sendChatMessage(
        `[VOTESKIP] [${votesCount}/${voteManager.getVotesNeeded()}] @${username} zagłosował za pominięciem utworu.`,
        parsedMessage.payload.event?.message_id
      );
      return;
    }

    if (votesCount >= voteManager.getVotesNeeded()) {
      logger.info(
        `[COMMAND] [VOTESKIP] Vote skip passed with ${votesCount} votes. Skipping song.`
      );
      voteManager.reset();
      const skippedSong = songQueue.removeCurrent();
      if (skippedSong) {
        await sendChatMessage(
          `[VOTESKIP] [${votesCount}/${voteManager.getVotesNeeded()}] Pominięto utwór ${
            skippedSong.title
          } (dodany przez @${skippedSong.username}).`,
          parsedMessage.payload.event?.message_id
        );
      } else {
        await sendChatMessage(
          `Kolejka jest pusta.`,
          parsedMessage.payload.event?.message_id
        );
      }
      return;
    }
  }
}
