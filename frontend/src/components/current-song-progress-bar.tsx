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
    <div className="bg-secondary h-2 w-full overflow-hidden rounded-sm border">
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
