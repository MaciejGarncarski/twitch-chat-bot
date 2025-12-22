export class VoteManager {
  private votes: Set<string> = new Set()
  private readonly votesNeeded = 2

  addVote(username: string): number {
    this.votes.add(username)
    return this.votes.size
  }

  hasVoted(username: string): boolean {
    return this.votes.has(username)
  }

  getVotesNeeded(): number {
    return this.votesNeeded
  }

  getCurrentCount(): number {
    return this.votes.size
  }

  reset(): void {
    this.votes.clear()
  }
}

export const voteManager = new VoteManager()
