import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { motion } from "motion/react"

export function QueueLoadingMessage() {
  const { t } = useTranslate()

  return (
    <motion.p
      key="loading"
      className="bg-background/95 flex h-34 w-full items-center justify-center rounded-md border text-2xl"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {t("queue.loading")}
    </motion.p>
  )
}
