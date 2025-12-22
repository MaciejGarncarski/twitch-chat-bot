import { motion } from 'motion/react'

export function CurrentSongProgressBar({
  duration,
  playTime,
}: {
  duration: number
  playTime: number
}) {
  const progress = duration ? playTime / duration : 0

  return (
    <div className="h-2 rounded-sm w-full overflow-hidden border bg-neutral-800">
      <motion.div
        className="bg-white h-full origin-left"
        initial={{ scaleX: progress }}
        animate={{
          scaleX: progress,
        }}
        transition={{
          duration: 1,
          ease: 'linear',
        }}
        style={{ width: '100%' }}
      />
    </div>
  )
}
