import { getBunServer } from '@/helpers/init-ws'
import { logger } from '@/helpers/logger'
import type { ISongQueue } from '@/types/core-interfaces'

export class PlaybackManager {
  private isPlaying: boolean = false
  private volume: number = 20
  private playTime: number = 0
  private startedAt: number | null = null
  private intervalId: NodeJS.Timeout | null = null
  private songId: string | null = null
  private currentSongDuration: number = 0
  private songQueue: ISongQueue | null = null

  public setSongQueue(queue: ISongQueue) {
    this.songQueue = queue
  }

  public setSong(songId: string, duration: number) {
    this.songId = songId
    this.currentSongDuration = duration
    this.playTime = 0
    this.startedAt = Date.now() - this.playTime * 1000
  }

  public getCurrentSongId() {
    return this.songId
  }

  public getVolume() {
    return this.volume
  }

  getPlayTime() {
    if (!this.isPlaying || this.startedAt === null) return this.playTime
    return Math.floor((Date.now() - this.startedAt) / 1000)
  }

  play() {
    if (this.isPlaying) return

    this.isPlaying = true
    this.startedAt = Date.now() - this.playTime * 1000

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    this.intervalId = setInterval(async () => {
      const currentPlayTime = this.getPlayTime()

      if (this.currentSongDuration > 0 && currentPlayTime >= this.currentSongDuration) {
        this.handleSongEnd()
        return
      }

      const bunInstance = getBunServer()
      if (!bunInstance) return

      bunInstance.publish(
        'playback-status',
        JSON.stringify({
          isPlaying: this.isPlaying,
          volume: this.volume,
          songId: this.songId,
          playTime: currentPlayTime,
          startedAt: this.startedAt,
          serverTime: Date.now(),
        }),
      )
    }, 1000)
  }
  pause() {
    if (this.isPlaying && this.startedAt !== null) {
      this.playTime = this.getPlayTime()
    }

    this.isPlaying = false

    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    this.intervalId = setInterval(async () => {
      const currentPlayTime = this.getPlayTime()

      if (
        this.currentSongDuration > 0 &&
        currentPlayTime >= this.currentSongDuration &&
        this.songQueue &&
        this.songQueue.length > 0
      ) {
        this.handleSongEnd()
        return
      }

      const bunInstance = getBunServer()
      if (!bunInstance) return

      bunInstance.publish(
        'playback-status',
        JSON.stringify({
          isPlaying: this.isPlaying,
          volume: this.volume,
          songId: this.songId,
          playTime: this.playTime,
          startedAt: null,
          serverTime: Date.now(),
        }),
      )
    }, 1000)

    this.startedAt = null
  }

  setVolume(volume: number) {
    if (volume < 0 || volume > 100) {
      throw new Error('Volume must be between 0 and 100')
    }
    this.volume = volume
  }

  getStatus() {
    return {
      isPlaying: this.isPlaying,
      volume: this.volume,
      playTime: this.playTime,
    }
  }

  handleSongEnd() {
    logger.info('[PLAYBACK] Current song finished playing.')

    const nextSong = this.songQueue?.next()
    const bunInstance = getBunServer()

    if (nextSong) {
      logger.info(`[PLAYBACK] Next song starting: ${nextSong.title}`)

      if (bunInstance) {
        bunInstance.publish(
          'playback-status',
          JSON.stringify({
            isPlaying: true,
            volume: this.volume,
            songId: nextSong.id,
            playTime: 0,
            startedAt: Date.now(),
            serverTime: Date.now(),
          }),
        )
      }
      return
    }

    logger.info('[PLAYBACK] Queue is empty. Stopping playback.')
    this.pause()

    if (bunInstance) {
      bunInstance.publish('playback-status', JSON.stringify({ isPlaying: false, songId: null }))
    }
  }
}
