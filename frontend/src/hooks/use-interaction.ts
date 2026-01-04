import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "user-has-interacted"

export function useInteraction() {
  const [hasInteracted, setHasInteracted] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) === "true"
  })

  const handleInteract = useCallback(() => {
    setHasInteracted(true)
    sessionStorage.setItem(STORAGE_KEY, "true")
  }, [])

  useEffect(() => {
    if (hasInteracted) return

    const handleUserInteraction = () => {
      handleInteract()
    }

    const events = ["click", "keydown", "touchstart"]
    for (const event of events) {
      document.addEventListener(event, handleUserInteraction, { once: true })
    }

    return () => {
      for (const event of events) {
        document.removeEventListener(event, handleUserInteraction)
      }
    }
  }, [hasInteracted, handleInteract])

  return { hasInteracted, handleInteract }
}
