import { createFileRoute } from "@tanstack/react-router"
import { useRef, useState } from "react"
import { useVolume } from "@/hooks/use-volume"
import { usePlayState } from "@/hooks/use-play-state"
import { useInteraction } from "@/hooks/use-interaction"
import { AnimatePresence } from "motion/react"
import { CurrentSong } from "@/components/current-song"
import { Queue } from "@/components/queue"
import { PlayerYT } from "@/components/player-yt"
import { InteractionNotification } from "@/components/interaction-notification"
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
  const { isPlaying, playTime, volume, songId, isLoopEnabled } = usePlayerData()
  const { hasInteracted, handleInteract } = useInteraction()
  const [isReady, setIsReady] = useState(true)
  const playerRef = useRef<HTMLVideoElement>(null)

  const currentSong = queueData?.[0] ?? null

  useDetectTheme()
  usePlayState(playerRef, playTime, isPlaying)
  useVolume(playerRef, volume)
  useAuth()

  return (
    <div className="text-center min-h-screen max-w-3xl mx-auto px-4 py-4 md:py-8 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <NavigationTabs />

        <div className="flex gap-4">
          <TwitchAuthButton />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-col gap-4 items-center min-h-40">
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
