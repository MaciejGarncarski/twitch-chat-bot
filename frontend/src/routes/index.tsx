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
import { TwitchAuthButton } from "@/features/auth/components/twitch-auth-button"
import { SettingsDropdown } from "@/components/settings-dropdown"
import { PlaylistSwitcher } from "@/features/queue/components/playlist-switcher"
import logo from "@/assets/logo.png"
import { useChatConnection } from "@/features/player/hooks/use-chat-connection"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { buttonVariants } from "@/components/ui/button"

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(queueQueryOptions)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { isLoading, data: queueData } = useQueue()
  const { isPlaying, playTime, volume, status } = usePlayerData()
  const { data: isChatConnected } = useChatConnection()
  const { t } = useTranslate()
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
              <img className="size-8 rounded-xl object-contain" src={logo} alt="" />
              <span>BOT_MG</span>
            </a>
            <LayoutGroup>
              <div className="[&_[data-slot=button]:hover]:bg-accent flex min-w-0 items-center gap-1 sm:gap-2">
                <TwitchAuthButton />
                <SettingsDropdown />
                <span
                  className={buttonVariants({
                    variant: "outline",
                    size: "default",
                    className: `duration-200 ${
                      isChatConnected
                        ? "bg-primary/60 dark:bg-primary/70 hover:dark:bg-primary/0 text-primary-foreground hover:bg-primary/80"
                        : "bg-red-600/70 text-white hover:bg-red-700/85 dark:bg-red-700/70 dark:hover:bg-red-800/85"
                    }`,
                  })}
                  role="status"
                  aria-label={t(isChatConnected ? "chat.connected" : "chat.disconnected")}
                  title={t(isChatConnected ? "chat.connected" : "chat.disconnected")}
                >
                  {t(isChatConnected ? "chat.connected" : "chat.disconnected")}
                </span>
              </div>
            </LayoutGroup>
          </motion.header>
          <section className="min-h-52">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <QueueLoadingMessage />
              ) : (
                <Player
                  dataStatus={status}
                  videoId={currentSong?.id ?? null}
                  author={currentSong?.videoAuthor ?? null}
                  duration={currentSong?.duration ?? 0}
                  title={currentSong?.title ?? ""}
                  username={currentSong?.username ?? ""}
                  thumbnail={currentSong?.thumbnail ?? null}
                  isPlaying={isPlaying}
                  playTime={playTime}
                />
              )}
            </AnimatePresence>
          </section>
          <PlaylistSwitcher />
        </div>
      </main>
    </MotionConfig>
  )
}
