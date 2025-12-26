import { EventEmitter } from 'node:events'

import z from 'zod'

import { MAX_VIDEO_DURATION_SECONDS, MIN_VIDEO_DURATION_SECONDS } from '@/config/video'
import { getVideoMetadata, SongMetadata } from '@/data/get-video-metadata'
import { getVideoUrl } from '@/helpers/get-video-url'
import { QueuedItem, songRequestInputSchema } from '@/types/queue'
import { QueueError } from '@/types/queue-errors'

export interface ISongQueue extends EventEmitter {
  getCurrent(): QueuedItem | null
  getQueue(): QueuedItem[]
  length: number
  addItemToQueue(item: QueuedItem): void
  isEmpty(): boolean
  add(input: z.infer<typeof songRequestInputSchema>, metadata?: SongMetadata): Promise<QueuedItem>
  getCurrentSongId(): string | null
  removeCurrent(): QueuedItem | null
  removeById(songId: string): QueuedItem | null
  removeBatchByIds(songIds: string[]): void
  peekNext(): QueuedItem | null
  getAvailableSlots(): number
  clearAll(): void
  findPositionInQueue(songId: string): number | null
  getAtPosition(position: number): QueuedItem | null
  shuffle(): void

  on(event: 'song-queued', listener: (item: QueuedItem) => void): this
  on(event: 'clear-queue', listener: () => void): this
  on(event: 'song-remove-current', listener: (item: QueuedItem) => void): this
}

export class SongQueue extends EventEmitter implements ISongQueue {
  private queue: QueuedItem[] = []
  private readonly maxQueueLength = 10

  constructor() {
    super()
  }

  public getCurrent(): QueuedItem | null {
    return this.queue[0] || null
  }

  public getQueue(): QueuedItem[] {
    return this.queue
  }

  public get length(): number {
    return this.queue.length
  }

  public addItemToQueue(item: QueuedItem) {
    this.queue.push(item)
  }

  public isEmpty(): boolean {
    return this.queue.length === 0 && this.getCurrent() === null
  }

  private checkIfExists(videoUrl: string): boolean {
    const isQueued = this.queue.find((q) => q.videoUrl === videoUrl)
    const isCurrent = this.getCurrent() && this.getCurrent()!.videoUrl === videoUrl
    return !!isQueued || !!isCurrent
  }

  public async add(
    input: z.infer<typeof songRequestInputSchema>,
    metadata?: SongMetadata,
  ): Promise<QueuedItem> {
    const validatedInput = songRequestInputSchema.parse(input)

    let title = 'Unknown Title'
    let thumbnail: string | null = null
    let duration = 0

    if (metadata) {
      title = metadata.title
      thumbnail = metadata.thumbnail
      duration = metadata.duration
    } else {
      const fetchedMetadata = await getVideoMetadata(validatedInput.videoId)
      title = fetchedMetadata.title
      thumbnail = fetchedMetadata.thumbnail
      duration = fetchedMetadata.duration
    }

    const videoUrl = getVideoUrl(validatedInput.videoId)

    if (this.checkIfExists(videoUrl)) {
      throw new QueueError('ALREADY_EXISTS')
    }

    if (this.queue.length >= this.maxQueueLength) {
      throw new QueueError('QUEUE_FULL')
    }

    if (duration < MIN_VIDEO_DURATION_SECONDS) {
      throw new QueueError('TOO_SHORT')
    }
    if (duration > MAX_VIDEO_DURATION_SECONDS) {
      throw new QueueError('TOO_LONG')
    }

    const newItem: QueuedItem = {
      id: validatedInput.videoId,
      username: validatedInput.username,
      videoUrl: videoUrl,
      duration: duration,
      title: title,
      thumbnail: thumbnail,
      requestedAt: new Date(),
    }

    this.queue.push(newItem)
    this.emit('song-queued', newItem)
    return newItem
  }

  public getCurrentSongId(): string | null {
    const current = this.getCurrent()
    return current ? current.id : null
  }

  public removeCurrent() {
    const currentItem = this.getCurrent()

    if (!currentItem) {
      return null
    }

    this.queue = this.queue.filter((item) => item.id !== currentItem.id)
    this.emit('song-remove-current', currentItem)

    return currentItem
  }

  public shuffle(): void {
    for (let i = this.queue.length - 1; i > 1; i--) {
      const j = Math.floor(Math.random() * i) + 1
      ;[this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]]
    }
  }

  public getAtPosition(position: number): QueuedItem | null {
    if (position < 1 || position > this.queue.length) {
      return null
    }
    return this.queue[position - 1]
  }

  public removeById(songId: string) {
    const itemToRemove = this.queue.find((item) => item.id === songId)

    if (!itemToRemove) {
      return null
    }

    this.queue = this.queue.filter((item) => item.id !== songId)

    return itemToRemove
  }

  public removeBatchByIds(songIds: string[]): void {
    this.queue = this.queue.filter((item) => !songIds.includes(item.id))
  }

  public peekNext(): QueuedItem | null {
    if (this.queue.length <= 1) {
      return null
    }
    return this.queue[1]
  }

  public getAvailableSlots(): number {
    return this.maxQueueLength - this.queue.length
  }

  public findPositionInQueue(songId: string): number | null {
    const index = this.queue.findIndex((item) => item.id === songId)
    return index !== -1 ? index + 1 : null
  }

  public clearAll(): void {
    this.queue = []
    this.emit('clear-queue')
  }
}
