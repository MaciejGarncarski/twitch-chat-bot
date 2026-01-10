# Dokumentacja Komend Bota

Ten dokument zawiera pełną dokumentację wszystkich dostępnych komend w systemie Song Request dla Twitch.

## Spis Treści

- [Komendy Użytkownika](#komendy-użytkownika)
- [Komendy Moderatora](#komendy-moderatora)
- [Limity Wykorzystania](#limity-wykorzystania)

---

## Komendy Użytkownika

### !sr (Song Request)

Dodaje utwór do kolejki odtwarzania.

**Użycie:**
```
!sr <link YouTube | fraza wyszukiwania>
```

**Przykłady:**
```
!sr https://www.youtube.com/watch?v=dQw4w9WgXcQ
!sr Rick Astley Never Gonna Give You Up
```

**Opis:**
- Akceptuje bezpośrednie linki do filmów YouTube lub frazę wyszukiwania
- Po dodaniu utworu bot wyświetli: tytuł, długość, pozycję w kolejce oraz przewidywany czas odtwarzania
- Utwory wyszukiwane przez frazę używają algorytmu wyszukiwania YouTube

**Limit:** 1 request na 8 sekund

**Możliwe błędy:**
- `ALREADY_EXISTS` - Utwór jest już w kolejce
- `QUEUE_FULL` - Kolejka jest pełna
- Błąd wyszukiwania - Nie znaleziono utworu dla podanej frazy

---

### !song

Wyświetla informacje o aktualnie odtwarzanym utworze.

**Użycie:**
```
!song
```

**Opis:**
- Pokazuje tytuł utworu
- Wyświetla kto dodał utwór
- Pokazuje ile czasu pozostało do końca utworu

**Limit:** 3 requesty na 5 sekund

**Przykładowa odpowiedź:**
```
Aktualny utwór to Never Gonna Give You Up (dodany przez @Username). Pozostało do końca: 2:45.
```

---

### !queue

Wyświetla kolejkę oczekujących utworów.

**Użycie:**
```
!queue
```

**Opis:**
- Pokazuje pierwsze 5 utworów w kolejce
- Wyświetla numery pozycji oraz tytuły utworów
- Informuje jeśli kolejka jest pusta

**Limit:** 1 request na 60 sekund

**Przykładowa odpowiedź:**
```
Aktualna kolejka:
1. Never Gonna Give You Up, 2. Bohemian Rhapsody, 3. Smells Like Teen Spirit, 4. Stairway to Heaven, 5. Hotel California
```

---

### !help

Wyświetla listę dostępnych komend.

**Użycie:**
```
!help
```

**Opis:**
- Pokazuje wszystkie komendy dostępne dla użytkownika
- Moderatorzy widzą również komendy dostępne tylko dla moderatorów
- Wyświetla składnię każdej komendy

**Limit:** 1 request na 60 sekund

---

### !next

Wyświetla informacje o następnym utworze w kolejce.

**Użycie:**
```
!next
```

**Opis:**
- Pokazuje tytuł następnego utworu
- Wyświetla przewidywany czas rozpoczęcia odtwarzania
- Informuje jeśli brak następnego utworu w kolejce

**Limit:** 3 requesty na 5 sekund

**Przykładowa odpowiedź:**
```
Następny utwór: Bohemian Rhapsody odtwarzany za około 3:21.
```

---

### !wrongsong

Usuwa ostatnio dodany utwór przez użytkownika z kolejki.

**Użycie:**
```
!wrongsong
```

**Opis:**
- Usuwa najnowszy utwór dodany przez użytkownika
- Nie może usunąć aktualnie odtwarzanego utworu
- Działa tylko na utwory w kolejce (nie odtwarzone)

**Limit:** 1 request na 15 sekund

**Ograniczenia:**
- Nie można usunąć utworu który jest obecnie odtwarzany
- Usuwa tylko ostatni dodany utwór przez użytkownika

---

### !voteskip

Głosuje za pominięciem aktualnie odtwarzanego utworu.

**Użycie:**
```
!voteskip
```

**Opis:**
- Wymaga określonej liczby głosów do pominięcia utworu
- Każdy użytkownik może zagłosować raz per utwór
- Po osiągnięciu wymaganej liczby głosów utwór zostaje pominięty
- Licznik głosów resetuje się po każdym utworze

**Limit:** 2 requesty na 8 sekund

**Przykładowa odpowiedź:**
```
[VOTESKIP] [3/5] @Username zagłosował za pominięciem utworu.
```

**Po osiągnięciu wymaganej liczby głosów:**
```
[VOTESKIP] [5/5] Pominięto utwór Never Gonna Give You Up (dodany przez @Username).
```

---

### !github

Wyświetla link do repozytorium projektu na GitHubie.

**Użycie:**
```
!github
```

**Opis:**
- Pokazuje link do kodu źródłowego bota
- Użyteczne dla osób zainteresowanych rozwojem lub zgłaszaniem błędów

**Limit:** 2 requesty na 30 sekund

**Odpowiedź:**
```
Link do repozytorium: https://github.com/maciejgarncarski/twitch-chat-bot
```

---

### !playlist

Dodaje utwory z playlisty YouTube do kolejki.

**Użycie:**
```
!playlist <nazwa playlisty | link do playlisty>
```

**Przykłady:**
```
!playlist https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxx
!playlist Top Rock Songs 2024
```

**Opis:**
- Akceptuje link do playlisty YouTube lub nazwę playlisty do wyszukania
- Dodaje tyle utworów ile jest dostępnych slotów w kolejce
- Pomija utwory które nie spełniają wymagań (np. zbyt długie)
- Pokazuje ile utworów zostało dodanych i ile pominięto

**Limit:** 3 requesty na 5 sekund

**Przykładowa odpowiedź:**
```
Dodano 15 utworów z playlisty do kolejki! https://www.youtube.com/playlist?list=PLxxxxxx
```

**Gdy niektóre utwory zostały pominięte:**
```
Dodano 12 utworów z playlisty (3 pominięto). https://www.youtube.com/playlist?list=PLxxxxxx
```

---

### !fill

Wypełnia kolejkę utworami na podstawie frazy wyszukiwania.

**Użycie:**
```
!fill <fraza wyszukiwania>
```

**Przykłady:**
```
!fill rock music
!fill 80s hits
!fill chill lofi
```

**Opis:**
- Wyszukuje utwory pasujące do frazy
- Dodaje losowe utwory do kolejki dopóki nie zostanie zapełniona
- Filtruje utwory według długości (minimalna i maksymalna)
- Pokazuje ile utworów zostało dodanych

**Limit:** 3 requesty na 5 sekund

**Przykładowa odpowiedź:**
```
Dodano 25 piosenek do kolejki dla: rock music
```

**Gdy niektóre utwory się nie powiodły:**
```
Dodano 20 piosenek do kolejki dla: rock music (5 nie udało się dodać)
```

---

### !vanish

Nadaje użytkownikowi timeout na 3 sekundy (żart/zabawa).

**Użycie:**
```
!vanish
```

**Opis:**
- Nadaje użytkownikowi który użył komendy timeout na 3 sekundy
- Nie działa dla moderatorów
- Używane jako zabawna funkcja dla społeczności

**Limit:** 1 request na 10 sekund

**Uwaga:** Komenda nie działa dla moderatorów - jest ignorowana.

---

## Komendy Moderatora

### !skip

Pomija aktualnie odtwarzany utwór.

**Użycie:**
```
!skip
```

**Opis:**
- Natychmiast pomija bieżący utwór i rozpoczyna następny
- Użytkownik który dodał utwór może również użyć tej komendy na swoim utworze
- Wymaga uprawnień moderatora (chyba że to własny utwór użytkownika)

**Limit:** 2 requesty na 5 sekund

**Przykładowa odpowiedź:**
```
Pominięto utwór Never Gonna Give You Up (dodany przez @Username).
```

---

### !pause

Wstrzymuje odtwarzanie.

**Użycie:**
```
!pause
```

**Opis:**
- Zatrzymuje odtwarzanie na bieżącej pozycji
- Można wznowić używając `!play`
- Wymaga uprawnień moderatora

**Limit:** 2 requesty na 5 sekund

---

### !play

Wznawia odtwarzanie.

**Użycie:**
```
!play
```

**Opis:**
- Wznawia odtwarzanie z miejsca w którym zostało zatrzymane
- Wymaga uprawnień moderatora

**Limit:** 2 requesty na 5 sekund

---

### !volume

Ustawia lub wyświetla głośność.

**Użycie:**
```
!volume [0-100]
```

**Przykłady:**
```
!volume         # Wyświetla aktualną głośność
!volume 50      # Ustawia głośność na 50%
!volume 100     # Ustawia głośność na 100%
```

**Opis:**
- Bez parametru - wyświetla aktualną głośność
- Z parametrem (0-100) - ustawia głośność na podaną wartość
- Wymaga uprawnień moderatora

**Limit:** 3 requesty na 5 sekund

**Przykładowe odpowiedzi:**
```
Aktualna głośność to 75%.
Ustawiono głośność na 50%.
```

---

### !seek

Przewija do określonego momentu w utworze.

**Użycie:**
```
!seek <ss | mm:ss>
```

**Przykłady:**
```
!seek 45        # Przewija do 45 sekundy
!seek 2:30      # Przewija do 2 minuty i 30 sekundy
!seek 1:05      # Przewija do 1 minuty i 5 sekund
```

**Opis:**
- Akceptuje format sekund (np. 45) lub minut:sekund (np. 2:30)
- Nie można przewinąć poza długość utworu
- Wymaga uprawnień moderatora

**Limit:** 3 requesty na 5 sekund

**Możliwe błędy:**
```
Nie można przewinąć do 300s, ponieważ utwór trwa tylko 240s.
```

---

### !loop

Włącza/wyłącza tryb pętli.

**Użycie:**
```
!loop
```

**Opis:**
- Przełącza tryb zapętlania utworów
- W trybie loop utwory wracają na koniec kolejki po odtworzeniu
- Wymaga uprawnień moderatora

**Limit:** 3 requesty na 5 sekund

**Przykładowe odpowiedzi:**
```
Loop włączony.
Loop wyłączony.
```

---

### !remove

Usuwa utwór z określonej pozycji w kolejce.

**Użycie:**
```
!remove <pozycja>
```

**Przykłady:**
```
!remove 3       # Usuwa utwór z pozycji 3
!remove 1       # Usuwa pierwszy utwór w kolejce
```

**Opis:**
- Usuwa utwór na podstawie jego pozycji w kolejce
- Numery pozycji zaczynają się od 1
- Wymaga uprawnień moderatora

**Limit:** 3 requesty na 5 sekund

**Przykładowa odpowiedź:**
```
Usunięto utwór "Never Gonna Give You Up" z pozycji 3.
```

**Gdy pozycja nie istnieje:**
```
Nie ma utworu na pozycji 10.
```

---

### !shuffle

Tasuje kolejkę utworów.

**Użycie:**
```
!shuffle
```

**Opis:**
- Losowo zmienia kolejność utworów w kolejce
- Nie wpływa na aktualnie odtwarzany utwór
- Wymaga uprawnień moderatora

**Limit:** 3 requesty na 5 sekund

**Przykładowa odpowiedź:**
```
Kolejka została przetasowana.
```

---

### !clearall

Czyści całą kolejkę utworów.

**Użycie:**
```
!clearall
```

**Opis:**
- Usuwa wszystkie utwory z kolejki
- Zatrzymuje odtwarzanie
- Wymaga uprawnień moderatora
- **Uwaga:** Ta operacja jest nieodwracalna!

**Limit:** 3 requesty na 5 sekund

**Przykładowa odpowiedź:**
```
Kolejka została wyczyszczona.
```

---

### !wrongsongall

Usuwa wszystkie utwory użytkownika z kolejki.

**Użycie:**
```
!wrongsongall
```

**Opis:**
- Usuwa wszystkie utwory dodane przez użytkownika który użył komendy
- Nie usuwa aktualnie odtwarzanego utworu
- Działa tylko na utwory w kolejce (nieodtworzone)
- Wymaga dostępu do danych eventu

**Limit:** 1 request na 15 sekund

**Przykładowa odpowiedź:**
```
Usunięto 3 utwory z kolejki.
Usunięto 1 utwór z kolejki.
```

---

## Limity Wykorzystania

Każda komenda ma limit rate-limiting aby zapobiec spamowi:

| Komenda | Okno czasowe | Maksymalna liczba użyć |
|---------|--------------|------------------------|
| !sr | 8 sekund | 1 |
| !song | 5 sekund | 3 |
| !queue | 60 sekund | 1 |
| !help | 60 sekund | 1 |
| !next | 5 sekund | 3 |
| !wrongsong | 15 sekund | 1 |
| !wrongsongall | 15 sekund | 1 |
| !voteskip | 8 sekund | 2 |
| !github | 30 sekund | 2 |
| !playlist | 5 sekund | 3 |
| !fill | 5 sekund | 3 |
| !vanish | 10 sekund | 1 |
| !skip | 5 sekund | 2 |
| !pause | 5 sekund | 2 |
| !play | 5 sekund | 2 |
| !volume | 5 sekund | 3 |
| !seek | 5 sekund | 3 |
| !loop | 5 sekund | 3 |
| !remove | 5 sekund | 3 |
| !shuffle | 5 sekund | 3 |
| !clearall | 5 sekund | 3 |

---

## Kody Błędów

### QueueError
- `ALREADY_EXISTS` - Utwór jest już w kolejce
- `QUEUE_FULL` - Kolejka osiągnęła maksymalną pojemność

### CommandError
- `NOT_A_MOD` - Komenda wymaga uprawnień moderatora
- `CANNOT_SKIP_SONG` - Nie można pominąć tego utworu (nie jesteś właścicielem ani moderatorem)
- `EVENT_NOT_FOUND` - Brak wymaganych danych eventu
- `INVALID_COMMAND_FORMAT` - Nieprawidłowy format komendy

---

## Dodatkowe Informacje

### Wymagania dla utworów
- **Minimalna długość:** Określona w konfiguracji (`MIN_VIDEO_DURATION_SECONDS`)
- **Maksymalna długość:** Określona w konfiguracji (`MAX_VIDEO_DURATION_SECONDS`)
- **Źródło:** Tylko filmy z YouTube

### System głosowania (VoteSkip)
- Liczba wymaganych głosów jest dynamicznie obliczana
- Głosy resetują się po każdym utworze
- Jeden użytkownik może zagłosować raz per utwór
- Duplikaty głosów są ignorowane

### Kolejka
- Maksymalna liczba utworów w kolejce jest ograniczona
- Utwory są odtwarzane w kolejności FIFO (First In, First Out)
- W trybie loop utwory wracają na koniec kolejki

### Prefiks Komend
- Domyślny prefiks komend można znaleźć w konfiguracji (`env.COMMAND_PREFIX`)
- Wszystkie komendy są case-insensitive (wielkość liter nie ma znaczenia)

---

*Ostatnia aktualizacja: 10 stycznia 2026*
