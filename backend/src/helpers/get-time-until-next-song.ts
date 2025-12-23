import { QueuedItem } from '@/types/queue'

export function getTimeUntilNextSong(currentItem: QueuedItem, playTime: number): number {
  const durationOfCurrent = currentItem?.duration || 0

  return Math.max(0, durationOfCurrent - playTime)
}
