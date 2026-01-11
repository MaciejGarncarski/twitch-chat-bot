import { describe, expect, test } from "bun:test"
import { pl } from "@/i18n/locales/pl"
import { en } from "@/i18n/locales/en"

describe("i18n", () => {
  test("pl locale has expected translations", () => {
    expect(pl.commands.volume.current).toBe("Aktualna głośność to {volume}%.")
    expect(pl.commands.errors.queueEmpty).toBe("Kolejka jest pusta.")
    expect(pl.bot.startChat).toBe("Bot uruchomiony TwitchLit")
  })

  test("en locale has expected translations", () => {
    expect(en.commands.errors.queueEmpty).toBe("The queue is empty.")
    expect(en.commands.volume.set).toBe("Volume set to {volume}%.")
    expect(en.bot.stopMessage).toBe("Bot stopped StinkyGlitch")
  })

  test("pl and en locales have matching structure", () => {
    const plKeys = Object.keys(pl)
    const enKeys = Object.keys(en)

    expect(plKeys).toEqual(enKeys)
  })
})
