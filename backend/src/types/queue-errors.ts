export const QueueErrorCodes = {
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  QUEUE_FULL: 'QUEUE_FULL',
  TOO_SHORT: 'TOO_SHORT',
  TOO_LONG: 'TOO_LONG',
} as const

export type QueueErrorCode = (typeof QueueErrorCodes)[keyof typeof QueueErrorCodes]

export class QueueError extends Error {
  constructor(
    public code: QueueErrorCode,
    message?: string,
  ) {
    super(message || code)
    this.name = 'QueueError'
  }
}
