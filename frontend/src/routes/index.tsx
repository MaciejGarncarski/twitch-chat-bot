import { Queue } from "@/features/queue/components/queue"
import { QueueEmptyMessage } from "@/features/queue/components/queue-empty-message"
import { QueueLoadingMessage } from "@/features/queue/components/queue-loading-message"
import { useDetectTheme } from "@/hooks/use-detect-theme"
import { usePlayState } from "@/features/player/hooks/use-play-state"
import { queueQueryOptions, useQueue } from "@/features/queue/hooks/use-queue"
import { useVolume } from "@/features/player/hooks/use-volume"
import { createFileRoute } from "@tanstack/react-router"
import { AnimatePresence, LayoutGroup } from "motion/react"
import { useRef } from "react"
import { usePlayerData } from "@/features/player/components/player-data-provider"
import { Player } from "@/features/player/components/player"
import { Navigation } from "@/components/navigation"
import { useIsModMode } from "@/hooks/use-is-mod-mode"
import { TwitchAuthButton } from "@/features/auth/components/twitch-auth-button"
import { SettingsDropdown } from "@/components/settings-dropdown"

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(queueQueryOptions)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { isLoading, data: queueData } = useQueue()
  const { isPlaying, playTime, volume, isLoopEnabled, status } = usePlayerData()
  const playerRef = useRef<HTMLVideoElement>(null)
  const currentSong = queueData?.[0] ?? null
  const { isModMode } = useIsModMode()

  useDetectTheme()
  usePlayState(playerRef, playTime, isPlaying)
  useVolume(playerRef, volume)

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 py-4 text-center md:py-8">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <Navigation />

        <div className="flex gap-4">
          <LayoutGroup>
            <TwitchAuthButton />
            <SettingsDropdown />
          </LayoutGroup>
        </div>
      </div>
      <div className="flex min-h-40 flex-col items-center gap-4">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <QueueLoadingMessage />
          ) : currentSong ? (
            <Player
              dataStatus={status}
              isLoopEnabled={isLoopEnabled}
              videoId={currentSong.id}
              author={currentSong.videoAuthor}
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
        {isLoading || queueData?.length === 0 ? null : <Queue showRemoveButton={isModMode} />}
      </AnimatePresence>
    </div>
  )
}
