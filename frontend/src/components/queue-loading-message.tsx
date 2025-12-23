import { motion } from 'motion/react'

export function QueueLoadingMessage() {
  return (
    <motion.p
      key="loading"
      className="h-34 flex items-center justify-center text-2xl bg-neutral-900/95 border rounded-md w-full"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Ładowanie...
    </motion.p>
  )
}
