import { useTheme } from "@/components/theme-provider"
import { useEffect } from "react"

export const useDetectTheme = () => {
  const themeState = useTheme()
  const theme = themeState.theme

  useEffect(() => {
    const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)")
    const themeClassName = darkModePreference.matches ? "dark" : "light"
    const root = window.document.documentElement

    const setThemeOnChange = (e: MediaQueryListEvent) => {
      if (theme !== "system") {
        return
      }

      root.classList.remove("light", "dark")

      if (e.matches) {
        root.classList.add("dark")
        return
      }

      root.classList.add("light")
    }

    darkModePreference.addEventListener("change", setThemeOnChange)

    if (theme === "system") {
      root.classList.add(themeClassName)
    }

    return () => {
      darkModePreference.removeEventListener("change", setThemeOnChange)
    }
  }, [theme])
}
