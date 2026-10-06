import { usePlayerData } from "@/features/player/components/player-data-provider"
import { queueQueryOptions, useQueue } from "@/features/queue/hooks/use-queue"
import { createFileRoute } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import { AudioLines, Music2, UserRound } from "lucide-react"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { useEffect } from "react"

export const Route = createFileRoute("/obs")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(queueQueryOptions)
  },
  component: ObsPlayerRoute,
})

function ObsPlayerRoute() {
  useEffect(() => {
    document.documentElement.classList.add("!bg-transparent")
    document.body.classList.add("!bg-transparent")
    return () => {
      document.documentElement.classList.remove("!bg-transparent")
      document.body.classList.remove("!bg-transparent")
    }
  }, [])

  const { data: queue, isLoading } = useQueue()
  const { playTime, isPlaying, status } = usePlayerData()
  const { t } = useTranslate()
  const song = queue?.[0]
  const nextSong = queue?.[1]
  const duration = song?.duration ?? 0
  const progress = duration > 0 ? Math.min(100, Math.max(0, (playTime / duration) * 100)) : 0

  return (
    <main className="fixed inset-0 flex min-h-screen flex-col items-start justify-end gap-3 overflow-hidden p-6 text-white sm:p-10">
      <AnimatePresence mode="wait">
        {song ? (
          <motion.section
            key={song.id}
            aria-label="Now playing"
            className="relative flex w-full max-w-4xl items-center gap-6 overflow-hidden rounded-2xl border border-white/40 bg-black/85 p-5 shadow-[0_18px_55px_rgb(0_0_0/0.35)] sm:gap-7 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {song.thumbnail ? (
              <img
                className="aspect-video w-36 shrink-0 rounded-xl object-cover shadow-lg sm:w-40"
                src={song.thumbnail}
                alt=""
              />
            ) : (
              <div className="grid aspect-video w-36 shrink-0 place-items-center rounded-xl bg-white/10 sm:w-40">
                <Music2 className="size-8 text-white/60" />
              </div>
            )}
            <div className="min-w-0 flex-1 py-0.5">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-violet-200 uppercase">
                <AudioLines className={`size-3.5 ${isPlaying ? "animate-pulse" : "opacity-60"}`} />
                {isPlaying ? "Now playing" : "Paused"}
                {status === "loading" && (
                  <span className="font-medium tracking-normal text-white/50">· Syncing</span>
                )}
              </div>
              <h1 className="truncate text-xl leading-tight font-semibold tracking-tight sm:text-3xl">
                {song.title}
              </h1>
              <div className="mt-2 flex min-w-0 items-center gap-2 text-sm text-white/65 sm:text-base">
                {song.videoAuthor && <span className="truncate">{song.videoAuthor}</span>}
                {song.username && (
                  <span className="flex shrink-0 items-center gap-1.5">
                    {song.videoAuthor && <span className="text-white/35">·</span>}
                    <UserRound className="size-3.5" />
                    <span className="max-w-32 truncate">{song.username}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="hidden shrink-0 flex-col items-end gap-2.5 sm:flex">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-white/60 uppercase">
                BOT_MG
              </span>
              <span className="text-xs text-white/55 tabular-nums">
                {formatTime(playTime)} <span className="text-white/30">/</span>{" "}
                {formatTime(duration)}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
              <motion.div
                className="h-full bg-violet-400"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25, ease: "linear" }}
              />
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="empty"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/85 px-5 py-4 text-sm text-white/65 shadow-[0_18px_55px_rgb(0_0_0/0.35)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Music2 className="size-5" />
            {isLoading ? "Loading the song queue…" : "No song is playing"}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {nextSong && (
          <motion.section
            key={nextSong.id}
            aria-label={t("obs.nextUp")}
            className="flex w-full max-w-4xl items-center gap-3 rounded-xl border border-white/10 bg-black/75 px-3 py-2.5 shadow-lg sm:gap-4 sm:px-4 sm:py-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
          >
            {nextSong.thumbnail ? (
              <img
                className="aspect-video w-16 shrink-0 rounded-lg object-cover sm:w-20"
                src={nextSong.thumbnail}
                alt=""
              />
            ) : (
              <div className="grid aspect-video w-16 shrink-0 place-items-center rounded-lg bg-white/10 sm:w-20">
                <Music2 className="size-5 text-white/50" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[10px] font-bold tracking-[0.16em] text-violet-200/80 uppercase sm:text-[11px]">
                {t("obs.nextUp")}
              </p>
              <p className="truncate text-sm font-medium text-white/85 sm:text-base">
                {nextSong.title}
              </p>
            </div>
            {nextSong.videoAuthor && (
              <span className="hidden max-w-48 truncate text-sm text-white/45 md:block">
                {nextSong.videoAuthor}
              </span>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0))
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`
}
