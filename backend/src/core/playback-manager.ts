import { getBunServer } from '@/helpers/init-ws'
import { logger } from '@/helpers/logger'
import type { ISongQueue } from '@/types/core-interfaces'
import { playbackStatusWSSchema } from '@/types/playback-status-ws'

export class PlaybackManager {
  private isPlaying: boolean = false
  private volume: number = 20
  private playTime: number = 0
  private startedAt: number | null = null
  private intervalId: NodeJS.Timeout | null = null
  private songId: string | null = null
  private currentSongDuration: number = 0
  private songQueue: ISongQueue | null = null

  constructor() {
    this.startHeartbeat()
  }

  private broadcastStatus() {
    const bunInstance = getBunServer()
    if (!bunInstance) return

    const currentPlayTime = this.getPlayTime()

    if (
      this.isPlaying &&
      this.currentSongDuration > 0 &&
      currentPlayTime >= this.currentSongDuration
    ) {
      this.handleSongEnd()
      return
    }

    const playbackStatus = {
      isPlaying: this.isPlaying,
      volume: this.volume,
      songId: this.songId,
      playTime: this.isPlaying ? currentPlayTime : this.playTime,
      startedAt: this.startedAt,
      serverTime: Date.now(),
    }

    const parsedStatus = playbackStatusWSSchema.safeParse(playbackStatus)

    if (!parsedStatus.success) {
      logger.error('[PLAYBACK] Invalid playback status')
      return
    }

    bunInstance.publish('playback-status', JSON.stringify(parsedStatus.data))
  }

  private startHeartbeat() {
    if (this.intervalId) clearInterval(this.intervalId)
    this.intervalId = setInterval(() => this.broadcastStatus(), 1000)
  }

  public setSongQueue(queue: ISongQueue) {
    this.songQueue = queue
  }

  public setSong(songId: string, duration: number) {
    this.songId = songId
    this.currentSongDuration = duration
    this.playTime = 0
    if (this.isPlaying) {
      this.startedAt = Date.now()
    }
  }

  getPlayTime() {
    if (!this.isPlaying || this.startedAt === null) return this.playTime
    return Math.floor((Date.now() - this.startedAt) / 1000)
  }

  play() {
    if (this.isPlaying) return

    this.isPlaying = true
    this.startedAt = Date.now() - this.playTime * 1000
    this.broadcastStatus()
  }

  pause() {
    if (!this.isPlaying) return

    this.playTime = this.getPlayTime()
    this.isPlaying = false
    this.startedAt = null
    this.broadcastStatus()
  }

  setVolume(volume: number) {
    this.volume = Math.min(Math.max(volume, 0), 100)
  }

  handleSongEnd() {
    logger.info('[PLAYBACK] Current song finished.')
    const nextSong = this.songQueue?.next()

    if (nextSong) {
      this.setSong(nextSong.id, nextSong.duration)
      this.play()
    } else {
      this.stop()
    }
  }

  stop() {
    this.isPlaying = false
    this.playTime = 0
    this.startedAt = null
    this.songId = null
    this.broadcastStatus()
  }
}
