import { motion } from "motion/react"

export function CurrentSongProgressBar({
  duration,
  playTime,
  videoId,
}: {
  duration: number
  playTime: number
  videoId: string
}) {
  const progress = duration ? playTime / duration : 0

  const isResetting = progress === 0

  return (
    <div className="h-2 rounded-sm w-full overflow-hidden border bg-secondary">
      <motion.div
        key={videoId}
        className="bg-foreground h-full origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: progress }}
        transition={{
          duration: isResetting ? 0 : 1.15,
          ease: "linear",
        }}
        style={{ width: "100%" }}
      />
    </div>
  )
}
