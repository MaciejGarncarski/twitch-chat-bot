import { describe, test, expect, mock } from "bun:test"

import { MAX_QUEUE_LENGTH } from "@/config/queue"
import { SongQueue } from "@/core/song-queue"
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

const createMockMetadata = (duration: number = 180) => ({
  title: "Test Song",
  thumbnail: "https://example.com/thumb.jpg",
  duration,
})

describe("SongQueue", () => {
  describe("addItemToQueue", () => {
    test("adds item to queue", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("sk3rpYkiHe8"))

      expect(queue.getQueue().length).toBe(1)
      expect(queue.getQueue()[0].id).toBe("sk3rpYkiHe8")
    })
  })

  describe("getCurrent", () => {
    test("returns null when queue is empty", () => {
      const queue = new SongQueue()
      expect(queue.getCurrent()).toBeNull()
    })

    test("returns first item in queue", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("first"))
      queue.addItemToQueue(createMockItem("second"))

      expect(queue.getCurrent()?.id).toBe("first")
    })
  })

  describe("getQueue", () => {
    test("returns empty array when queue is empty", () => {
      const queue = new SongQueue()
      expect(queue.getQueue()).toEqual([])
    })

    test("returns all items in queue", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("a"))
      queue.addItemToQueue(createMockItem("b"))
      queue.addItemToQueue(createMockItem("c"))

      expect(queue.getQueue().length).toBe(3)
    })
  })

  describe("length", () => {
    test("returns 0 for empty queue", () => {
      const queue = new SongQueue()
      expect(queue.length).toBe(0)
    })

    test("returns correct count", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("a"))
      queue.addItemToQueue(createMockItem("b"))

      expect(queue.length).toBe(2)
    })
  })

  describe("isEmpty", () => {
    test("returns true for empty queue", () => {
      const queue = new SongQueue()
      expect(queue.isEmpty()).toBe(true)
    })

    test("returns false when queue has items", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("a"))

      expect(queue.isEmpty()).toBe(false)
    })
  })

  describe("add", () => {
    test("adds song with provided metadata", async () => {
      const queue = new SongQueue()
      const item = await queue.add(
        { username: "user1", videoId: "dQw4w9WgXcQ" },
        createMockMetadata(),
      )

      expect(item.id).toBe("dQw4w9WgXcQ")
      expect(item.title).toBe("Test Song")
      expect(queue.length).toBe(1)
    })

    test("emits song-queued event", async () => {
      const queue = new SongQueue()
      const listener = mock()
      queue.on("song-queued", listener)

      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" }, createMockMetadata())

      expect(listener).toHaveBeenCalledTimes(1)
    })

    test("throws ALREADY_EXISTS when song is already in queue", async () => {
      const queue = new SongQueue()
      await queue.add({ username: "user1", videoId: "dQw4w9WgXcQ" }, createMockMetadata())

      expect(
        queue.add({ username: "user2", videoId: "dQw4w9WgXcQ" }, createMockMetadata()),
      ).rejects.toThrow("ALREADY_EXISTS")
    })

    test("throws QUEUE_FULL when queue is at max capacity", async () => {
      const queue = new SongQueue()

      for (let i = 0; i < MAX_QUEUE_LENGTH; i++) {
        await queue.add({ username: "user1", videoId: `video${i}` }, createMockMetadata())
      }

      expect(
        queue.add({ username: "user1", videoId: "video_overflow" }, createMockMetadata()),
      ).rejects.toThrow("QUEUE_FULL")
    })

    test("throws TOO_SHORT when video is too short", async () => {
      const queue = new SongQueue()

      expect(
        queue.add({ username: "user1", videoId: "short" }, createMockMetadata(5)),
      ).rejects.toThrow("TOO_SHORT")
    })

    test("throws TOO_LONG when video exceeds max duration", async () => {
      const queue = new SongQueue()

      expect(
        queue.add({ username: "user1", videoId: "long" }, createMockMetadata(99999)),
      ).rejects.toThrow("TOO_LONG")
    })
  })

  describe("getCurrentSongId", () => {
    test("returns null when queue is empty", () => {
      const queue = new SongQueue()
      expect(queue.getCurrentSongId()).toBeNull()
    })

    test("returns id of current song", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("current-id"))

      expect(queue.getCurrentSongId()).toBe("current-id")
    })
  })

  describe("removeCurrent", () => {
    test("returns null when queue is empty", () => {
      const queue = new SongQueue()
      expect(queue.removeCurrent()).toBeNull()
    })

    test("removes and returns current song", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("first"))
      queue.addItemToQueue(createMockItem("second"))

      const removed = queue.removeCurrent()

      expect(removed?.id).toBe("first")
      expect(queue.length).toBe(1)
      expect(queue.getCurrent()?.id).toBe("second")
    })

    test("emits song-remove-current event", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("first"))
      const listener = mock()
      queue.on("song-remove-current", listener)

      queue.removeCurrent()

      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe("removeById", () => {
    test("returns null if song not found", () => {
      const queue = new SongQueue()
      expect(queue.removeById("nonexistent")).toBeNull()
    })

    test("removes and returns song by id", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("a"))
      queue.addItemToQueue(createMockItem("b"))
      queue.addItemToQueue(createMockItem("c"))

      const removed = queue.removeById("b")

      expect(removed?.id).toBe("b")
      expect(queue.length).toBe(2)
      expect(queue.getQueue().find((s) => s.id === "b")).toBeUndefined()
    })
  })

  describe("removeBatchByIds", () => {
    test("removes multiple songs by ids", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("a"))
      queue.addItemToQueue(createMockItem("b"))
      queue.addItemToQueue(createMockItem("c"))
      queue.addItemToQueue(createMockItem("d"))

      queue.removeBatchByIds(["a", "c"])

      expect(queue.length).toBe(2)
      expect(queue.getQueue().map((s) => s.id)).toEqual(["b", "d"])
    })

    test("handles non-existent ids gracefully", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("a"))

      queue.removeBatchByIds(["nonexistent"])

      expect(queue.length).toBe(1)
    })
  })

  describe("peekNext", () => {
    test("returns null when queue has 0 items", () => {
      const queue = new SongQueue()
      expect(queue.peekNext()).toBeNull()
    })

    test("returns null when queue has only 1 item", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("only"))

      expect(queue.peekNext()).toBeNull()
    })

    test("returns second item without removing it", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("first"))
      queue.addItemToQueue(createMockItem("second"))

      expect(queue.peekNext()?.id).toBe("second")
      expect(queue.length).toBe(2)
    })
  })

  describe("getAvailableSlots", () => {
    test("returns max slots when queue is empty", () => {
      const queue = new SongQueue()
      expect(queue.getAvailableSlots()).toBe(MAX_QUEUE_LENGTH)
    })

    test("returns correct remaining slots", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("a"))
      queue.addItemToQueue(createMockItem("b"))
      queue.addItemToQueue(createMockItem("c"))

      expect(queue.getAvailableSlots()).toBe(MAX_QUEUE_LENGTH - 3)
    })
  })

  describe("findPositionInQueue", () => {
    test("returns null if song not found", () => {
      const queue = new SongQueue()
      expect(queue.findPositionInQueue("nonexistent")).toBeNull()
    })

    test("returns 1-based position", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("a"))
      queue.addItemToQueue(createMockItem("b"))
      queue.addItemToQueue(createMockItem("c"))

      expect(queue.findPositionInQueue("a")).toBe(1)
      expect(queue.findPositionInQueue("b")).toBe(2)
      expect(queue.findPositionInQueue("c")).toBe(3)
    })
  })

  describe("getAtPosition", () => {
    test("returns null for negative position", () => {
      const queue = new SongQueue()
      expect(queue.getAtPosition(-1)).toBeNull()
    })

    test("returns null for position beyond queue length", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("a"))

      expect(queue.getAtPosition(5)).toBeNull()
    })

    test("returns item at 0-based position", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("a"))
      queue.addItemToQueue(createMockItem("b"))
      queue.addItemToQueue(createMockItem("c"))

      expect(queue.getAtPosition(0)?.id).toBe("a")
      expect(queue.getAtPosition(1)?.id).toBe("b")
      expect(queue.getAtPosition(2)?.id).toBe("c")
    })
  })

  describe("shuffle", () => {
    test("keeps first item (current) in place", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("current"))
      queue.addItemToQueue(createMockItem("a"))
      queue.addItemToQueue(createMockItem("b"))
      queue.addItemToQueue(createMockItem("c"))

      queue.shuffle()

      expect(queue.getCurrent()?.id).toBe("current")
    })

    test("shuffles remaining items", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("current"))
      for (let i = 0; i < 20; i++) {
        queue.addItemToQueue(createMockItem(`song${i}`))
      }

      const beforeIds = queue.getQueue().map((s) => s.id)
      queue.shuffle()
      const afterIds = queue.getQueue().map((s) => s.id)

      // First item should stay the same
      expect(afterIds[0]).toBe(beforeIds[0])
      // At least some items should be in different positions (statistically very likely)
      expect(afterIds.slice(1)).not.toEqual(beforeIds.slice(1))
    })
  })

  describe("clearAll", () => {
    test("removes all items from queue", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("a"))
      queue.addItemToQueue(createMockItem("b"))
      queue.addItemToQueue(createMockItem("c"))

      queue.clearAll()

      expect(queue.length).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    test("emits clear-queue event", () => {
      const queue = new SongQueue()
      queue.addItemToQueue(createMockItem("a"))
      const listener = mock()
      queue.on("clear-queue", listener)

      queue.clearAll()

      expect(listener).toHaveBeenCalledTimes(1)
    })
  })
})
