import { createFileRoute } from "@tanstack/react-router"
import { useRef } from "react"
import { useVolume } from "@/hooks/use-volume"
import { usePlayState } from "@/hooks/use-play-state"
import { AnimatePresence } from "motion/react"
import { CurrentSong } from "@/components/player/current-song"
import { Queue } from "@/components/queue"
import { usePlayerData } from "@/hooks/use-player-data"
import { queueQueryOptions, useQueue } from "@/hooks/use-queue"
import { QueueEmptyMessage } from "@/components/queue-empty-message"
import { QueueLoadingMessage } from "@/components/queue-loading-message"
import { useAuth } from "@/hooks/use-auth"
import { TwitchAuthButton } from "@/components/twitch-auth-button"
import { NavigationTabs } from "@/components/navigation-tabs"
import { useDetectTheme } from "@/hooks/use-detect-theme"
import { ThemeToggle } from "@/components/theme-toggle"

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(queueQueryOptions)
  },
  component: App,
})

function App() {
  const { isLoading, data: queueData } = useQueue()
  const { playTime, isPlaying, volume, status, isLoopEnabled } = usePlayerData()
  const playerRef = useRef<HTMLVideoElement>(null)

  const currentSong = queueData?.[0] ?? null

  useDetectTheme()
  usePlayState(playerRef, playTime, isPlaying)
  useVolume(playerRef, volume)
  useAuth()

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 py-4 text-center md:py-8">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <NavigationTabs />

        <div className="flex gap-4">
          <TwitchAuthButton />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex min-h-40 flex-col items-center gap-4">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <QueueLoadingMessage />
          ) : currentSong ? (
            <CurrentSong
              dataStatus={status}
              isLoopEnabled={isLoopEnabled}
              videoId={currentSong.id}
              duration={currentSong.duration}
              title={currentSong.title}
              username={currentSong.username}
              thumbnail={currentSong.thumbnail}
              isPlaying={isPlaying}
              volume={volume}
              playTime={playTime}
            />
          ) : (
            <QueueEmptyMessage />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="popLayout">
        {isLoading || queueData?.length === 0 ? null : <Queue showRemoveButton />}
      </AnimatePresence>
    </div>
  )
}
