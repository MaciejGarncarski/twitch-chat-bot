import { backupPlaylistManager } from "@/core/backup-playlist-manager"
import { CommandContext, CommandHandler } from "@/commands/command"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { t } from "@/i18n/i18n"
import { CommandError, CommandErrorCode } from "@/types/command-errors"

export class BackupCommandHandler extends CommandHandler {
  private readonly regex = /^backup(?:\s+(.+))?$/i

  rateLimit: RateLimitConfig = {
    windowMs: 5000,
    max: 3,
  }

  public canHandle(command: string): boolean {
    return this.regex.test(command)
  }

  public async execute({
    sanitizedCommand,
    deps,
    isMod,
    messageId,
  }: CommandContext): Promise<void> {
    if (!isMod) {
      throw new CommandError(CommandErrorCode.NOT_A_MOD)
    }

    const match = sanitizedCommand.match(this.regex)
    if (!match) return

    const arg = match[1]?.trim()

    if (!arg) {
      const status = backupPlaylistManager.getStatus()
      if (!status.playlistUrl) {
        await deps.sendChatMessage(t("commands.backup.empty"), messageId)
        return
      }
      await deps.sendChatMessage(
        t("commands.backup.status", {
          url: status.playlistUrl,
          remaining: status.remaining,
          total: status.videoIds.length,
        }),
        messageId,
      )
      return
    }

    if (arg.toLowerCase() === "clear") {
      backupPlaylistManager.clear()
      await deps.sendChatMessage(t("commands.backup.cleared"), messageId)
      return
    }

    if (arg.toLowerCase() === "refill") {
      try {
        const total = await backupPlaylistManager.refill()
        await deps.sendChatMessage(t("commands.backup.refilled", { total }), messageId)
      } catch {
        await deps.sendChatMessage(t("commands.backup.noUrl"), messageId)
      }
      return
    }

    try {
      const total = await backupPlaylistManager.setPlaylist(arg)
      await deps.sendChatMessage(t("commands.backup.set", { total }), messageId)
    } catch {
      await deps.sendChatMessage(t("commands.backup.invalidUrl"), messageId)
    }
  }
}
