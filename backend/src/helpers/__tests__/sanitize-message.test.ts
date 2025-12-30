import { sanitizeMessage } from "@/helpers/sanitize-message"
import { describe, test, expect } from "bun:test"

describe("sanitize-message", () => {
  test("removes leading and trailing whitespace", () => {
    const input = "   Hello, World!   "
    const expected = "Hello, World!"
    expect(sanitizeMessage(input)).toBe(expected)
  })

  test("handles empty string", () => {
    const input = ""
    const expected = ""
    expect(sanitizeMessage(input)).toBe(expected)
  })

  test("removes formatting characters", () => {
    const input = "Hello\u200BWorld\u200C!"
    const expected = "HelloWorld!"
    expect(sanitizeMessage(input)).toBe(expected)
  })
})
