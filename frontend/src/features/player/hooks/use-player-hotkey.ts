import { useHotkeys } from "react-hotkeys-hook"

const hotkeyOptions = {
  enableOnFormTags: false,
  preventDefault: true,
}

export function usePlayerHotkey(shortcut: string, action: () => void, deps: unknown[]) {
  useHotkeys(shortcut, action, hotkeyOptions, deps)
}
