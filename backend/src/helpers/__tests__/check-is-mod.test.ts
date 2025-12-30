import { ChatBadge, checkIsMod } from "@/helpers/check-is-mod"
import { expect, test, describe } from "bun:test"

describe("check-is-mod", () => {
  test("should return true for mod user type", () => {
    // Arrange
    const badges: ChatBadge[] = [{ id: "1", set_id: "moderator", info: "some info" }]

    // Act
    const isMod = checkIsMod(badges)

    // Assert
    expect(isMod).toBe(true)
  })

  test("should return true for broadcaster", () => {
    // Arrange
    const badges: ChatBadge[] = []
    const chatterId = "12345"
    const broadcasterId = "12345"

    // Act
    const isMod = checkIsMod(badges, chatterId, broadcasterId)

    // Assert
    expect(isMod).toBe(true)
  })

  test("should return false for non-mod user", () => {
    // Arrange
    const badges: ChatBadge[] = [{ id: "2", set_id: "subscriber", info: "some info" }]
    const chatterId = "12345"
    const broadcasterId = "67890"

    // Act
    const isMod = checkIsMod(badges, chatterId, broadcasterId)

    // Assert
    expect(isMod).toBe(false)
  })
  test("should return false when badges are null", () => {
    // Arrange
    const badges: ChatBadge[] | null = null

    // Act
    const isMod = checkIsMod(badges)

    // Assert
    expect(isMod).toBe(false)
  })
  test("should return false when badges are undefined", () => {
    // Arrange
    const badges: ChatBadge[] | undefined = undefined

    // Act
    const isMod = checkIsMod(badges)

    // Assert
    expect(isMod).toBe(false)
  })
})
