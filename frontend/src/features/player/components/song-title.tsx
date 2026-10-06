import { motion } from "motion/react"

export function SongTitle({ title, isPlaying }: { title: string; isPlaying: boolean }) {
  const isLongTitle = title.length >= 30

  if (isLongTitle) {
    return (
      <div className="text-foreground max-w-xs overflow-hidden text-xl leading-tight font-semibold tracking-tight whitespace-nowrap md:text-2xl">
        <motion.div
          className="inline-block whitespace-nowrap"
          initial={{ x: "100%" }}
          animate={{ x: isPlaying ? ["100%", "-100%"] : "100%" }}
          transition={{ duration: 20, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
        >
          {title}
        </motion.div>
      </div>
    )
  }

  return (
    <p className="text-foreground m-0 max-w-sm truncate text-xl leading-tight font-semibold tracking-tight md:text-2xl">
      {title}
    </p>
  )
}
