import { motion } from "motion/react"

export function QueueEmptyMessage() {
  return (
    <motion.p
      key="empty"
      className="bg-background/95 flex h-34 w-full items-center justify-center rounded-md border text-2xl"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Brak piosenek w kolejce.
    </motion.p>
  )
}
