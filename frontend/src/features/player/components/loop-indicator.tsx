import { useIsModMode } from "@/hooks/use-is-mod-mode"
import { useLoopToggle } from "@/features/player/hooks/use-loop-toggle"
import { cn } from "@/lib/utils"
import { Repeat } from "lucide-react"
import { motion } from "motion/react"

const MotionRepeat = motion(Repeat)

export function LoopIndicator({ isLoopEnabled }: { isLoopEnabled: boolean }) {
  const loopMutation = useLoopToggle()
  const { isModMode } = useIsModMode()

  const toggleLoop = () => {
    if (isModMode) {
      loopMutation.mutate()
    }
  }

  return (
    <button
      type="button"
      disabled={!isModMode}
      onClick={toggleLoop}
      className={cn(
        "flex h-6 items-center gap-1 px-1",
        isModMode ? "cursor-pointer" : "cursor-not-allowed opacity-70",
      )}
    >
      <MotionRepeat
        key="loop-enabled"
        initial={{ rotate: isLoopEnabled ? 180 : 0 }}
        animate={{ rotate: isLoopEnabled ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        className={cn(isLoopEnabled ? "text-green-500" : "text-muted-foreground")}
        size={17}
      />
    </button>
  )
}
