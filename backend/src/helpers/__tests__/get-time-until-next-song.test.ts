import { getTimeUntilNextSong } from "@/helpers/get-time-until-next-song"
import { QueuedItem } from "@/types/queue"
import { describe, test, expect } from "bun:test"

describe("get-time-until-next-song", () => {
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

    const time = getTimeUntilNextSong(queue[0], 100)
    expect(time).toBe(100)
  })
})
