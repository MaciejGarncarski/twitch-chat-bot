import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useQueue } from "@/features/queue/hooks/use-queue"
import { useRemoveVideo } from "@/features/queue/hooks/use-remove-video"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/utils/format-duration"
import { Clock3, Trash2, UserIcon } from "lucide-react"
import { AnimatePresence, motion, type Variants } from "motion/react"

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 60,
      delay: i > 10 ? 0 : i * 0.2,
    },
  }),
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: 0.2 },
  },
}

export const Queue = ({ showRemoveButton }: { showRemoveButton: boolean }) => {
  const { t } = useTranslate()
  const { data: queueData } = useQueue()
  const auth = useAuth()
  const removeVideoMutation = useRemoveVideo()
  const isMod = auth.data?.isMod || false
  const filteredCurrent = queueData?.filter((_, idx) => idx !== 0)
  const queuedCount = filteredCurrent?.length ?? 0

  return (
    <motion.div
      layout
      className={cn("bg-background flex flex-col gap-1 rounded-md border px-4 py-4 pb-10")}
    >
      <h2 className="text-muted-foreground mr-auto ml-1 pb-2 text-xl font-semibold">
        {t("common.queue")}
      </h2>
      <motion.ul
        className={cn(
          "bg-secondary/30 min-h-26 overflow-hidden rounded-lg border",
          queuedCount === 0 && "border-transparent bg-transparent",
        )}
      >
        <AnimatePresence mode="popLayout">
          {queuedCount === 0 && (
            <motion.div
              key="empty"
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground p-14 text-center"
            >
              {t("queue.empty")}
            </motion.div>
          )}
          {filteredCurrent?.map((item, idx) => (
            <motion.li
              key={item.id}
              layout
              custom={idx}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "bg-secondary focus-within:bg-background hover:bg-background flex flex-col items-center gap-6 border-b p-4 md:flex-row",
                idx === filteredCurrent?.length - 1 && "border-b-0",
              )}
            >
              {item.thumbnail && (
                <a
                  href={item.videoUrl}
                  target="_blank"
                  className="focus:ring-ring shrink-0 rounded focus:ring-2 focus:ring-offset-3 focus:outline-none"
                  rel="noopener noreferrer"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-11 w-20 rounded border border-neutral-700 object-cover md:h-22 md:w-39"
                  />
                </a>
              )}
              <div className="flex w-full flex-col gap-2 text-left">
                <div>
                  <h3 className="max-w-[40ch] truncate font-semibold md:text-lg">{item.title}</h3>
                  <h4 className="text-muted-foreground max-w-[20ch] truncate text-base">
                    {item.videoAuthor || ""}
                  </h4>
                </div>
                <div className="text-muted-foreground flex h-8 items-center gap-4 text-sm md:text-base">
                  <span className="flex items-center gap-2">
                    <Clock3 size={16} /> {formatDuration(item.duration)}
                  </span>
                  <span>|</span>
                  <p className="flex items-center gap-2">
                    <UserIcon size={16} />
                    {item.username}
                  </p>

                  {isMod && showRemoveButton && (
                    <div className="ml-auto flex">
                      <Button
                        size="sm"
                        variant="destructive"
                        className={"cursor-pointer"}
                        onClick={() => removeVideoMutation.mutate(item.id)}
                      >
                        <Trash2 />
                        {t("common.delete")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </motion.div>
  )
}
