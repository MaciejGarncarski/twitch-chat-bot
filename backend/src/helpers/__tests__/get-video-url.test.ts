import { getVideoUrl } from "@/helpers/get-video-url"
import { describe, test, expect } from "bun:test"

describe("get-video-url", () => {
  test("should return the correct video URL", () => {
    const videoId = "dQw4w9WgXcQ"
    const expectedUrl = `https://www.youtube.com/watch?v=${videoId}`

    const actualUrl = getVideoUrl(videoId)

    expect(actualUrl).toBe(expectedUrl)
  })
  test("should throw an error if videoId is empty", () => {
    const videoId = ""
    expect(() => getVideoUrl(videoId)).toThrow("videoId is required")
  })
  test("should throw an error if videoId is only whitespace", () => {
    const videoId = "   "
    expect(() => getVideoUrl(videoId)).toThrow("videoId is required")
  })
})
