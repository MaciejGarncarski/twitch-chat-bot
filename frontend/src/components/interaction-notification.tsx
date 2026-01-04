import { AnimatePresence, motion } from "motion/react"
import { MousePointerClick } from "lucide-react"

type Props = {
  hasInteracted: boolean
  onInteract: () => void
}

export function InteractionNotification({ hasInteracted, onInteract }: Props) {
  return (
    <AnimatePresence>
      {!hasInteracted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 md:p-8"
          onClick={onInteract}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center gap-4 rounded-2xl bg-card/90 p-6 md:p-8 text-card-foreground shadow-2xl ring-1 ring-border cursor-pointer select-none"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-primary"
            >
              <MousePointerClick className="h-10 w-10 md:h-12 md:w-12" />
            </motion.div>
            <div className="flex flex-col gap-1 text-center">
              <h2 className="text-lg md:text-xl font-semibold">Kliknij, aby włączyć odtwarzanie</h2>
              <p className="text-sm text-muted-foreground">
                Przeglądarka wymaga interakcji przed odtwarzaniem dźwięku
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
