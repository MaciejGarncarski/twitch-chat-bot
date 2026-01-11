import { createContext, useContext, useState } from "react"

type Language = "en" | "pl"

type I18nProviderProps = {
  children: React.ReactNode
  defaultLanguage?: Language
  storageKey?: string
}

type I18nProviderState = {
  language: Language
  setLanguage: (language: Language) => void
}

const initialState: I18nProviderState = {
  language: "pl",
  setLanguage: () => null,
}

const I18nProviderContext = createContext<I18nProviderState>(initialState)

export function I18nProvider({
  children,
  defaultLanguage = "pl",
  storageKey = "bot-ui-language",
  ...props
}: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage,
  )

  const value = {
    language,
    setLanguage: (language: Language) => {
      localStorage.setItem(storageKey, language)
      setLanguage(language)
    },
  }

  return (
    <I18nProviderContext.Provider {...props} value={value}>
      {children}
    </I18nProviderContext.Provider>
  )
}

export const useI18n = () => {
  const context = useContext(I18nProviderContext)

  if (context === undefined) throw new Error("useI18n must be used within a I18nProvider")

  return context
}
