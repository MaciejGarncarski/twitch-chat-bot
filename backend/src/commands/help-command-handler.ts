import { CommandHandler, CommandContext } from "@/commands/command"
import { env } from "@/config/env"
import { RateLimitConfig } from "@/helpers/rate-limit"

type CommandInfo = {
  modOnly: boolean
  text: string
}

type CommandsRecord = Record<string, CommandInfo>

export class HelpCommandHandler extends CommandHandler {
  private readonly command = "help"
  private readonly commands: CommandsRecord = {
    sr: { modOnly: false, text: "<link | fraza>" },
    song: { modOnly: false, text: "" },
    queue: { modOnly: false, text: "" },
    help: { modOnly: false, text: "" },
    wrongsong: { modOnly: false, text: "" },
    wrongsongall: { modOnly: true, text: "" },
    github: { modOnly: false, text: "" },
    voteskip: { modOnly: false, text: "" },
    skip: { modOnly: false, text: "" },
    next: { modOnly: false, text: "- informacje o nast." },
    playlist: { modOnly: false, text: "<nazwa / link>" },
    fill: { modOnly: false, text: "<fraza>" },
    vanish: { modOnly: true, text: "" },
    pause: { modOnly: true, text: "" },
    play: { modOnly: true, text: "" },
    volume: { modOnly: true, text: "<0-100>" },
    seek: { modOnly: true, text: "<ss | mm:ss>" },
    loop: { modOnly: true, text: "" },
    remove: { modOnly: true, text: "<pozycja>" },
    shuffle: { modOnly: true, text: "" },
    clearall: { modOnly: true, text: "" },
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

    const helpMessage = `Komendy: ${Object.entries(filteredCommands)
      .map(([cmd, desc]) => `${env.COMMAND_PREFIX}${cmd} ${desc.text}`.trim())
      .join(" | ")}`
    await sendChatMessage(helpMessage, messageId)
  }
}
