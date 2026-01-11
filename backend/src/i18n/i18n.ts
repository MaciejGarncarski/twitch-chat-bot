import { env } from "@/config/env"
import { en } from "@/i18n/locales/en"
import { pl } from "@/i18n/locales/pl"
import { TKey, TranslationParams, TranslationSchema } from "@/i18n/types"

const languages: Record<string, TranslationSchema> = { en, pl }

const selectedLang: TranslationSchema = languages[env.APP_LANG] || en

export function t<K extends TKey>(key: K, params?: TranslationParams<K>): string {
  const keys = key.split(".")
  let value: unknown = selectedLang

  for (const k of keys) {
    value =
      typeof value === "object" && value !== null
        ? (value as Record<string, unknown>)[k]
        : undefined
  }

  if (typeof value !== "string") return key

  if (params) {
    return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
      return acc.replace(new RegExp(`{${paramKey}}`, "g"), String(paramValue))
    }, value)
  }

  return value
}
