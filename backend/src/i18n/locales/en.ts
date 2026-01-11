import { TranslationSchema } from "@/i18n/types"

export const en: TranslationSchema = {
  bot: {
    startMessage: "Bot started!",
    startChat: "Bot is online TwitchLit",
    stopMessage: "Bot stopped StinkyGlitch",
  },
  reminders: {
    helpPrompt: "Type {prefix}help to see available commands.",
  },
  commands: {
    errors: {
      notAMod: "Only moderators can use this command.",
      queueEmpty: "The queue is empty.",
      invalidFormat: "Invalid command format.",
      cannotSkip: "You cannot skip this song.",
    },
    currentSong: {
      message: "Current song: {title} (added by @{username}). Time left: {duration}.",
    },
    clearall: {
      success: "The queue has been cleared.",
    },
    play: {
      success: "Added to queue: {title}",
    },
    wrongsong: {
      cannotSkipCurrent: "@{username} You cannot skip the currently playing song.",
      removed: "Removed from the queue.",
    },
    loop: {
      enabled: "Loop enabled.",
      disabled: "Loop disabled.",
    },
    seek: {
      beyondDuration: "Cannot seek to {seek}s because the song is only {duration}s long.",
    },
    fill: {
      queueFull: "The queue is full! Cannot add more songs.",
      notFound: "No matching songs found.",
      summaryWithErrors: "Added {added} songs to the queue for: {query} ({errors} failed to add)",
      summary: "Added {added} songs to the queue for: {query}",
    },
    volume: {
      current: "Current volume is {volume}%.",
      set: "Volume set to {volume}%.",
    },
    playlist: {
      queueFull: "The queue is full! Cannot add a playlist.",
      notFound: 'Playlist not found for query: "{query}"',
      empty: "This playlist is empty or has no eligible songs.",
      noneAdded: "Failed to add any songs from the playlist.",
      successWithFailures: "Added {added} songs from the playlist ({failed} skipped). {url}",
      success: "Added {added} songs from the playlist to the queue! {url}",
    },
    skip: {
      skipped: "Skipped {title} (added by @{username}).",
    },
    github: {
      link: "Repository: https://github.com/maciejgarncarski/twitch-chat-bot",
    },
    queue: {
      list: "Current queue:\n{queue}",
    },
    wrongsongall: {
      removed: "Removed {count} {songWord} from the queue.",
      songSingular: "song",
      songPlural: "songs",
    },
    help: {
      header: "Commands: {commands}",
      commandDescription: {
        sr: "<link | phrase>",
        song: "",
        queue: "",
        help: "",
        wrongsong: "",
        wrongsongall: "",
        github: "",
        voteskip: "",
        skip: "",
        next: "- next song info",
        playlist: "<name_or_link>",
        fill: "<phrase>",
        ui: "- web interface",
        vanish: "",
        pause: "",
        play: "",
        volume: "<0-100>",
        seek: "<ss_or_mm:ss>",
        loop: "",
        remove: "<position>",
        shuffle: "",
        clearall: "",
      },
    },
    next: {
      noCurrent: "No song is currently playing.",
      noNext: "No next song in the queue.",
      message: "Next song: {title} playing in about {duration}.",
    },
    remove: {
      notFound: "No song at position {position}.",
      removed: 'Removed "{title}" from position {position}.',
    },
    frontend: {
      link: "UI: https://bot.maciej-garncarski.pl/",
    },
    sr: {
      added:
        "Added to queue {title} by @{username} (length: {duration}). Queue position {position}. Playing {playTime}.",
      failed: "FootYellow Failed to add to queue. Title: {title}, Length: {duration}, Link: {link}",
      alreadyExists: "FootYellow This video is already in the queue!",
      queueFull: "PoroSad The queue is full! Try again later.",
      tooShort: "FootYellow The video is too short.",
      tooLong: "FootYellow The video is too long.",
      playNow: "now",
      playIn: "in about {duration}",
    },
    shuffle: {
      success: "Queue shuffled.",
    },
    voteskip: {
      voteReceived: "[VOTESKIP] [{votes}/{needed}] @{username} voted to skip the song.",
      skipped: "[VOTESKIP] [{votes}/{needed}] Skipped {title} (added by @{username}).",
    },
  },
  common: {
    None: "None",
  },
}
