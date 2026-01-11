import { motion } from "motion/react"

export function QueueLoadingMessage() {
  return (
    <motion.p
      key="loading"
      className="bg-background/95 flex h-34 w-full items-center justify-center rounded-md border text-2xl"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Ładowanie...
    </motion.p>
  )
}
