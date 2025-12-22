import { useQueue } from '@/hooks/use-queue'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/utils/format-duration'
import { Clock3, UserIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

export const Queue = () => {
  const { data: queueData } = useQueue()

  const filteredCurrent = queueData?.filter((_, idx) => idx !== 0)
  const queuedCount = filteredCurrent?.length ?? 0

  return (
    <motion.div
      className={cn('flex flex-col bg-neutral-900/95 rounded-md px-4 py-4 mx-4 gap-1 border pb-10')}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      initial={{ opacity: 0, transition: { duration: 0.5 } }}
      exit={{ opacity: 0, transition: { duration: 0.7 } }}
    >
      <h2 className="mr-auto ml-1 pb-2 text-xl font-semibold text-neutral-300">Kolejka</h2>
      <ul
        className={cn(
          'border rounded-lg min-h-26 overflow-hidden',
          queuedCount === 0 && 'border-transparent',
        )}
      >
        <AnimatePresence mode="popLayout">
          {queuedCount === 0 && (
            <motion.div
              layout
              key="empty-queue"
              exit={{
                opacity: 0,
                transition: { duration: 0.3 },
              }}
              initial={{
                opacity: 0,
                transition: { duration: 0.3 },
              }}
              animate={{
                opacity: 1,
                transition: { duration: 0.3 },
              }}
              className="p-14 text-center text-neutral-200"
            >
              Brak pozycji w kolejce
            </motion.div>
          )}
          {filteredCurrent?.map((item, idx) => (
            <motion.li
              layout
              key={item.id}
              exit={{
                opacity: 0,
                translateY: 20,
                transition: { duration: 0.3 },
              }}
              initial={{
                opacity: 0,
                translateY: 20,
                transition: { duration: 0.3 },
              }}
              animate={{
                opacity: 1,
                translateY: 0,
                transition: { duration: 0.3 },
              }}
              className={cn(
                'p-4 border-b flex gap-6 items-center bg-neutral-800',
                idx === filteredCurrent?.length - 1 && 'border-b-0',
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
                    className="h-22 w-39 object-cover rounded border border-neutral-700"
                  />
                </a>
              )}
              <div className="text-left flex flex-col gap-3">
                <h3 className="font-semibold text-lg max-w-[40ch] truncate">{item.title}</h3>
                <div className="text-gray-400 text-base flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <Clock3 size={16} /> {formatDuration(item.duration)}
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-2">
                    <UserIcon size={16} />
                    {item.username}
                  </span>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  )
}
