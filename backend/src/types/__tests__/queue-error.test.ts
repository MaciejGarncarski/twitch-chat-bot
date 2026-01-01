import { QueueError, QueueErrorCodes } from "@/types/queue-errors"
import { describe, test, expect } from "bun:test"

describe("queue-error", () => {
  test("should have valid code", () => {
    const error = new QueueError(QueueErrorCodes.QUEUE_FULL, "The queue is full")
    expect(error.code).toBe(QueueErrorCodes.QUEUE_FULL)
    expect(error.message).toBe("The queue is full")
    expect(error.name).toBe("QueueError")
  })
})
