import { QueuedItem } from '@/types/queue'

export function getTimeUntilAddedSong(queueItems: QueuedItem[], playTime: number): number {
  if (queueItems.length === 0) {
    return 0
  }

  if (queueItems.length === 1) {
    return Math.max(0, queueItems[0].duration - playTime)
  }

  const combinedDurationWithoutLast = queueItems
    .slice(0, -1)
    .reduce((total, item) => total + item.duration, 0)

  return combinedDurationWithoutLast - playTime
}
