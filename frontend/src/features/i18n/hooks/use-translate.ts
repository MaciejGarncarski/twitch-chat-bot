import { useI18n } from "@/features/i18n/components/i18n-provider"
import { t } from "@/i18n/i18n"
import type { TKey, TranslationParams } from "@/i18n/types"

export function useTranslate() {
  const { language } = useI18n()

  const translate = <K extends TKey>(key: K, params?: TranslationParams<K>) => {
    return t(language, key, params)
  }

  return {
    t: translate,
  }
}
