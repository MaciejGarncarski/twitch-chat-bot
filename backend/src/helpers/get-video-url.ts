export function getVideoUrl(videoId: string): string {
  if (!videoId || videoId.trim() === "") {
    throw new Error("videoId is required")
  }

  return `https://www.youtube.com/watch?v=${videoId}`
}
