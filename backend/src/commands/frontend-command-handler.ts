import { CommandHandler, CommandContext } from "@/commands/command"
import { logger } from "@/helpers/logger"
import { RateLimitConfig } from "@/helpers/rate-limit"

export class FrontendCommandHandler extends CommandHandler {
  private readonly command = "ui"

  rateLimit: RateLimitConfig = {
    windowMs: 30000,
    max: 2,
  }

  canHandle(command: string): boolean {
    return command.toLowerCase() === this.command
  }

  async execute({ deps: { sendChatMessage }, messageId }: CommandContext) {
    logger.info(`[COMMAND] [UI] Sending frontend UI link.`)
    await sendChatMessage("UI: https://bot.maciej-garncarski.pl/", messageId)
  }
}
