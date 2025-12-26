import { sendChatMessage } from '@/api/send-chat-message'
import { CommandHandler, Deps } from '@/commands/command'
import { songRequestEngine } from '@/core/song-request-engine'
import { checkIsMod } from '@/helpers/check-is-mod'
import { logger } from '@/helpers/logger'
import { rateLimiter } from '@/helpers/rate-limit'
import { sanitizeMessage } from '@/helpers/sanitize-message'
import { CommandError, CommandErrorCode } from '@/types/errors'
import { TwitchWSMessage } from '@/types/twitch-ws-message'

class CommandProcessor {
  handlers: CommandHandler[]

  constructor(handlers: CommandHandler[]) {
    this.handlers = handlers
  }

  async process(parsed: TwitchWSMessage) {
    if (parsed.metadata.message_type !== 'notification') {
      return
    }

    const messageText = parsed.payload.event?.message?.text.trim()

    if (!messageText) {
      logger.warn('[COMMAND] Received message without text.')
      return
    }

    const sanitizedMessage = sanitizeMessage(messageText)
    const messageId = parsed.payload.event?.message_id
    const username =
      parsed.payload.event?.chatter_user_login || parsed.payload.event?.chatter_user_name
    const badges = parsed.payload.event?.badges
    const chatterId = parsed.payload.event?.chatter_user_id
    const broadcasterId = parsed.payload.event?.broadcaster_user_id

    if (!username) {
      logger.warn('[COMMAND] Received message without username.')
      return
    }

    const normalizedUser = username.toLowerCase()
    const isMod = checkIsMod(badges, chatterId, broadcasterId)

    if (!isMod) {
      const globalRateResult = rateLimiter.check(`global:${normalizedUser}`)

      if (!globalRateResult.allowed) {
        const retrySeconds = Math.max(1, Math.ceil((globalRateResult.retryIn ?? 0) / 1000))

        logger.warn(
          `[COMMAND] [RATE_LIMIT] Global limit hit for ${normalizedUser}. Retry in ${retrySeconds}s`,
        )

        return
      }
    }

    const songQueue = songRequestEngine.getSongQueue()
    const playbackManager = songRequestEngine.getPlaybackManager()
    const voteManager = songRequestEngine.getVoteManager()

    const deps: Deps = {
      songQueue,
      logger,
      sendChatMessage,
      playbackManager,
      voteManager,
    }

    for (const handler of this.handlers) {
      const canHandle = handler.canHandle(sanitizedMessage)
      if (!canHandle) {
        continue
      }

      try {
        const commandName = handler.constructor.name
        const commandRateConfig = handler.rateLimit

        if (commandRateConfig && !isMod) {
          const commandRateResult = rateLimiter.check(
            `command:${commandName}:${normalizedUser}`,
            commandRateConfig,
          )

          if (!commandRateResult.allowed) {
            const retrySeconds = Math.max(1, Math.ceil((commandRateResult.retryIn ?? 0) / 1000))

            logger.warn(
              `[COMMAND] [RATE_LIMIT] ${commandName} hit limit for ${normalizedUser}. Retry in ${retrySeconds}s`,
            )

            return
          }
        }

        logger.info(`[COMMAND] [EXEC] ${handler.constructor.name}`)
        await handler.execute({
          payload: parsed.payload,
          deps,
          sanitizedMessage,
          username: normalizedUser,
          messageId,
          isMod,
        })
        return
      } catch (error) {
        if (error instanceof CommandError) {
          switch (error.code) {
            case CommandErrorCode.INVALID_COMMAND_FORMAT:
              await sendChatMessage('Niepoprawny format komendy.', messageId)
              break

            case CommandErrorCode.CANNOT_SKIP_SONG:
              await sendChatMessage('Nie możesz pominąć tego utworu.', messageId)
              break

            case CommandErrorCode.NOT_A_MOD:
              await sendChatMessage('Tylko moderatorzy mogą używać tej komendy.', messageId)
              break

            case CommandErrorCode.EVENT_NOT_FOUND:
              logger.error(
                `[COMMAND] [ERROR] ${handler.constructor.name} Missing event in payload.`,
              )
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
    }
  }
}

export default CommandProcessor
