import { EventEmitter } from 'node:events'

import { getBunServer } from '@/helpers/init-ws'
import { logger } from '@/helpers/logger'
import { playbackStatusWSSchema } from '@/types/playback-status-ws'

export interface IPlaybackManager extends EventEmitter {
  play(): void
  pause(): void
  stop(): void
  setSong(songId: string | null, duration: number): void
  getPlayTime(): number
  getVolume(): number
  setVolume(volume: number): void
  seek(seekSeconds: number): void
  getIsPlaying(): boolean

  on(event: 'song-ended', listener: () => void): this
}

export class PlaybackManager extends EventEmitter implements IPlaybackManager {
  private isPlaying: boolean = false
  private volume: number = 20
  private playTime: number = 0
  private startedAt: number | null = null
  private intervalId: NodeJS.Timeout | null = null
  private songId: string | null = null
  private currentSongDuration: number = 0

  constructor() {
    super()
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
      this.emit('song-ended')
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

  public setSong(songId: string | null, duration: number) {
    this.songId = songId
    this.currentSongDuration = duration
    this.playTime = 0
    if (this.isPlaying) {
      this.startedAt = Date.now()
    }
  }

  public getPlayTime() {
    if (!this.isPlaying || this.startedAt === null) return this.playTime
    return Math.floor((Date.now() - this.startedAt) / 1000)
  }

  public play() {
    if (this.isPlaying) return

    this.isPlaying = true
    this.startedAt = Date.now() - this.playTime * 1000
    this.broadcastStatus()
  }

  public pause() {
    if (!this.isPlaying) return

    this.playTime = this.getPlayTime()
    this.isPlaying = false
    this.startedAt = null
    this.broadcastStatus()
  }

  public seek(seekSeconds: number) {
    this.playTime = seekSeconds
    if (this.isPlaying) {
      this.startedAt = Date.now() - this.playTime * 1000
    }
    this.broadcastStatus()
  }

  public getIsPlaying(): boolean {
    return this.isPlaying
  }

  public getVolume(): number {
    return this.volume
  }

  public setVolume(volume: number) {
    this.volume = Math.min(Math.max(volume, 0), 100)
  }

  public stop() {
    this.isPlaying = false
    this.playTime = 0
    this.startedAt = null
    this.songId = null
    this.broadcastStatus()
  }
}
