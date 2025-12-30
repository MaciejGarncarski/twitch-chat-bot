import { getTimeUntilAddedSong } from "@/helpers/get-time-until-added-song"
import { QueuedItem } from "@/types/queue"
import { describe, test, expect } from "bun:test"

describe("get-time-until-added-song", () => {
  test("should calculate time until song is added correctly", () => {
    const queue: QueuedItem[] = [
      {
        id: "1",
        title: "Song 1",
        duration: 200,
        username: "user1",
        videoUrl: "http://example.com/song1",
        requestedAt: new Date(),
        thumbnail: null,
      },
      {
        id: "2",
        title: "Song 2",
        duration: 180,
        username: "user2",
        videoUrl: "http://example.com/song2",
        requestedAt: new Date(),
        thumbnail: null,
      },
      {
        id: "3",
        title: "Song 3",
        duration: 240,
        username: "user3",
        videoUrl: "http://example.com/song3",
        requestedAt: new Date(),
        thumbnail: null,
      },
    ]

    // third one is added, so we calculate time until first one ends
    // 200 (Song 1) + 180 (Song 2) - 100 (playTime) = 280
    const timeUntil = getTimeUntilAddedSong(queue, 100)

    expect(timeUntil).toBe(280)
  })
  test("should return 0 if queue is empty", () => {
    const queue: QueuedItem[] = []

    const timeUntil = getTimeUntilAddedSong(queue, 50)

    expect(timeUntil).toBe(0)
  })
  test("should return remaining time of the only song in the queue", () => {
    const queue: QueuedItem[] = [
      {
        id: "1",
        title: "Song 1",
        duration: 300,
        username: "user1",
        videoUrl: "http://example.com/song1",
        requestedAt: new Date(),
        thumbnail: null,
      },
    ]

    // Only one song in the queue
    // 300 (Song 1) - 150 (playTime) = 150
    const timeUntil = getTimeUntilAddedSong(queue, 150)

    expect(timeUntil).toBe(150)
  })
})
