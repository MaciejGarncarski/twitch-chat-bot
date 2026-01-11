export const pl = {
  bot: {
    startMessage: "Bot uruchomiony!",
    startChat: "Bot uruchomiony TwitchLit",
    stopMessage: "Bot wyłączony StinkyGlitch",
  },
  reminders: {
    helpPrompt: "Wpisz {prefix}help, aby zobaczyć dostępne komendy.",
  },
  commands: {
    errors: {
      notAMod: "Tylko moderatorzy mogą używać tej komendy.",
      queueEmpty: "Kolejka jest pusta.",
      invalidFormat: "Niepoprawny format komendy.",
      cannotSkip: "Nie możesz pominąć tego utworu.",
    },
    currentSong: {
      message:
        "Aktualny utwór to {title} (dodany przez @{username}). Pozostało do końca: {duration}.",
    },
    clearall: {
      success: "Kolejka została wyczyszczona.",
    },
    play: {
      success: "Dodano do kolejki: {title}",
    },
    wrongsong: {
      cannotSkipCurrent: "@{username} Nie możesz pominąć odtwarzanego utworu.",
      removed: "Usunięto z kolejki.",
    },
    loop: {
      enabled: "Loop włączony.",
      disabled: "Loop wyłączony.",
    },
    seek: {
      beyondDuration: "Nie można przewinąć do {seek}s, ponieważ utwór trwa tylko {duration}s.",
    },
    fill: {
      queueFull: "Kolejka jest pełna! Nie można dodać więcej piosenek.",
      notFound: "Nie znaleziono pasujących utworów.",
      summaryWithErrors:
        "Dodano {added} piosenek do kolejki dla: {query} ({errors} nie udało się dodać)",
      summary: "Dodano {added} piosenek do kolejki dla: {query}",
    },
    volume: {
      current: "Aktualna głośność to {volume}%.",
      set: "Ustawiono głośność na {volume}%.",
    },
    playlist: {
      queueFull: "Kolejka jest pełna! Nie można dodać playlisty.",
      notFound: 'Nie znaleziono playlisty dla zapytania: "{query}"',
      empty: "Ta playlista jest pusta lub nie zawiera odpowiednich utworów.",
      noneAdded: "Nie udało się dodać żadnego utworu z playlisty.",
      successWithFailures: "Dodano {added} utworów z playlisty ({failed} pominięto). {url}",
      success: "Dodano {added} utworów z playlisty do kolejki! {url}",
    },
    skip: {
      skipped: "Pominięto utwór {title} (dodany przez @{username}).",
    },
    github: {
      link: "Link do repozytorium: https://github.com/maciejgarncarski/twitch-chat-bot",
    },
    queue: {
      list: "Aktualna kolejka:\n{queue}",
    },
    wrongsongall: {
      removed: "Usunięto {count} {songWord} z kolejki.",
      songSingular: "utwór",
      songPlural: "utworów",
    },
    help: {
      header: "Komendy: {commands}",
      commandDescription: {
        sr: "<link_lub_fraza>",
        song: "",
        queue: "",
        help: "",
        wrongsong: "",
        wrongsongall: "",
        github: "",
        voteskip: "",
        skip: "",
        next: "- informacje o nast.",
        playlist: "<nazwa_lub_link>",
        fill: "<fraza>",
        ui: "- interfejs web",
        vanish: "",
        pause: "",
        play: "",
        volume: "<0-100>",
        seek: "<ss_lub_mm:ss>",
        loop: "",
        remove: "<pozycja>",
        shuffle: "",
        clearall: "",
      },
    },
    next: {
      noCurrent: "Żaden utwór nie jest obecnie odtwarzany.",
      noNext: "Brak następnego utworu.",
      message: "Następny utwór: {title} odtwarzany za około {duration}.",
    },
    remove: {
      notFound: "Nie ma utworu na pozycji {position}.",
      removed: 'Usunięto utwór "{title}" z pozycji {position}.',
    },
    frontend: {
      link: "UI: https://bot.maciej-garncarski.pl/",
    },
    sr: {
      added:
        "Dodano do kolejki {title} przez @{username} (długość: {duration}). Pozycja w kolejce {position}. Odtwarzanie {playTime}.",
      failed:
        "FootYellow Nie udało się dodać do kolejki. Tytuł: {title}, Długość: {duration}, Link: {link}",
      alreadyExists: "FootYellow Ten filmik jest już w kolejce!",
      queueFull: "PoroSad Kolejka jest pełna! Spróbuj ponownie później.",
      tooShort: "FootYellow Filmik jest za krótki.",
      tooLong: "FootYellow Filmik jest za długi.",
      playNow: "teraz",
      playIn: "za około {duration}",
    },
    shuffle: {
      success: "Kolejka została przetasowana.",
    },
    voteskip: {
      voteReceived: "[VOTESKIP] [{votes}/{needed}] @{username} zagłosował za pominięciem utworu.",
      skipped: "[VOTESKIP] [{votes}/{needed}] Pominięto utwór {title} (dodany przez @{username}).",
    },
  },
  common: {
    None: "Brak",
  },
} as const
