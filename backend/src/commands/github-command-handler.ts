import { CommandHandler, CommandContext } from "@/commands/command"
import { logger } from "@/helpers/logger"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { t } from "@/i18n/i18n"

export class GithubCommandHandler extends CommandHandler {
  private readonly command = "github"

  rateLimit: RateLimitConfig = {
    windowMs: 30000,
    max: 2,
  }

  canHandle(command: string): boolean {
    return command.toLowerCase() === this.command
  }

  async execute({ deps: { sendChatMessage }, messageId }: CommandContext) {
    logger.info(`[COMMAND] [GITHUB] Sending GitHub repository link.`)
    await sendChatMessage(t("commands.github.link"), messageId)
  }
}
