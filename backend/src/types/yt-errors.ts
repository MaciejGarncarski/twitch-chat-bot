export const YtErrorCode = {
  METADATA_RETRIEVAL_FAILED: "METADATA_RETRIEVAL_FAILED",
  INVALID_VIDEO_ID: "INVALID_VIDEO_ID",
} as const

export type YtErrorCode = (typeof YtErrorCode)[keyof typeof YtErrorCode]

export class YtError extends Error {
  constructor(
    public code: YtErrorCode,
    message?: string,
  ) {
    super(message || code)
    this.name = "YtError"
  }
}
