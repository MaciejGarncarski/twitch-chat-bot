import { CommandHandler, CommandContext } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { CommandError, CommandErrorCode } from "@/types/errors"
import { t } from "@/i18n/i18n"

export class VolumeCommandHandler extends CommandHandler {
  private readonly regex = /^volume(?:\s+(100|[1-9]?\d))?\s*$/i

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  canHandle(command: string): boolean {
    return this.regex.test(command)
  }

  async execute({
    deps: { playbackManager, sendChatMessage },
    payload,
    sanitizedCommand,
    messageId,
    isMod,
  }: CommandContext) {
    if (!payload.event) {
      throw new CommandError(CommandErrorCode.EVENT_NOT_FOUND)
    }

    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    const match = sanitizedCommand.match(this.regex)
    const isSetVolumeCommand = match ? match[1] !== undefined : false

    if (!isSetVolumeCommand) {
      const volume = playbackManager.getVolume()
      await sendChatMessage(t("commands.volume.current", { volume }), messageId)
      return
    }

    if (!match || !messageId) {
      throw new Error("Not matching VOLUME command or missing messageId.")
    }

    const volume = parseInt(match[1])

    if (volume > 100 || volume < 0) {
      return
    }

    playbackManager.setVolume(volume)

    await sendChatMessage(t("commands.volume.set", { volume }), messageId)
  }
}
