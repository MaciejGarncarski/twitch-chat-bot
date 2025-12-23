import { IPlaybackManager, PlaybackManager } from '@/core/playback-manager'
import { ISongQueue, SongQueue } from '@/core/song-queue'
import { VoteManager } from '@/core/vote-manager'
import { logger } from '@/helpers/logger'

export class SongRequestEngine {
  private readonly songQueue: ISongQueue
  private readonly voteManager: VoteManager
  private readonly playbackManager: IPlaybackManager

  constructor(songQueue: SongQueue, voteManager: VoteManager, playbackManager: PlaybackManager) {
    this.songQueue = songQueue
    this.voteManager = voteManager
    this.playbackManager = playbackManager
  }

  public getSongQueue() {
    return this.songQueue
  }

  public getVoteManager() {
    return this.voteManager
  }

  public getPlaybackManager() {
    return this.playbackManager
  }

  public setupEventListeners() {
    this.songQueue.on('song-queued', (item) => {
      logger.info(`[QUEUE] [ADDED] [${item.title}] by [${item.username}]`)

      const isAddedToEmptyQueue = this.songQueue.getQueue().length === 1

      if (isAddedToEmptyQueue) {
        this.playbackManager.setSong(item.id, item.duration)
        this.playbackManager.play()
        return
      }
    })

    this.songQueue.on('song-remove-current', (item) => {
      logger.info(`[QUEUE] [REMOVED] [${item.title}] by [${item.username}]`)
      const nextSong = this.songQueue.getCurrent()
      this.voteManager.reset()

      if (nextSong) {
        this.playbackManager.setSong(nextSong.id, nextSong.duration)
        this.playbackManager.play()
        return
      }

      this.playbackManager.stop()
    })

    this.playbackManager.on('song-ended', () => {
      const removed = this.songQueue.removeCurrent()
      if (removed) {
        logger.info(`[PLAYBACK] [${removed.title}] Song finished playing`)
      }
    })
  }
}

export const songRequestEngine = new SongRequestEngine(
  new SongQueue(),
  new VoteManager(),
  new PlaybackManager(),
)
