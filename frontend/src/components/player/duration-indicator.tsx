import { formatDuration } from "@/utils/format-duration"

export function DurationIndicator({ playTime, duration }: { playTime: number; duration: number }) {
  return (
    <p className="flex items-center gap-2">
      {formatDuration(playTime || 0)} / {formatDuration(duration)}
    </p>
  )
}
