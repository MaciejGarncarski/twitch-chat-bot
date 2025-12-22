import { CommandHandler, ExecuteParams } from '@/commands/command'
import { logger } from '@/helpers/logger'
import { RateLimitConfig } from '@/helpers/rate-limit'

export class GithubCommandHandler extends CommandHandler {
  private readonly regex = /^!github\b/i

  rateLimit: RateLimitConfig = {
    windowMs: 30000,
    max: 2,
  }

  canHandle(messageText: string): boolean {
    return this.regex.test(messageText)
  }

  async execute({ deps: { sendChatMessage }, messageId }: ExecuteParams) {
    logger.info(`[COMMAND] [GITHUB] Sending GitHub repository link.`)
    await sendChatMessage(
      'Link do repozytorium: https://github.com/maciejgarncarski/twitch-chat-bot',
      messageId,
    )
  }
}
