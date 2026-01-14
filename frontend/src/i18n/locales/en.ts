import type { TranslationSchema } from "@/i18n/types"

export const en: TranslationSchema = {
  navigation: {
    modMode: "Mod mode",
  },
  settings: {
    title: "Settings",
  },
  player: {
    needsAuthorization: "You need mod authorization",
    play: "Play",
    pause: "Pause",
    loopToggle: "Loop",
    volume: "Volume",
    seek: "Seek",
    skip: "Skip",
    shuffle: "Shuffle",
    clearAll: "Clear All",
    seekForward: "+5 sec.",
    seekBackward: "-5 sec.",
    mute: "Mute",
    unmute: "Unmute",
    decreaseVolume: "- 5%",
    increaseVolume: "+ 5%",
    loading: {
      seek: "Wait",
      sync: "Syncing...",
      clearAll: "Wait",
      pause: "Pausing",
      play: "Playing",
      loopToggle: "Toggling",
      skip: "Skipping",
      shuffle: "Shuffling",
      mute: "Toggling",
      volume: "Setting",
    },
  },
  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  queue: {
    empty: "No songs in the queue.",
    loading: "Loading queue...",
  },
  auth: {
    login: "Log In",
    logout: "Log Out",
    account: "Account",
    loading: {
      loading: "Loading...",
      logout: "Logging out...",
      login: "Loading...",
    },
  },
  interactionNotification: {
    title: "Click to enable playback",
    description: "The browser requires interaction before playing audio",
  },
  common: {
    delete: "Delete",
    en: "English",
    pl: "Polski",
    language: "Language",
    theme: "Theme",
    queue: "Queue",
    song: "Song",
  },
}
