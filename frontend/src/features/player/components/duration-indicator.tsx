import { useIsModMode } from "@/hooks/use-is-mod-mode"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/utils/format-duration"

export function DurationIndicator({ playTime, duration }: { playTime: number; duration: number }) {
  const { isModMode } = useIsModMode()

  return (
    <p className={cn("flex items-center gap-2", !isModMode && "cursor-not-allowed opacity-70")}>
      {formatDuration(playTime || 0)} / {formatDuration(duration)}
    </p>
  )
}
