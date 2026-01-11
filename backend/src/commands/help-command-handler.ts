import { CommandHandler, CommandContext } from "@/commands/command"
import { env } from "@/config/env"
import { RateLimitConfig } from "@/helpers/rate-limit"
import { t } from "@/i18n/i18n"
import { TKey } from "@/i18n/types"

type CommandInfo = {
  modOnly: boolean
}

type CommandsRecord = Record<string, CommandInfo>

export class HelpCommandHandler extends CommandHandler {
  private readonly command = "help"
  private readonly commands: CommandsRecord = {
    sr: { modOnly: false },
    song: { modOnly: false },
    queue: { modOnly: false },
    help: { modOnly: false },
    wrongsong: { modOnly: false },
    wrongsongall: { modOnly: true },
    github: { modOnly: false },
    voteskip: { modOnly: false },
    skip: { modOnly: false },
    next: { modOnly: false },
    playlist: { modOnly: false },
    fill: { modOnly: false },
    ui: { modOnly: false },
    vanish: { modOnly: true },
    pause: { modOnly: true },
    play: { modOnly: true },
    volume: { modOnly: true },
    seek: { modOnly: true },
    loop: { modOnly: true },
    remove: { modOnly: true },
    shuffle: { modOnly: true },
    clearall: { modOnly: true },
  }

  rateLimit: RateLimitConfig = {
    windowMs: 60000,
    max: 1,
  }

  canHandle(command: string): boolean {
    return command.toLowerCase() === this.command
  }

  async execute({ deps: { logger, sendChatMessage }, isMod, messageId }: CommandContext) {
    logger.info(`[COMMAND] [HELP] Sending help message.`)

    const filteredCommands = Object.fromEntries(
      Object.entries(this.commands)
        .sort(([a], [b]) => a.localeCompare(b))
        .filter(([_, cmd]) => (cmd.modOnly ? isMod : true)),
    )

    const commandsText = Object.entries(filteredCommands)
      .map(([cmd]) => {
        const descriptionKey = `commands.help.commandDescription.${cmd}` as TKey
        const description = t(descriptionKey)
        return `${env.COMMAND_PREFIX}${cmd} ${description}`.trim()
      })
      .join(" | ")

    await sendChatMessage(t("commands.help.header", { commands: commandsText }), messageId)
  }
}
