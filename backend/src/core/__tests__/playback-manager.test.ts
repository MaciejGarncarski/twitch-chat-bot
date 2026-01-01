import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test"

import { PlaybackManager } from "@/core/playback-manager"

describe("PlaybackManager", () => {
  let pm: PlaybackManager

  beforeEach(() => {
    pm = new PlaybackManager()
  })

  afterEach(() => {
    pm.stop()
  })

  describe("play/pause", () => {
    test("starts in paused state", () => {
      expect(pm.getIsPlaying()).toBe(false)
    })

    test("play sets isPlaying to true", () => {
      pm.play()

      expect(pm.getIsPlaying()).toBe(true)
    })

    test("pause sets isPlaying to false", () => {
      pm.play()
      pm.pause()

      expect(pm.getIsPlaying()).toBe(false)
    })

    test("play is idempotent", () => {
      pm.play()
      pm.play()

      expect(pm.getIsPlaying()).toBe(true)
    })

    test("pause is idempotent", () => {
      pm.pause()
      pm.pause()

      expect(pm.getIsPlaying()).toBe(false)
    })
  })

  describe("volume", () => {
    test("default volume is 20", () => {
      expect(pm.getVolume()).toBe(20)
    })

    test("setVolume changes volume", () => {
      pm.setVolume(50)

      expect(pm.getVolume()).toBe(50)
    })

    test("setVolume clamps to 0 minimum", () => {
      pm.setVolume(-10)

      expect(pm.getVolume()).toBe(0)
    })

    test("setVolume clamps to 100 maximum", () => {
      pm.setVolume(150)

      expect(pm.getVolume()).toBe(100)
    })
  })

  describe("setSong", () => {
    test("sets song id and resets play time", () => {
      pm.seek(30)
      pm.setSong("newSongId", 180)

      expect(pm.getPlayTime()).toBe(0)
    })
  })

  describe("seek", () => {
    test("sets play time when paused", () => {
      pm.seek(45)

      expect(pm.getPlayTime()).toBe(45)
    })

    test("sets play time when playing", () => {
      pm.play()
      pm.seek(60)

      expect(pm.getPlayTime()).toBe(60)
    })
  })

  describe("getPlayTime", () => {
    test("returns 0 initially", () => {
      expect(pm.getPlayTime()).toBe(0)
    })

    test("returns stored time when paused", () => {
      pm.seek(30)

      expect(pm.getPlayTime()).toBe(30)
    })

    test("preserves play time across pause/resume", () => {
      pm.seek(30)
      pm.play()
      pm.pause()

      expect(pm.getPlayTime()).toBeGreaterThanOrEqual(30)
    })
  })

  describe("stop", () => {
    test("resets all playback state", () => {
      pm.play()
      pm.seek(60)
      pm.setSong("song1", 180)

      pm.stop()

      expect(pm.getIsPlaying()).toBe(false)
      expect(pm.getPlayTime()).toBe(0)
    })
  })
})
