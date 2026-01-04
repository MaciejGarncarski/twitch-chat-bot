import { motion } from "motion/react"

export function QueueEmptyMessage() {
  return (
    <motion.p
      key="empty"
      className="h-34 flex items-center justify-center text-2xl bg-background/95 border rounded-md w-full"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Brak piosenek w kolejce.
    </motion.p>
  )
}
