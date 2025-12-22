export const CommandErrorCode = {
  NOT_A_MOD: 'NOT_A_MOD',
  ON_COOLDOWN: 'ON_COOLDOWN',
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
