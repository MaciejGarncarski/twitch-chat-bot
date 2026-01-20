export function getVideoUrl(videoId: string): string {
  if (!videoId || videoId.trim() === "") {
    throw new Error("videoId is required")
  }

  return `https://youtu.be/${videoId}`
}
