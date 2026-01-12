import { EventEmitter } from "node:events"

import { getBunServer } from "@/helpers/init-ws"
import { logger } from "@/helpers/logger"
import { PlaybackStatusWS } from "@/types/playback-status-ws"

export interface IPlaybackManager extends EventEmitter {
  play(): void
  playNextSongWithDelay(): Promise<void>
  pause(): void
  stop(): void
  setSong(songId: string | null, duration: number): void
  getPlayTime(): number
  getVolume(): number
  setVolume(volume: number): void
  seek(seekSeconds: number): void
  getIsPlaying(): boolean
  getIsLoopEnabled(): boolean
  toggleLoopEnabled(): boolean
  mute(): void
  unmute(): void

  on(event: "song-ended", listener: () => void): this
}

export class PlaybackManager extends EventEmitter implements IPlaybackManager {
  private isPlaying: boolean = false
  private volume = 20
  private playTime = 0
  private startedAt: number | null = null
  private intervalId: NodeJS.Timeout | null = null
  private songId: string | null = null
  private currentSongDuration = 0
  private isLoopEnabled = false
  private volumeBeforeMute: number = 20

  constructor() {
    super()
    this.startHeartbeat()
  }

  private broadcastStatus() {
    const bunInstance = getBunServer()

    if (!bunInstance) {
      logger.warn("[PLAYBACK] Bun instance not initialized")
      return
    }

    const currentPlayTime = this.getPlayTime()

    if (
      this.isPlaying &&
      this.currentSongDuration > 0 &&
      currentPlayTime >= this.currentSongDuration
    ) {
      if (this.isLoopEnabled) {
        this.seek(0)
        return
      }

      this.emit("song-ended")
      return
    }

    const playbackStatus: PlaybackStatusWS = {
      isPlaying: this.isPlaying,
      volume: this.volume,
      songId: this.songId,
      playTime: this.isPlaying ? currentPlayTime : this.playTime,
      startedAt: this.startedAt,
      isLoopEnabled: this.isLoopEnabled,
      serverTime: Date.now(),
    }

    bunInstance.publish("playback-status", JSON.stringify(playbackStatus))
  }

  private startHeartbeat() {
    if (this.intervalId) clearInterval(this.intervalId)
    this.intervalId = setInterval(() => this.broadcastStatus(), 1000)
  }

  public setSong(songId: string | null, duration: number) {
    this.songId = songId
    this.currentSongDuration = duration
    this.playTime = 0
  }

  public getPlayTime() {
    if (!this.isPlaying || this.startedAt === null) return this.playTime
    return Math.floor((Date.now() - this.startedAt) / 1000)
  }

  public async playNextSongWithDelay() {
    this.isPlaying = false
    this.playTime = 0
    this.startedAt = null
    this.broadcastStatus()

    await new Promise((resolve) => setTimeout(resolve, 2000))

    this.isPlaying = true
    this.startedAt = Date.now()
    this.broadcastStatus()
  }

  public play() {
    this.startedAt = Date.now()
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
    this.broadcastStatus()
  }

  public mute() {
    if (this.volume === 0) return
    this.volumeBeforeMute = this.volume
    this.setVolume(0)
  }

  public unmute() {
    if (this.volume !== 0) return
    this.setVolume(this.volumeBeforeMute)
  }

  public toggleLoopEnabled() {
    this.isLoopEnabled = !this.isLoopEnabled
    this.broadcastStatus()

    return this.isLoopEnabled
  }

  public getIsLoopEnabled(): boolean {
    return this.isLoopEnabled
  }

  public stop() {
    this.isPlaying = false
    this.playTime = 0
    this.startedAt = null
    this.songId = null
    this.broadcastStatus()
  }
}
