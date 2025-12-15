import { songQueue } from "@/lib/chat-ws";
import { logger } from "@/lib/logger";
import { getBunServer } from "@/utils/init-ws";

export class PlaybackManager {
  private isPlaying: boolean;
  private volume: number;
  private playTime: number;
  private startedAt: number | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private songId: string | null = null;
  private currentSongDuration: number = 0;

  constructor() {
    this.isPlaying = false;
    this.volume = 1.0;
    this.playTime = 0;
  }

  public setSong(songId: string, duration: number) {
    this.songId = songId;
    this.currentSongDuration = duration;
    this.playTime = 0;
    this.startedAt = Date.now() - this.playTime * 1000;
  }

  getPlayTime() {
    if (!this.isPlaying || this.startedAt === null) return this.playTime;
    return Math.floor((Date.now() - this.startedAt) / 1000);
  }

  play() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.startedAt = Date.now() - this.playTime * 1000;

    if (this.intervalId === null) {
      this.intervalId = setInterval(async () => {
        const currentPlayTime = this.getPlayTime();
        console.log({ currentPlayTime });

        if (
          this.currentSongDuration > 0 &&
          currentPlayTime >= this.currentSongDuration
        ) {
          console.log("Utwór się zakończył. Wywołuję handleSongEnd.");
          this.handleSongEnd();
          return;
        }

        const bunInstance = getBunServer();
        if (!bunInstance) return;

        bunInstance.publish(
          "playback-status",
          JSON.stringify({
            isPlaying: this.isPlaying,
            volume: this.volume,
            songId: this.songId,
            playTime: currentPlayTime,
            startedAt: this.startedAt,
            serverTime: Date.now(),
          })
        );
      }, 1000);
    }
  }
  pause() {
    if (this.isPlaying && this.startedAt !== null) {
      this.playTime = this.getPlayTime();
    }

    this.isPlaying = false;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const bunInstance = getBunServer();
    if (bunInstance) {
      bunInstance.publish(
        "playback-status",
        JSON.stringify({
          isPlaying: this.isPlaying,
          volume: this.volume,
          songId: this.songId,
          playTime: this.playTime,
          startedAt: null,
          serverTime: Date.now(),
        })
      );
    }
    this.startedAt = null;
  }

  setVolume(volume: number) {
    if (volume < 0 || volume > 1) {
      throw new Error("Volume must be between 0.0 and 1.0");
    }
    this.volume = volume;
  }

  getStatus() {
    return {
      isPlaying: this.isPlaying,
      volume: this.volume,
      playTime: this.playTime,
    };
  }

  handleSongEnd() {
    logger.info("Current song finished playing. Advancing queue.");

    const nextSong = songQueue.next();
    const bunInstance = getBunServer();

    if (nextSong) {
      logger.info(`Next song starting: ${nextSong.title}`);

      if (bunInstance) {
        bunInstance.publish(
          "playback-status",
          JSON.stringify({
            isPlaying: true,
            volume: this.volume,
            songId: nextSong.id,
            playTime: 0,
            startedAt: Date.now(),
            serverTime: Date.now(),
          })
        );
      }
      return;
    }

    logger.info("Queue is empty. Stopping playback.");
    this.pause();

    if (bunInstance) {
      bunInstance.publish(
        "playback-status",
        JSON.stringify({ isPlaying: false, songId: null })
      );
    }
  }
}

export const playbackManager = new PlaybackManager();
