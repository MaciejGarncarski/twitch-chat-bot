import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useQueue } from "@/hooks/use-queue"
import { useRemoveVideo } from "@/hooks/use-remove-video"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/utils/format-duration"
import { Clock3, Trash2, UserIcon } from "lucide-react"
import { AnimatePresence, motion, type Variants } from "motion/react"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    x: -20,
    transition: { duration: 0.2 },
  },
}

export const Queue = () => {
  const { data: queueData } = useQueue()
  const auth = useAuth()
  const removeVideoMutation = useRemoveVideo()
  const isMod = auth.data?.isMod || false
  const filteredCurrent = queueData?.filter((_, idx) => idx !== 0)
  const queuedCount = filteredCurrent?.length ?? 0

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn("flex flex-col bg-neutral-900/95 rounded-md px-4 py-4 gap-1 border pb-10")}
    >
      <h2 className="mr-auto ml-1 pb-2 text-xl font-semibold text-neutral-300">Kolejka</h2>
      <ul
        className={cn(
          "border rounded-lg min-h-26 overflow-hidden",
          queuedCount === 0 && "border-transparent",
        )}
      >
        <AnimatePresence mode="popLayout">
          {queuedCount === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-14 text-center text-neutral-200"
            >
              Brak pozycji w kolejce
            </motion.div>
          )}
          {filteredCurrent?.map((item, idx) => (
            <motion.li
              key={item.id}
              layout
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
              className={cn(
                "p-4 border-b flex gap-6 items-center bg-neutral-800 flex-col md:flex-row",
                idx === filteredCurrent?.length - 1 && "border-b-0",
              )}
            >
              {item.thumbnail && (
                <a
                  href={item.videoUrl}
                  target="_blank"
                  className="shrink-0"
                  rel="noopener noreferrer"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-11 w-20 md:h-22 md:w-39 object-cover rounded border border-neutral-700"
                  />
                </a>
              )}
              <div className="text-left flex flex-col gap-3 w-full">
                <h3 className="font-semibold md:text-lg max-w-[40ch] truncate">{item.title}</h3>
                <div className="text-gray-400 text-sm md:text-base flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <Clock3 size={16} /> {formatDuration(item.duration)}
                  </span>
                  <span>|</span>
                  <p className="flex items-center gap-2">
                    <UserIcon size={16} />
                    {item.username}
                  </p>

                  {isMod && (
                    <div className="ml-auto flex">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeVideoMutation.mutate(item.id)}
                      >
                        <Trash2 />
                        Usuń
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  )
}
