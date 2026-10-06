import { QueueEmptyMessage } from "@/features/queue/components/queue-empty-message"
import { QueueLoadingMessage } from "@/features/queue/components/queue-loading-message"
import { useDetectTheme } from "@/hooks/use-detect-theme"
import { usePlayState } from "@/features/player/hooks/use-play-state"
import { queueQueryOptions, useQueue } from "@/features/queue/hooks/use-queue"
import { useVolume } from "@/features/player/hooks/use-volume"
import { createFileRoute } from "@tanstack/react-router"
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react"
import { useRef } from "react"
import { usePlayerData } from "@/features/player/components/player-data-provider"
import { Player } from "@/features/player/components/player"
import { useIsModMode } from "@/hooks/use-is-mod-mode"
import { TwitchAuthButton } from "@/features/auth/components/twitch-auth-button"
import { SettingsDropdown } from "@/components/settings-dropdown"
import { PlaylistSwitcher } from "@/features/queue/components/playlist-switcher"

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(queueQueryOptions)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { isLoading, data: queueData } = useQueue()
  const { isPlaying, playTime, volume, status } = usePlayerData()
  const playerRef = useRef<HTMLVideoElement>(null)
  const currentSong = queueData?.[0] ?? null
  useDetectTheme()
  usePlayState(playerRef, playTime, isPlaying)
  useVolume(playerRef, volume)

  return (
    <MotionConfig reducedMotion="user">
      <main className="bg-muted text-foreground relative isolate min-h-screen overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-140"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 120% 100% at 50% 0%, color-mix(in oklab, var(--primary) 22%, transparent) 0%, color-mix(in oklab, var(--primary) 9%, transparent) 45%, transparent 72%)",
          }}
          aria-hidden="true"
        />
        <div
          className="bg-primary/15 dark:bg-primary/30 pointer-events-none absolute top-80 -left-56 -z-10 size-96 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          className="bg-primary/10 dark:bg-primary/25 pointer-events-none absolute top-176 -right-52 -z-10 size-96 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-5 px-3.5 py-4 md:gap-6 md:px-5 md:py-6">
          <motion.header
            className="flex min-h-10 items-center justify-between gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <a
              className="text-foreground flex shrink-0 items-center gap-2.5 text-base font-semibold tracking-tight no-underline"
              href="/"
              aria-label="Twitch Song Queue home"
            >
              <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-xl text-lg shadow-lg">
                ♪
              </span>
              <span>BOT_MG</span>
            </a>
            <LayoutGroup>
              <div className="[&_[data-slot=button]]:border-border [&_[data-slot=button]]:bg-card/75 [&_[data-slot=button]]:text-foreground [&_[data-slot=button]:hover]:bg-accent dark:[&_[data-slot=button]]:bg-card/80 flex min-w-0 items-center gap-1 sm:gap-2 [&_[data-slot=button]]:min-h-9 [&_[data-slot=button]]:rounded-xl [&_[data-slot=button]]:px-2 [&_[data-slot=button]]:backdrop-blur-xl sm:[&_[data-slot=button]]:px-3">
                <TwitchAuthButton />
                <SettingsDropdown />
              </div>
            </LayoutGroup>
          </motion.header>

          <section className="min-h-52">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <QueueLoadingMessage />
              ) : currentSong ? (
                <Player
                  dataStatus={status}
                  videoId={currentSong.id}
                  author={currentSong.videoAuthor}
                  duration={currentSong.duration}
                  title={currentSong.title}
                  username={currentSong.username}
                  thumbnail={currentSong.thumbnail}
                  isPlaying={isPlaying}
                  playTime={playTime}
                />
              ) : (
                <QueueEmptyMessage />
              )}
            </AnimatePresence>
          </section>

          <PlaylistSwitcher />
        </div>
      </main>
    </MotionConfig>
  )
}
