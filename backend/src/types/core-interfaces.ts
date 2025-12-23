import type { QueuedItem } from '@/types/queue'

export interface IPlaybackManager {
  setSong(songId: string, duration: number): void
  getCurrentSongId(): string | null
  getVolume(): number
  getPlayTime(): number
  play(): void
  pause(): void
  setVolume(volume: number): void
  getStatus(): { isPlaying: boolean; volume: number; playTime: number }
  handleSongEnd(): void
  setSongQueue(queue: ISongQueue): void
}

export interface ISongQueue {
  getCurrent(): QueuedItem | null
  getDurationBeforePlayingCurrent(): number
  getDurationBeforePlayingNext(): number
  getQueue(): unknown[]
  readonly length: number
  isEmpty(): boolean
  add(input: unknown, metadata?: unknown): Promise<unknown>
  removeCurrent(): QueuedItem | null
  peekNext(): QueuedItem | null
  next(): QueuedItem | null
  removeSongById(id: string): boolean
  setPlaybackManager(manager: IPlaybackManager): void
  setVoteManager(manager: IVoteManager): void
}

export interface IVoteManager {
  addVote(username: string): number
  hasVoted(username: string): boolean
  getVotesNeeded(): number
  getCurrentCount(): number
  reset(): void
}
