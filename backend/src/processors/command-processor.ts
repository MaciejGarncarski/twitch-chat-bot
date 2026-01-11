import { sendChatMessage } from "@/api/send-chat-message"
import { timeoutUser } from "@/api/timeout-user"
import { CommandHandler, ContextDeps } from "@/commands/command"
import { env } from "@/config/env"
import { songRequestEngine } from "@/core/song-request-engine"
import { ChatBadge, checkIsMod } from "@/helpers/check-is-mod"
import { logger } from "@/helpers/logger"
import { rateLimiter } from "@/helpers/rate-limit"
import { sanitizeMessage } from "@/helpers/sanitize-message"
import { CommandError, CommandErrorCode } from "@/types/errors"
import { ITwitchAuthManager } from "@/types/twitch-auth"
import { MessageFragments, TwitchWSMessage } from "@/types/twitch-ws-message"

type CommandInfo = {
  sanitizedCommand: string
  username: string
  normalizedUser: string
  userId: string | undefined
  messageId: string | undefined
  isMod: boolean
}

export class CommandProcessor {
  private readonly COMMAND_PREFIX = env.COMMAND_PREFIX

  constructor(
    private handlers: CommandHandler[],
    private twitchAuth: ITwitchAuthManager,
  ) {}

  async process(parsed: TwitchWSMessage) {
    if (parsed.metadata.message_type !== "notification") {
      return
    }

    const commandInfo = this.extractCommandInfo(parsed)
    if (!commandInfo) {
      return
    }

    if (!this.checkGlobalRateLimit(commandInfo.normalizedUser, commandInfo.isMod)) {
      return
    }

    const deps = this.createContextDeps()
    const handler = this.findHandler(commandInfo.sanitizedCommand)

    if (!handler) {
      return
    }

    await this.executeCommand(handler, commandInfo, deps, parsed)
  }

  private extractCommandInfo(parsed: TwitchWSMessage): CommandInfo | null {
    const commandFromMention = this.extractCommandFromMention(
      parsed.payload.event?.message?.fragments || [],
    )
    const messageText = parsed.payload.event?.message?.text.trim()

    if (!messageText) {
      logger.warn("[COMMAND] Received message without text.")
      return null
    }

    if (!this.isCommandForBot(messageText) && !commandFromMention) {
      return null
    }

    const username =
      parsed.payload.event?.chatter_user_login || parsed.payload.event?.chatter_user_name

    if (!username) {
      logger.warn("[COMMAND] Received message without username.")
      return null
    }

    const messageId = parsed.payload.event?.message_id
    const userId = parsed.payload.event?.chatter_user_id
    const badges = parsed.payload.event?.badges
    const chatterId = parsed.payload.event?.chatter_user_id
    const broadcasterId = parsed.payload.event?.broadcaster_user_id

    const normalizedUser = username.toLowerCase()
    const isMod = this.checkUserPermissions(badges, chatterId, broadcasterId, normalizedUser)

    const sanitizedMessage = sanitizeMessage(commandFromMention || messageText).toLowerCase()
    const sanitizedCommand = sanitizedMessage.slice(env.COMMAND_PREFIX.length).trim()

    return {
      sanitizedCommand,
      username,
      normalizedUser,
      userId,
      messageId,
      isMod,
    }
  }

  private checkUserPermissions(
    badges: ChatBadge[] | null | undefined,
    chatterId: string | undefined,
    broadcasterId: string | undefined,
    normalizedUser: string,
  ): boolean {
    const usersTreatedAsMods = env.USERS_TREATED_AS_MODERATORS
    const isModUser = checkIsMod(badges, chatterId, broadcasterId)
    return isModUser || usersTreatedAsMods.includes(normalizedUser)
  }

  private checkGlobalRateLimit(normalizedUser: string, isMod: boolean): boolean {
    if (isMod) {
      return true
    }

    const globalRateResult = rateLimiter.check(`global:${normalizedUser}`)

    if (!globalRateResult.allowed) {
      const retrySeconds = Math.max(1, Math.ceil((globalRateResult.retryIn ?? 0) / 1000))

      logger.warn(
        `[COMMAND] [RATE_LIMIT] Global limit hit for ${normalizedUser}. Retry in ${retrySeconds}s`,
      )

      return false
    }

    return true
  }

  private createContextDeps(): ContextDeps {
    return {
      songQueue: songRequestEngine.getSongQueue(),
      playbackManager: songRequestEngine.getPlaybackManager(),
      voteManager: songRequestEngine.getVoteManager(),
      logger,
      sendChatMessage,
      timeoutUser: timeoutUser,
    }
  }

  private findHandler(sanitizedCommand: string): CommandHandler | null {
    for (const handler of this.handlers) {
      if (handler.canHandle(sanitizedCommand)) {
        return handler
      }
    }
    return null
  }

  private async executeCommand(
    handler: CommandHandler,
    commandInfo: CommandInfo,
    deps: ContextDeps,
    parsed: TwitchWSMessage,
  ): Promise<void> {
    if (!this.checkCommandRateLimit(handler, commandInfo.normalizedUser, commandInfo.isMod)) {
      return
    }

    try {
      logger.info(`[COMMAND] [EXEC] ${handler.constructor.name}`)
      await handler.execute({
        payload: parsed.payload,
        deps,
        sanitizedCommand: commandInfo.sanitizedCommand,
        userId: commandInfo.userId,
        username: commandInfo.normalizedUser,
        messageId: commandInfo.messageId,
        isMod: commandInfo.isMod,
      })
    } catch (error) {
      await this.handleCommandError(error, handler, commandInfo.messageId)
    }
  }

  private checkCommandRateLimit(
    handler: CommandHandler,
    normalizedUser: string,
    isMod: boolean,
  ): boolean {
    const commandRateConfig = handler.rateLimit

    if (!commandRateConfig || isMod) {
      return true
    }

    const commandName = handler.constructor.name
    const commandRateResult = rateLimiter.check(
      `command:${commandName}:${normalizedUser}`,
      commandRateConfig,
    )

    if (!commandRateResult.allowed) {
      const retrySeconds = Math.max(1, Math.ceil((commandRateResult.retryIn ?? 0) / 1000))

      logger.warn(
        `[COMMAND] [RATE_LIMIT] ${commandName} hit limit for ${normalizedUser}. Retry in ${retrySeconds}s`,
      )

      return false
    }

    return true
  }

  private async handleCommandError(
    error: unknown,
    handler: CommandHandler,
    messageId: string | undefined,
  ): Promise<void> {
    if (error instanceof CommandError) {
      switch (error.code) {
        case CommandErrorCode.INVALID_COMMAND_FORMAT:
          await sendChatMessage("Niepoprawny format komendy.", messageId)
          break

        case CommandErrorCode.CANNOT_SKIP_SONG:
          await sendChatMessage("Nie możesz pominąć tego utworu.", messageId)
          break

        case CommandErrorCode.NOT_A_MOD:
          await sendChatMessage("Tylko moderatorzy mogą używać tej komendy.", messageId)
          break

        case CommandErrorCode.EVENT_NOT_FOUND:
          logger.error(`[COMMAND] [ERROR] ${handler.constructor.name} Missing event in payload.`)
          break

        default:
          logger.error(
            `[COMMAND] [ERROR] ${handler.constructor.name} Unhandled CommandError: ${error.code}`,
          )
      }

      return
    }

    if (error instanceof Error) {
      logger.error(
        `[COMMAND] [ERROR] ${handler.constructor.name} Error executing command: ${error.message}`,
      )
    }
  }

  private isCommandForBot(message: string): boolean {
    return message[0] === this.COMMAND_PREFIX
  }

  private extractCommandFromMention(fragments: MessageFragments[]): string | null {
    const twitchBotUsername = this.twitchAuth.userBotUsername

    if (twitchBotUsername.trim() === "") {
      logger.error("[COMMAND] Twitch bot username is not set.")
      return null
    }

    const isFirstFragmentMention = fragments.length > 0 && fragments[0].type === "mention"

    if (!isFirstFragmentMention) {
      return null
    }

    const message = fragments
      .map((fragment) => fragment.text)
      .join("")
      .trim()

    const mentionPrefix = `@${twitchBotUsername}`

    if (message.toLowerCase().startsWith(mentionPrefix)) {
      const text = message.slice(mentionPrefix.length).trim()

      if (!this.isCommandForBot(text)) {
        const textWithPrefix = `${this.COMMAND_PREFIX}${text}`
        if (this.isCommandForBot(textWithPrefix)) {
          return textWithPrefix
        }

        return null
      }

      return text
    }

    return null
  }
}
