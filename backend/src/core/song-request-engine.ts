import { IBackupPlaylistManager } from "@/core/backup-playlist-manager"
import { IPlaybackManager, PlaybackManager } from "@/core/playback-manager"
import { ISongQueue, SongQueue } from "@/core/song-queue"
import { IVoteManager, VoteManager } from "@/core/vote-manager"
import { logger } from "@/helpers/logger"

export class SongRequestEngine {
  private readonly songQueue: ISongQueue
  private readonly voteManager: IVoteManager
  private readonly playbackManager: IPlaybackManager
  private backupPlaylistManager: IBackupPlaylistManager | null = null

  constructor(songQueue: ISongQueue, voteManager: IVoteManager, playbackManager: IPlaybackManager) {
    this.songQueue = songQueue
    this.voteManager = voteManager
    this.playbackManager = playbackManager
  }

  public setBackupPlaylistManager(manager: IBackupPlaylistManager) {
    this.backupPlaylistManager = manager
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

  public getBackupPlaylistManager(): IBackupPlaylistManager {
    if (!this.backupPlaylistManager) {
      throw new Error("BackupPlaylistManager not set")
    }
    return this.backupPlaylistManager
  }

  public setupEventListeners() {
    this.songQueue.on("song-queued", (item) => {
      logger.info(`[QUEUE] [ADDED] [${item.title}] by [${item.username}]`)

      const isAddedToEmptyQueue = this.songQueue.getQueue().length === 1

      if (isAddedToEmptyQueue) {
        this.playbackManager.setSong(item.id, item.duration)
        this.playbackManager.play()
        return
      }
    })

    this.songQueue.on("song-remove-current", async (item) => {
      try {
        logger.info(`[QUEUE] [REMOVED] [${item.title}] by [${item.username}]`)
        const nextSong = this.songQueue.getCurrent()
        const isPlaying = this.playbackManager.getIsPlaying()
        this.voteManager.reset()

        if (nextSong) {
          this.playbackManager.setSong(nextSong.id, nextSong.duration)

          if (isPlaying) {
            this.playbackManager.playNextSongWithDelay()
          }
          return
        }

        if (this.backupPlaylistManager) {
          const added = await this.backupPlaylistManager.addSongToQueue(this.songQueue)
          if (added) return
        }

        this.playbackManager.stop()
      } catch (error) {
        logger.error(error, `[QUEUE] Error handling song-remove-current for [${item?.title}]`)
      }
    })

    this.songQueue.on("clear-queue", async () => {
      logger.info("[QUEUE] Queue cleared")
      this.voteManager.reset()

      if (this.backupPlaylistManager) {
        const added = await this.backupPlaylistManager.addSongToQueue(this.songQueue)
        if (added) return
      }

      this.playbackManager.stop()
    })

    this.playbackManager.on("song-ended", async () => {
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
