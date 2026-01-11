import { env } from "@/config/env"
import { TKey } from "@/i18n/types"

interface BaseCyclicMessageConfig {
  id: string
  intervalMs: number
  minMessagesBetween: number
  requireLive: boolean
}

interface RawMessageConfig extends BaseCyclicMessageConfig {
  message: string
  messageKey?: never
  messageParams?: never
}

interface TranslatedMessageConfig extends BaseCyclicMessageConfig {
  message?: never
  messageKey: TKey
  messageParams?: Record<string, string | number>
}

export type CyclicMessageConfig = RawMessageConfig | TranslatedMessageConfig

export const cyclicMessages: CyclicMessageConfig[] = [
  {
    id: "help-reminder",
    messageKey: "reminders.helpPrompt",
    messageParams: { prefix: env.COMMAND_PREFIX },
    intervalMs: 5 * 60 * 1000, // 5 minutes
    minMessagesBetween: 20,
    requireLive: true,
  },
  {
    id: "song-request-reminder",
    messageKey: "reminders.songRequestPrompt",
    messageParams: { prefix: env.COMMAND_PREFIX },
    intervalMs: 7 * 60 * 1000, // 7 minutes
    minMessagesBetween: 20,
    requireLive: true,
  },
]
