import { createFileRoute } from "@tanstack/react-router"
import { useRef, useState } from "react"
import { useVolume } from "@/hooks/use-volume"
import { usePlayState } from "@/hooks/use-play-state"
import { AnimatePresence } from "motion/react"
import { CurrentSong } from "@/components/current-song"
import { Queue } from "@/components/queue"
import { PlayerYT } from "@/components/player-yt"
import { usePlayerData } from "@/hooks/use-player-data"
import { queueQueryOptions, useQueue } from "@/hooks/use-queue"
import { QueueEmptyMessage } from "@/components/queue-empty-message"
import { QueueLoadingMessage } from "@/components/queue-loading-message"
import { useAuth } from "@/hooks/use-auth"
import { TwitchAuthButton } from "@/components/twitch-auth-button"
import { NavigationTabs } from "@/components/navigation-tabs"

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(queueQueryOptions)
  },
  component: App,
})

function App() {
  const { isLoading, data: queueData } = useQueue()
  const { isPlaying, playTime, volume, songId } = usePlayerData()
  const [isReady, setIsReady] = useState(true)
  const playerRef = useRef<HTMLVideoElement>(null)

  const currentSong = queueData?.[0] ?? null

  usePlayState(playerRef, playTime, isPlaying)
  useVolume(playerRef, volume)
  useAuth()

  return (
    <div className="text-center min-h-screen max-w-3xl mx-auto px-4 py-4 md:py-8 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <NavigationTabs />
        <TwitchAuthButton />
      </div>

      <div className="flex flex-col gap-4 items-center min-h-40">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <QueueLoadingMessage />
          ) : currentSong ? (
            <CurrentSong
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

      {currentSong && songId === currentSong.id && (
        <PlayerYT
          isReady={isReady}
          volume={volume}
          isPlaying={isPlaying}
          currentSong={currentSong}
          playerRef={playerRef}
          setIsReady={setIsReady}
        />
      )}
    </div>
  )
}
