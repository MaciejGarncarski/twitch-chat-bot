import {
  MAX_VIDEO_DURATION_SECONDS,
  MIN_VIDEO_DURATION_SECONDS,
} from "@/config/video";
import { getVideoLengthAndTitle } from "@/lib/get-video-length-and-title";
import { getYtVideo } from "@/lib/get-yt-video";
import {
  PlayableItem,
  QueuedItem,
  QueueTrackedItem,
  songRequestInputSchema,
} from "@/schemas/queue";
import { formatDuration } from "@/utils/format-duration";
import { getBunServer } from "@/utils/init-ws";
import z from "zod";

const generateId = () => Math.random().toString(36).substring(2, 9);

export class SongQueue {
  private queue: QueuedItem[] = [];
  private currentPlaying: PlayableItem | null = null;

  public getCurrent(): PlayableItem | null {
    return this.currentPlaying;
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
    return !!this.queue.find((q) => q.videoUrl === videoUrl);
  }

  private getTotalDuration(): number {
    return this.queue.reduce((total, item) => total + item.duration, 0);
  }

  public async add(
    input: z.infer<typeof songRequestInputSchema>
  ): Promise<QueueTrackedItem> {
    const validatedInput = songRequestInputSchema.parse(input);
    const { duration, title } = await getVideoLengthAndTitle(
      validatedInput.videoUrl
    );

    const alreadyExists = this.checkIfExists(validatedInput.videoUrl);

    if (alreadyExists) {
      throw new Error("ALREADY_EXISTS");
    }

    if (duration < MIN_VIDEO_DURATION_SECONDS) {
      throw new Error("TOO_SHORT");
    }
    if (duration > MAX_VIDEO_DURATION_SECONDS) {
      throw new Error("TOO_LONG");
    }
    const timeUntilPlay = this.getTotalDuration();
    const position = this.queue.length + 1;

    const newItem: QueuedItem = {
      id: generateId(),
      userId: validatedInput.userId,
      videoUrl: validatedInput.videoUrl,
      duration: duration,
      title: title,
      requestedAt: new Date(),
    };

    this.queue.push(newItem);

    if (this.queue.length === 1 && !this.currentPlaying) {
      await this.prepareNext();
      getBunServer()?.publish(
        "playback",
        JSON.stringify({ status: "playing" })
      );
    }

    const trackedItem: QueueTrackedItem = {
      ...newItem,
      position: position,
      timeUntilPlay: timeUntilPlay,
      formattedTimeUntilPlay: formatDuration(timeUntilPlay),
    };

    return trackedItem;
  }

  public async prepareNext(): Promise<PlayableItem | null> {
    const nextQueuedItem = this.queue.shift();

    if (!nextQueuedItem) {
      return null;
    }

    const audioUrl = await getYtVideo(nextQueuedItem.videoUrl);

    const playableItem: PlayableItem = {
      ...nextQueuedItem,
      audioUrl: audioUrl,
    };

    this.currentPlaying = playableItem;

    return playableItem;
  }

  public remove(id: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter((item) => item.id !== id);
    return this.queue.length < initialLength;
  }
}
