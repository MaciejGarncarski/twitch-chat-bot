import { api } from '@/api/api-treaty'
import { cn } from '@/lib/utils'
import type { QueueTrackedItem } from '@/routes'
import { formatDuration } from '@/utils/format-duration'
import { useQuery } from '@tanstack/react-query'
import { Clock3, UserIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

export const Queue = () => {
  const { data: queueData, isLoading } = useQuery({
    queryKey: ['queue'],
    queryFn: async () => {
      const data = (await api.api.queue.get()) as { data: QueueTrackedItem[] }
      return data.data
    },
    refetchInterval: 1500,
  })

  if (isLoading || queueData?.length === 0) {
    return null
  }

  const filteredCurrent = queueData?.filter((_, idx) => idx !== 0)

  return (
    <motion.div
      className="flex flex-col bg-neutral-900/90 rounded-md px-4 py-4 mx-4 gap-1 border pb-10"
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      initial={{ opacity: 0, transition: { duration: 0.5 } }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <h2 className="mr-auto ml-1 pb-2 text-xl font-semibold text-neutral-300">Kolejka</h2>
      <div className="border rounded-lg min-h-26 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {filteredCurrent?.map((item, idx) => (
            <motion.div
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
              <div className="text-left flex flex-col gap-2">
                <div className="font-semibold text-lg">{item.title}</div>
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
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
