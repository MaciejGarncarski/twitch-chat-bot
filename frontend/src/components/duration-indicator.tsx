import { formatDuration } from '@/utils/format-duration'
import { Clock3 } from 'lucide-react'

export function DurationIndicator({ playTime, duration }: { playTime: number; duration: number }) {
  return (
    <p className="flex items-center gap-2">
      <Clock3 size={17} />
      {formatDuration(playTime || 0)} / {formatDuration(duration)}
    </p>
  )
}
