import { motion } from "motion/react"
import { useEffect, useState } from "react"

export function PlayerProgressBar({ duration, playTime }: { duration: number; playTime: number }) {
  const [prevPlayTime, setPrevPlayTime] = useState(0)

  useEffect(() => {
    setPrevPlayTime(playTime)
  }, [playTime])

  const progress = playTime / duration
  const isInitialRender = playTime !== 0 && prevPlayTime === 0
  const isNewSong = prevPlayTime - playTime > 0
  const durationForAnimation = isInitialRender || isNewSong ? 0 : 1

  return (
    <div className="bg-secondary h-2 w-full overflow-hidden rounded-sm border">
      <motion.div
        className="bg-foreground h-full origin-left"
        initial={{ scaleX: progress }}
        animate={{ scaleX: progress }}
        transition={{
          duration: durationForAnimation,
          ease: "linear",
        }}
        style={{ width: "100%" }}
      />
    </div>
  )
}
