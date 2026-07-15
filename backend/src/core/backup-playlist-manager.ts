import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { innertube } from "@/data/innertube"
import { shuffle } from "@/helpers/shuffle"
import { ISongQueue } from "@/core/song-queue"
import { logger } from "@/helpers/logger"

const BACKUP_LIMIT = 50
const DATA_DIR = join(process.cwd(), "data")
const CONFIG_PATH = join(DATA_DIR, "backup-playlist.json")
const BACKUP_USERNAME = "backup"

interface BackupPlaylistData {
  playlistId: string | null
  playlistUrl: string | null
  videoIds: string[]
  videos: BackupVideoInfo[]
  createdAt: string | null
}

export type BackupVideoInfo = {
  id: string
  title: string
  thumbnail: string | null
  duration: number
  author: string | null
}

export interface IBackupPlaylistManager {
  load(): void
  getStatus(): BackupPlaylistData & { remaining: number }
  getVideos(): Promise<BackupVideoInfo[]>
  setPlaylist(url: string): Promise<number>
  clear(): void
  reshuffle(): void
  refill(): Promise<number>
  addSongToQueue(songQueue: ISongQueue): Promise<boolean>
}

export class BackupPlaylistManager implements IBackupPlaylistManager {
  private readonly urlRegex = /[?&]list=([^#&?]+)/
  private data: BackupPlaylistData = {
    playlistId: null,
    playlistUrl: null,
    videoIds: [],
    videos: [],
    createdAt: null,
  }
  private index = 0
  private fetchMetadataPromise: Promise<void> | null = null

  public load() {
    try {
      if (!existsSync(CONFIG_PATH)) return
      const raw = readFileSync(CONFIG_PATH, "utf-8")
      const parsed = JSON.parse(raw) as BackupPlaylistData
      this.data = { ...parsed, videos: parsed.videos ?? [] }
      this.index = 0
      shuffle(this.data.videoIds)
      logger.info(`[BACKUP PLAYLIST] Loaded ${this.data.videoIds.length} songs from ${CONFIG_PATH}`)
    } catch (error) {
      logger.error(error, "[BACKUP PLAYLIST] Failed to load config")
    }
  }

  private save() {
    try {
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true })
      }
      writeFileSync(CONFIG_PATH, JSON.stringify(this.data, null, 2), "utf-8")
    } catch (error) {
      logger.error(error, "[BACKUP PLAYLIST] Failed to save config")
    }
  }

  public async setPlaylist(url: string): Promise<number> {
    const playlistId = this.extractPlaylistId(url)
    logger.info(`[BACKUP PLAYLIST] Extracted playlistId: ${playlistId} from url: ${url}`)
    if (!playlistId) {
      throw new Error("Invalid YouTube playlist URL")
    }

    const videoIds = await this.fetchVideoIds(playlistId)

    this.data = {
      playlistId,
      playlistUrl: url,
      videoIds,
      videos: [],
      createdAt: new Date().toISOString(),
    }
    this.index = 0

    this.save()
    logger.info(`[BACKUP PLAYLIST] Set playlist with ${videoIds.length} songs`)

    this.fetchVideoMetadata().catch(() => {})

    return videoIds.length
  }

  public getStatus(): BackupPlaylistData & { remaining: number } {
    return {
      ...this.data,
      remaining: Math.max(0, this.data.videoIds.length - this.index),
    }
  }

  public async getVideos(): Promise<BackupVideoInfo[]> {
    try {
      if (this.data.videos.length > 0) return this.data.videos

      if (this.fetchMetadataPromise) {
        await this.fetchMetadataPromise
      } else {
        await this.fetchVideoMetadata()
      }
      return this.data.videos
    } catch (error) {
      logger.error(error, "[BACKUP PLAYLIST] Failed to get videos")
      return []
    }
  }

  private async fetchVideoMetadata(): Promise<void> {
    if (this.fetchMetadataPromise) return this.fetchMetadataPromise

    this.fetchMetadataPromise = this.dofetchVideoMetadata()
    try {
      await this.fetchMetadataPromise
    } finally {
      this.fetchMetadataPromise = null
    }
  }

  private async dofetchVideoMetadata(): Promise<void> {
    const batchSize = 10
    const results: BackupVideoInfo[] = []

    for (let i = 0; i < this.data.videoIds.length; i += batchSize) {
      const batch = this.data.videoIds.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(async (id) => {
          try {
            const info = await innertube.getBasicInfo(id)
            const thumbnails = info.basic_info.thumbnail
            return {
              id,
              title: info.basic_info.title ?? "Unknown",
              thumbnail: thumbnails?.[thumbnails.length - 1]?.url ?? null,
              duration: info.basic_info.duration ?? 0,
              author: info.basic_info.author ?? null,
            }
          } catch {
            return null
          }
        }),
      )
      results.push(...batchResults.filter((r): r is BackupVideoInfo => r !== null))
    }

    this.data.videos = results
    this.save()
  }

  public clear() {
    this.data = {
      playlistId: null,
      playlistUrl: null,
      videoIds: [],
      videos: [],
      createdAt: null,
    }
    this.index = 0
    this.save()
    logger.info("[BACKUP PLAYLIST] Cleared")
  }

  public reshuffle() {
    shuffle(this.data.videoIds)
    this.data.videos.sort(
      (a, b) => this.data.videoIds.indexOf(a.id) - this.data.videoIds.indexOf(b.id),
    )
    this.index = 0
    this.save()
    logger.info("[BACKUP PLAYLIST] Reshuffled")
  }

  public async refill(): Promise<number> {
    if (!this.data.playlistId) {
      throw new Error("No backup playlist URL is set")
    }

    const videoIds = await this.fetchVideoIds(this.data.playlistId)

    this.data.videoIds = videoIds
    this.data.videos = []
    this.data.createdAt = new Date().toISOString()
    this.index = 0

    this.save()
    logger.info(`[BACKUP PLAYLIST] Refilled with ${videoIds.length} songs`)

    this.fetchVideoMetadata().catch(() => {})

    return videoIds.length
  }

  public async addSongToQueue(songQueue: ISongQueue): Promise<boolean> {
    const maxAttempts = this.data.videoIds.length || 1

    for (let i = 0; i < maxAttempts; i++) {
      const videoId = this.getNextVideoId()
      if (!videoId) return false

      try {
        await songQueue.add({ username: BACKUP_USERNAME, videoId })
        return true
      } catch {
        continue
      }
    }

    return false
  }

  private getNextVideoId(): string | null {
    if (this.data.videoIds.length === 0) return null

    if (this.index >= this.data.videoIds.length) {
      shuffle(this.data.videoIds)
      this.index = 0
    }

    return this.data.videoIds[this.index++]
  }

  private extractPlaylistId(url: string): string | null {
    const match = url.match(this.urlRegex)
    return match?.[1] ?? null
  }

  private async fetchVideoIds(playlistId: string): Promise<string[]> {
    const playlist = await innertube.getPlaylist(playlistId)

    logger.info(`[BACKUP PLAYLIST] Raw items count: ${playlist.items.length}`)

    const videoIds: string[] = []

    for (const item of playlist.items) {
      const itemId = (item as { id?: string }).id ?? (item as { content_id?: string }).content_id
      if (itemId) {
        videoIds.push(itemId)
      } else {
        logger.info(`[BACKUP PLAYLIST] Item type=${item.type} has no id`)
      }

      if (videoIds.length >= BACKUP_LIMIT) break
    }

    if (videoIds.length === 0 && playlist.items.length > 0) {
      logger.info(
        `[BACKUP PLAYLIST] First item keys: ${Object.keys(playlist.items[0] as unknown as Record<string, unknown>).join(", ")}`,
      )
      logger.info(
        `[BACKUP PLAYLIST] First item type: ${(playlist.items[0] as unknown as Record<string, unknown>).type}`,
      )
      logger.info(
        `[BACKUP PLAYLIST] First item constructor: ${(playlist.items[0] as unknown as Record<string, unknown>).constructor?.name}`,
      )
    }

    shuffle(videoIds)

    return videoIds
  }
}

export const backupPlaylistManager = new BackupPlaylistManager()
