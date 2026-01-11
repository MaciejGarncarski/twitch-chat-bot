import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { motion } from "motion/react"

export function QueueEmptyMessage() {
  const { t } = useTranslate()

  return (
    <motion.p
      key="empty"
      className="bg-background/95 flex h-34 w-full items-center justify-center rounded-md border text-2xl"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {t("queue.empty")}
    </motion.p>
  )
}
