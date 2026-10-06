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

export const Queue = ({
  showRemoveButton,
  embedded = false,
}: {
  showRemoveButton: boolean
  embedded?: boolean
}) => {
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
      className={cn(
        "border-border bg-card/75 dark:bg-card/80 flex flex-col gap-1 rounded-3xl border p-5 shadow-xl backdrop-blur-2xl",
        embedded && "border-0 bg-transparent p-0 shadow-none backdrop-blur-none",
      )}
    >
      {!embedded && (
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-foreground m-0 text-lg font-semibold tracking-tight">
            {t("common.queue")}
          </h2>
          <span className="border-border text-muted-foreground grid h-7 min-w-8 place-items-center rounded-lg border px-2 text-xs tabular-nums">
            {String(queuedCount).padStart(2, "0")}
          </span>
        </div>
      )}
      <motion.ul
        className={cn(
          "border-border bg-muted/75/75 min-h-26 overflow-hidden rounded-2xl border",
          queuedCount === 0 && "border-transparent bg-transparent",
        )}
      >
        <AnimatePresence mode="popLayout">
          {queuedCount === 0 && (
            <motion.p
              key="empty"
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground p-14 text-center"
            >
              {t("queue.empty")}
            </motion.p>
          )}
          {filteredCurrent?.map((item, idx) => (
            <motion.li
              key={`${item.id}-${idx}`}
              layout
              custom={idx}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "border-border focus-within:bg-accent hover:bg-accent dark:focus-within:bg-accent dark:hover:bg-accent flex flex-col items-center gap-6 border-b bg-transparent p-4 transition-colors md:flex-row md:gap-4 md:px-4 md:py-3",
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
                    className="border-border h-11 w-20 rounded-lg border object-cover md:h-22 md:w-39"
                  />
                </a>
              )}
              <div className="flex w-full flex-col gap-2 text-left">
                <div>
                  <h3 className="max-w-sm truncate font-semibold md:text-lg">{item.title}</h3>
                  <h4 className="text-muted-foreground max-w-48 truncate text-base">
                    {item.videoAuthor || ""}
                  </h4>
                </div>
                <div className="text-muted-foreground flex h-8 items-center gap-4 text-sm md:text-base">
                  <span className="flex items-center gap-2">
                    <Clock3 className="size-4" /> {formatDuration(item.duration)}
                  </span>
                  <span>|</span>
                  <p className="flex items-center gap-2">
                    <UserIcon className="size-4" />
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
