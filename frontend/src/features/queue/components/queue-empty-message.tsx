import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { motion } from "motion/react"

export function QueueEmptyMessage() {
  const { t } = useTranslate()

  return (
    <motion.p
      key="empty"
      className="border-border bg-card/75 text-muted-foreground dark:bg-card/80 flex h-34 w-full items-center justify-center rounded-3xl border text-2xl shadow-2xl backdrop-blur-2xl"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {t("queue.empty")}
    </motion.p>
  )
}
