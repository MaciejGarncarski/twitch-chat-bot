import { describe, test, expect, mock, beforeEach } from "bun:test"

import { PlaybackManager } from "@/core/playback-manager"
import { SongQueue } from "@/core/song-queue"
import { SongRequestEngine } from "@/core/song-request-engine"
import { VoteManager } from "@/core/vote-manager"
import { QueuedItem } from "@/schemas/queue"

const createMockItem = (id: string, username: string = "user1"): QueuedItem => ({
  id,
  requestedAt: new Date(),
  title: `Song ${id}`,
  videoUrl: `https://www.youtube.com/watch?v=${id}`,
  username,
  thumbnail: null,
  duration: 180,
})

describe("SongRequestEngine", () => {
  let songQueue: SongQueue
  let voteManager: VoteManager
  let playbackManager: PlaybackManager
  let engine: SongRequestEngine

  beforeEach(() => {
    songQueue = new SongQueue()
    voteManager = new VoteManager()
    playbackManager = new PlaybackManager()
    engine = new SongRequestEngine(songQueue, voteManager, playbackManager)
  })

  describe("getters", () => {
    test("getSongQueue returns song queue", () => {
      expect(engine.getSongQueue()).toBe(songQueue)
    })

    test("getVoteManager returns vote manager", () => {
      expect(engine.getVoteManager()).toBe(voteManager)
    })

    test("getPlaybackManager returns playback manager", () => {
      expect(engine.getPlaybackManager()).toBe(playbackManager)
    })
  })

  describe("setupEventListeners", () => {
    beforeEach(() => {
      engine.setupEventListeners()
    })

    describe("song-queued event", () => {
      test("starts playback when first song is added", () => {
        songQueue.addItemToQueue(createMockItem("first"))
        songQueue.emit("song-queued", createMockItem("first"))

        expect(playbackManager.getIsPlaying()).toBe(true)
      })

      test("does not restart playback when queue already has songs", () => {
        songQueue.addItemToQueue(createMockItem("first"))
        songQueue.addItemToQueue(createMockItem("second"))
        playbackManager.pause()

        songQueue.emit("song-queued", createMockItem("second"))

        expect(playbackManager.getIsPlaying()).toBe(false)
      })
    })

    describe("song-remove-current event", () => {
      test("plays next song when current is removed", async () => {
        songQueue.addItemToQueue(createMockItem("first"))
        songQueue.addItemToQueue(createMockItem("second"))
        playbackManager.play()

        songQueue.emit("song-remove-current", createMockItem("first"))
        songQueue.getQueue().shift() // simulate removal

        // playNextSongWithDelay sets isPlaying to false first, then true after 2s delay
        // So we need to wait for the delay to complete
        await new Promise((resolve) => setTimeout(resolve, 2100))

        expect(playbackManager.getIsPlaying()).toBe(true)
      })

      test("resets vote manager when song is removed", () => {
        voteManager.addVote("user1")
        voteManager.addVote("user2")
        songQueue.addItemToQueue(createMockItem("first"))

        songQueue.emit("song-remove-current", createMockItem("first"))

        expect(voteManager.getCurrentCount()).toBe(0)
      })

      test("stops playback when queue becomes empty", () => {
        playbackManager.play()

        songQueue.emit("song-remove-current", createMockItem("last"))

        expect(playbackManager.getIsPlaying()).toBe(false)
      })
    })

    describe("clear-queue event", () => {
      test("resets vote manager on clear", () => {
        voteManager.addVote("user1")

        songQueue.emit("clear-queue")

        expect(voteManager.getCurrentCount()).toBe(0)
      })

      test("stops playback on clear", () => {
        playbackManager.play()

        songQueue.emit("clear-queue")

        expect(playbackManager.getIsPlaying()).toBe(false)
      })
    })

    describe("song-ended event", () => {
      test("removes current song when it ends", () => {
        songQueue.addItemToQueue(createMockItem("first"))
        songQueue.addItemToQueue(createMockItem("second"))

        playbackManager.emit("song-ended")

        expect(songQueue.getQueue().length).toBe(1)
        expect(songQueue.getCurrent()?.id).toBe("second")
      })
    })
  })
})
