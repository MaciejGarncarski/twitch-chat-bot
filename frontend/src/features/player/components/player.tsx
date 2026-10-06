import { PlayerManagement } from "@/features/player/components/player-management"
import { PlayerProgressBar } from "@/features/player/components/player-progress-bar"
import { SongTitle } from "@/features/player/components/song-title"
import { useIsModMode } from "@/hooks/use-is-mod-mode"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { ExternalLink, Loader, Music, UserIcon } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

type PlayerProps = {
  thumbnail: string | null
  isPlaying: boolean
  author: string | null
  videoId: string | null
  playTime: number
  title: string
  duration: number
  username: string
  dataStatus: "loading" | "success"
}

export const Player = ({
  playTime,
  isPlaying,
  title,
  author,
  duration,
  username,
  thumbnail,
  videoId,
  dataStatus,
}: PlayerProps) => {
  const { isModMode } = useIsModMode()
  const { t } = useTranslate()
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="border-border bg-card/75 relative flex w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border p-3 text-left shadow-2xl backdrop-blur-2xl md:flex-row md:gap-6 md:p-5"
    >
      <AnimatePresence>
        {dataStatus === "loading" ? (
          <motion.div
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            className="bg-popover/85 dark:bg-popover/85 absolute inset-0 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm"
          >
            <p className="text-muted-foreground text-2xl font-medium">
              <Loader className="mr-4 mb-1 inline size-6 animate-spin" />
              {t("player.loading.sync")}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {videoId ? (
        <a
          href={`https://youtu.be/${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-muted focus-visible:outline-ring relative isolate block aspect-video w-full shrink-0 overflow-hidden rounded-2xl shadow-xl focus-visible:outline-2 focus-visible:outline-offset-3 sm:aspect-square sm:size-40"
        >
          <span
            className="absolute -inset-3 z-0 scale-110 bg-cover bg-center blur-md brightness-50"
            style={{ backgroundImage: thumbnail ? `url("${thumbnail}")` : undefined }}
            aria-hidden="true"
          />
          <img
            src={thumbnail || undefined}
            alt={title}
            className="absolute top-1/2 left-0 z-1 aspect-video h-auto w-full -translate-y-1/2 object-contain transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <span className="from-background/50 absolute inset-x-0 bottom-0 z-2 h-1/3 bg-linear-to-t to-transparent" />
          <span
            className="border-border text-primary bg-background/80 absolute top-2.5 right-2.5 z-30 grid size-8 -translate-y-1 place-items-center rounded-xl border opacity-0 backdrop-blur-xl transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            aria-hidden="true"
          >
            <ExternalLink className="size-4" />
          </span>
          {isPlaying && (
            <span
              className="absolute bottom-3 left-3.5 z-30 flex h-4 items-end gap-1"
              aria-label="Playing"
            >
              {[0, 1, 2, 3].map((bar) => (
                <motion.span
                  key={bar}
                  animate={shouldReduceMotion ? { scaleY: 1 } : { scaleY: [0.35, 1, 0.55, 0.85] }}
                  className="bg-primary block h-full w-1 origin-bottom rounded-full shadow-sm"
                  transition={{
                    duration: 0.85 + bar * 0.12,
                    repeat: shouldReduceMotion ? 0 : Infinity,
                    ease: "easeInOut",
                    delay: bar * 0.08,
                  }}
                />
              ))}
            </span>
          )}
        </a>
      ) : (
        <div
          className="bg-muted text-muted-foreground grid aspect-video w-full shrink-0 place-items-center rounded-2xl sm:aspect-square sm:size-44"
          aria-hidden="true"
        >
          <Music className="size-12" />
        </div>
      )}
      <div className="flex h-full w-full min-w-0 flex-1 flex-col justify-between gap-4 px-1 pb-1 md:py-1 md:pr-1">
        <div className="min-w-0">
          {videoId ? (
            <>
              <SongTitle title={title} isPlaying={isPlaying} />
              <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="max-w-xs truncate">{author || ""}</span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <UserIcon className="size-4" />
                  {username}
                </span>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-2xl font-medium">{t("queue.empty")}</p>
          )}
        </div>
        <div className="[&_[data-slot=button]:hover]:text-foreground border-border [&_[data-slot=button]]:border-border [&_[data-slot=button]]:bg-muted [&_[data-slot=button]]:text-muted-foreground dark:[&_[data-slot=button]]:bg-muted/50 dark:[&_[data-slot=button]]:text-muted-foreground mt-auto flex flex-col gap-3 border-t pt-3 md:pt-4 [&_[data-slot=button]]:rounded-lg">
          {isModMode && <PlayerManagement playTime={playTime} duration={duration} />}
          {videoId && <PlayerProgressBar />}
        </div>
      </div>
    </motion.div>
  )
}
