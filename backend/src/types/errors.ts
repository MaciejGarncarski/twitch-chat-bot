export const CommandErrorCode = {
  NOT_A_MOD: 'NOT_A_MOD',
  CANNOT_SKIP_SONG: 'CANNOT_SKIP_SONG',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
} as const

export type CommandErrorCode = (typeof CommandErrorCode)[keyof typeof CommandErrorCode]

export class CommandError extends Error {
  constructor(
    public code: CommandErrorCode,
    message?: string,
  ) {
    super(message || code)
    this.name = 'CommandError'
  }
}
