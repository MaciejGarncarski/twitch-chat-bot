import {
  MAX_VIDEO_DURATION_SECONDS,
  MIN_VIDEO_DURATION_SECONDS,
} from "@/config/video";
import { getVideoMetadata } from "@/data/get-video-metadata";
import { playbackManager } from "@/core/playback-manager";
import {
  QueuedItem,
  QueueTrackedItem,
  songRequestInputSchema,
} from "@/types/queue";
import { formatDuration } from "@/helpers/format-duration";
import z from "zod";
import { downloadYtAudioForStreaming } from "@/data/download-stream";
import { checkIsInCache } from "@/helpers/cache";
import { logger } from "@/helpers/logger";
import { sendChatMessage } from "@/api/send-chat-message";

export class SongQueue {
  private queue: QueuedItem[] = [];
  private currentPlaying: QueuedItem | null = null;
  private readonly maxQueueLength = 5;

  public getCurrent(): QueuedItem | null {
    return this.currentPlaying;
  }

  public getDurationBeforePlayingCurrent(): number {
    const combinedDurationWithoutLast = this.queue
      .slice(0, -1)
      .reduce((total, item) => total + item.duration, 0);

    return combinedDurationWithoutLast - playbackManager.getPlayTime();
  }

  public getQueue(): QueueTrackedItem[] {
    let cumulativeTime = 0;
    const trackedQueue: QueueTrackedItem[] = [];

    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue[i];

      const timeUntilPlay = cumulativeTime;

      const trackedItem: QueueTrackedItem = {
        ...item,
        position: i + 1,
        timeUntilPlay: timeUntilPlay,
        formattedTimeUntilPlay: formatDuration(timeUntilPlay),
      };

      trackedQueue.push(trackedItem);

      cumulativeTime += item.duration;
    }

    return trackedQueue;
  }

  public get length(): number {
    return this.queue.length;
  }

  public isEmpty(): boolean {
    return this.queue.length === 0 && this.currentPlaying === null;
  }

  private checkIfExists(videoUrl: string): boolean {
    const isQueued = this.queue.find((q) => q.videoUrl === videoUrl);
    const isCurrent =
      this.currentPlaying && this.currentPlaying.videoUrl === videoUrl;
    return !!isQueued || !!isCurrent;
  }

  public async add(
    input: z.infer<typeof songRequestInputSchema>
  ): Promise<QueueTrackedItem> {
    const validatedInput = songRequestInputSchema.parse(input);

    const { duration, title, thumbnail } = await getVideoMetadata(
      validatedInput.videoUrl
    );

    if (this.checkIfExists(validatedInput.videoUrl)) {
      throw new Error("ALREADY_EXISTS");
    }

    if (this.queue.length >= this.maxQueueLength) {
      throw new Error("QUEUE_FULL");
    }

    if (duration < MIN_VIDEO_DURATION_SECONDS) {
      throw new Error("TOO_SHORT");
    }
    if (duration > MAX_VIDEO_DURATION_SECONDS) {
      throw new Error("TOO_LONG");
    }

    const timeUntilPlay = this.getDurationBeforePlayingCurrent();
    const position = this.queue.length + 1;

    const newItem: QueuedItem = {
      id: validatedInput.videoId,
      username: validatedInput.username,
      videoUrl: validatedInput.videoUrl,
      duration: duration,
      title: title,
      thumbnail: thumbnail,
      requestedAt: new Date(),
    };

    const trackedItem: QueueTrackedItem = {
      ...newItem,
      position: this.currentPlaying === newItem ? 0 : position,
      timeUntilPlay: this.currentPlaying === newItem ? 0 : timeUntilPlay,
      formattedTimeUntilPlay:
        this.currentPlaying === newItem
          ? "Now Playing"
          : formatDuration(timeUntilPlay),
    };

    const isInCache = checkIsInCache(validatedInput.videoId);

    if (isInCache) {
      logger.info(`[QUEUE] [CACHE] Song in cache: ${validatedInput.videoId}`);
      if (!this.currentPlaying) {
        this.currentPlaying = newItem;

        playbackManager.setSong(newItem.id, newItem.duration);
        playbackManager.play();
        this.queue.push(newItem);
      } else {
        this.queue.push(newItem);
      }

      return trackedItem;
    }

    logger.info(`[QUEUE] [CACHE] Downloading: ${validatedInput.videoId}`);
    await sendChatMessage(`Pobieranie audio...`);
    await downloadYtAudioForStreaming(
      validatedInput.videoUrl,
      validatedInput.videoId
    );

    if (!this.currentPlaying) {
      this.currentPlaying = newItem;

      playbackManager.setSong(newItem.id, newItem.duration);
      playbackManager.play();
      this.queue.push(newItem);
    } else {
      this.queue.push(newItem);
    }

    return trackedItem;
  }

  public removeCurrent() {
    playbackManager.pause();
    const currentItem = this.currentPlaying;
    const currentId = this.currentPlaying ? this.currentPlaying.id : "";

    this.queue = this.queue.filter((item) => item.id !== currentId);

    if (this.queue.length === 0) {
      this.currentPlaying = null;
      return currentItem;
    }

    this.currentPlaying = this.queue[0];
    playbackManager.setSong(
      this.currentPlaying.id,
      this.currentPlaying.duration
    );
    playbackManager.play();
    return currentItem;
  }

  public next(): QueuedItem | null {
    this.removeCurrent();
    return this.currentPlaying;
  }

  public removeSongById(id: string): boolean {
    const initialLength = this.queue.length;

    if (this.currentPlaying && this.currentPlaying.id === id) {
      this.removeCurrent();
      return true;
    }
    this.queue = this.queue.filter((item) => item.id !== id);

    return this.queue.length < initialLength;
  }
}
