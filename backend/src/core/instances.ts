import { PlaybackManager } from '@/core/playback-manager'
import { SongQueue } from '@/core/song-queue'
import { VoteManager } from '@/core/vote-manager'

export const voteManager = new VoteManager()
export const playbackManager = new PlaybackManager()
export const songQueue = new SongQueue()

playbackManager.setSongQueue(songQueue)
songQueue.setPlaybackManager(playbackManager)
songQueue.setVoteManager(voteManager)
