import { useAuth } from "@/hooks/use-auth"
import { useLoopToggle } from "@/hooks/use-loop-toggle"
import { cn } from "@/lib/utils"
import { Repeat } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

const MotionRepeat = motion(Repeat)

export function LoopIndicator({ isLoopEnabled }: { isLoopEnabled: boolean }) {
  const loopMutation = useLoopToggle()
  const { data } = useAuth()
  const isMod = data?.isMod ?? false

  const toggleLoop = () => {
    if (isMod) {
      loopMutation.mutate()
    }
  }

  return (
    <button
      type="button"
      disabled={!isMod}
      onClick={toggleLoop}
      className={cn("flex h-6 items-center gap-1", isMod ? "cursor-pointer" : "cursor-auto")}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {isLoopEnabled ? (
          <MotionRepeat
            key="loop-enabled"
            initial={{ opacity: 0, rotate: -360 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 40 }}
            size={18}
            className="text-green-500"
          />
        ) : (
          <MotionRepeat
            key="loop-disabled"
            initial={{ opacity: 0, rotate: 360 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 40 }}
            size={18}
            className="text-muted-foreground"
          />
        )}
      </AnimatePresence>
    </button>
  )
}
