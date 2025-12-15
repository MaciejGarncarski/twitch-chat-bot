import {
  MAX_VIDEO_DURATION_SECONDS,
  MIN_VIDEO_DURATION_SECONDS,
} from "@/config/video";
import { getVideoMetadata } from "@/lib/get-video-metadata";
import { playbackManager } from "@/lib/playback-manager";
import {
  QueuedItem,
  QueueTrackedItem,
  songRequestInputSchema,
} from "@/schemas/queue";
import { formatDuration } from "@/utils/format-duration";
import z from "zod";

export class SongQueue {
  private queue: QueuedItem[] = [];
  private currentPlaying: QueuedItem | null = null;
  private readonly maxQueueLength = 5;

  public getCurrent(): QueuedItem | null {
    return this.currentPlaying;
  }

  public getDurationBeforePlayingCurrent(): number {
    // 10s in
    // 200, 130, 20
    return this.queue.reduce((total, item) => total + item.duration, 0);
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

  private checkIfExists(videoUrl: string): boolean {
    const isQueued = this.queue.find((q) => q.videoUrl === videoUrl);
    const isCurrent =
      this.currentPlaying && this.currentPlaying.videoUrl === videoUrl;
    return !!isQueued || !!isCurrent;
  }

  private getTotalDuration(): number {
    const queueDuration = this.queue.reduce(
      (total, item) => total + item.duration,
      0
    );
    const currentDuration = this.currentPlaying
      ? this.currentPlaying.duration
      : 0;
    return queueDuration + currentDuration;
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
      userId: validatedInput.userId,
      videoUrl: validatedInput.videoUrl,
      duration: duration,
      title: title,
      thumbnail: thumbnail,
      requestedAt: new Date(),
    };

    if (!this.currentPlaying) {
      this.currentPlaying = newItem;

      playbackManager.setSong(newItem.id, newItem.duration);
      playbackManager.play();
    } else {
      this.queue.push(newItem);
    }

    const trackedItem: QueueTrackedItem = {
      ...newItem,
      position: this.currentPlaying === newItem ? 0 : position,
      timeUntilPlay: this.currentPlaying === newItem ? 0 : timeUntilPlay,
      formattedTimeUntilPlay:
        this.currentPlaying === newItem
          ? "Now Playing"
          : formatDuration(timeUntilPlay),
    };

    return trackedItem;
  }

  public next(): QueuedItem | null {
    if (this.queue.length === 0) {
      this.currentPlaying = null;
      playbackManager.pause();
      return null;
    }

    const nextSong = this.queue.shift();
    this.currentPlaying = nextSong!;

    playbackManager.setSong(
      this.currentPlaying.id,
      this.currentPlaying.duration
    );
    playbackManager.play();

    return this.currentPlaying;
  }

  public remove(id: string): boolean {
    const initialLength = this.queue.length;

    if (this.currentPlaying && this.currentPlaying.id === id) {
      this.next();
      return true;
    }
    this.queue = this.queue.filter((item) => item.id !== id);

    return this.queue.length < initialLength;
  }
}
