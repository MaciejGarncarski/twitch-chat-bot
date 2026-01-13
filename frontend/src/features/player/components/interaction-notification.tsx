import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"
import { MousePointerClick } from "lucide-react"
import { useTranslate } from "@/features/i18n/hooks/use-translate"

type Props = {
  hasInteracted: boolean
  onInteract: () => void
}

export function InteractionNotification({ hasInteracted, onInteract }: Props) {
  const { t } = useTranslate()

  const content = (
    <AnimatePresence>
      {!hasInteracted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.2 }}
          className="bg-background/80 pointer-events-auto fixed inset-0 z-9999 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onInteract}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-card/90 text-card-foreground ring-border flex cursor-pointer flex-col items-center gap-4 rounded-2xl p-6 shadow-2xl ring-1 select-none md:p-8"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-primary"
            >
              <MousePointerClick className="h-10 w-10 md:h-12 md:w-12" />
            </motion.div>
            <div className="flex flex-col gap-1 text-center">
              <h2 className="text-lg font-semibold md:text-xl">
                {t("interactionNotification.title")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t("interactionNotification.description")}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}
