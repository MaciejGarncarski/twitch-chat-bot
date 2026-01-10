import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"

export class VanishCommandHandler extends CommandHandler {
  private readonly command = "vanish"
  private readonly durationInSeconds = 3

  rateLimit: RateLimitConfig = {
    windowMs: 10_000,
    max: 1,
  }

  public canHandle(command: string): boolean {
    return command.toLowerCase() === this.command
  }

  public async execute({
    userId,
    isMod,
    deps: { logger, timeoutUser },
  }: CommandContext): Promise<void> {
    if (!userId) {
      return
    }
    if (isMod) {
      logger.info("[COMMAND] [VANISH] Mod attempted to use !vanish command. Ignoring.")
      return
    }

    await timeoutUser({
      durationInSeconds: this.durationInSeconds,
      userIdToTimeout: userId,
      reason: "!vanish",
    })
    return
  }
}
