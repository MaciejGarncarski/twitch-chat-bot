import { ChatBadge, checkIsMod } from "@/helpers/check-is-mod"
import { expect, test, describe } from "bun:test"

describe("check-is-mod", () => {
  test("should return true for mod user type", () => {
    const badges: ChatBadge[] = [{ id: "1", set_id: "moderator", info: "some info" }]

    const isMod = checkIsMod(badges)

    expect(isMod).toBe(true)
  })

  test("should return true for broadcaster", () => {
    const badges: ChatBadge[] = []
    const chatterId = "12345"
    const broadcasterId = "12345"

    const isMod = checkIsMod(badges, chatterId, broadcasterId)

    expect(isMod).toBe(true)
  })

  test("should return false for non-mod user", () => {
    const badges: ChatBadge[] = [{ id: "2", set_id: "subscriber", info: "some info" }]
    const chatterId = "12345"
    const broadcasterId = "67890"

    const isMod = checkIsMod(badges, chatterId, broadcasterId)

    expect(isMod).toBe(false)
  })
  test("should return false when badges are null", () => {
    const badges: ChatBadge[] | null = null

    const isMod = checkIsMod(badges)

    expect(isMod).toBe(false)
  })
  test("should return false when badges are undefined", () => {
    const badges: ChatBadge[] | undefined = undefined

    const isMod = checkIsMod(badges)

    expect(isMod).toBe(false)
  })
})
