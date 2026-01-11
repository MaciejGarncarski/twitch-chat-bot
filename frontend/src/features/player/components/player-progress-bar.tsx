import { usePlayerData } from "@/features/player/components/player-data-provider"
import { useQueue } from "@/features/queue/hooks/use-queue"
import { motion } from "motion/react"

export function PlayerProgressBar() {
  const { playTime } = usePlayerData()
  const { data: queueData, isPending } = useQueue()
  const currentSong = queueData?.[0] ?? null
  const duration = currentSong ? currentSong.duration : 0

  const progress = playTime / duration

  return (
    <div className="bg-secondary h-2 w-full overflow-hidden rounded-sm border">
      <motion.div
        className="bg-foreground h-full origin-left"
        initial={{ scaleX: progress }}
        animate={{ scaleX: progress }}
        transition={{
          duration: isPending ? 0 : 1,
          ease: "linear",
        }}
        style={{ width: "100%" }}
      />
    </div>
  )
}
