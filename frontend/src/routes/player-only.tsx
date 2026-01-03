import { CurrentSong } from "@/components/current-song"
import { PlayerYT } from "@/components/player-yt"
import { Queue } from "@/components/queue"
import { QueueEmptyMessage } from "@/components/queue-empty-message"
import { QueueLoadingMessage } from "@/components/queue-loading-message"
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
  const { isPlaying, playTime, volume, songId } = usePlayerData()
  const [isReady, setIsReady] = useState(true)
  const playerRef = useRef<HTMLVideoElement>(null)

  const currentSong = queueData?.[0] ?? null

  usePlayState(playerRef, playTime, isPlaying)
  useVolume(playerRef, volume)

  return (
    <div className="text-center min-h-screen max-w-3xl mx-auto px-8 py-10 flex flex-col gap-4">
      <div className="flex flex-col gap-4 items-center px-4 min-h-40">
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
