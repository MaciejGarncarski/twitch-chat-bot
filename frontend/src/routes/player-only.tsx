import { CurrentSong } from "@/components/current-song"
import { InteractionNotification } from "@/components/interaction-notification"
import { NavigationTabs } from "@/components/navigation-tabs"
import { PlayerYT } from "@/components/player-yt"
import { Queue } from "@/components/queue"
import { QueueEmptyMessage } from "@/components/queue-empty-message"
import { QueueLoadingMessage } from "@/components/queue-loading-message"
import { ThemeToggle } from "@/components/theme-toggle"
import { useDetectTheme } from "@/hooks/use-detect-theme"
import { useInteraction } from "@/hooks/use-interaction"
import { usePlayState } from "@/hooks/use-play-state"
import { usePlayerData } from "@/hooks/use-player-data"
import { queueQueryOptions, useQueue } from "@/hooks/use-queue"
import { useVolume } from "@/hooks/use-volume"
import { createFileRoute } from "@tanstack/react-router"
import { AnimatePresence } from "motion/react"
import { useRef, useState } from "react"

export const Route = createFileRoute("/player-only")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(queueQueryOptions)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { isLoading, data: queueData } = useQueue()
  const { isPlaying, playTime, volume, songId, isLoopEnabled } = usePlayerData()
  const { hasInteracted, handleInteract } = useInteraction()
  const [isReady, setIsReady] = useState(true)
  const playerRef = useRef<HTMLVideoElement>(null)

  const currentSong = queueData?.[0] ?? null

  useDetectTheme()
  usePlayState(playerRef, playTime, isPlaying)
  useVolume(playerRef, volume)

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 py-4 text-center md:py-8">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <NavigationTabs />
        <ThemeToggle />
      </div>
      <div className="flex min-h-40 flex-col items-center gap-4">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <QueueLoadingMessage />
          ) : currentSong ? (
            <CurrentSong
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
        {isLoading || queueData?.length === 0 ? null : <Queue />}
      </AnimatePresence>

      {currentSong && songId === currentSong.id && hasInteracted && (
        <PlayerYT
          isReady={isReady}
          volume={volume}
          isPlaying={isPlaying}
          currentSong={currentSong}
          playerRef={playerRef}
          setIsReady={setIsReady}
        />
      )}

      <InteractionNotification hasInteracted={hasInteracted} onInteract={handleInteract} />
    </div>
  )
}
