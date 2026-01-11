import { useAuth } from "@/hooks/use-auth"
import { useIsManagementPage } from "@/hooks/use-is-management-page"
import { useLoopToggle } from "@/hooks/use-loop-toggle"
import { cn } from "@/lib/utils"
import { Repeat } from "lucide-react"
import { motion } from "motion/react"

const MotionRepeat = motion(Repeat)

export function LoopIndicator({ isLoopEnabled }: { isLoopEnabled: boolean }) {
  const loopMutation = useLoopToggle()
  const { data } = useAuth()
  const isMod = data?.isMod ?? false
  const isManagement = useIsManagementPage()

  const toggleLoop = () => {
    if (isMod) {
      loopMutation.mutate()
    }
  }

  return (
    <button
      type="button"
      disabled={!isMod || !isManagement}
      onClick={toggleLoop}
      className={cn("flex h-6 items-center gap-1 px-1", isMod ? "cursor-pointer" : "cursor-auto")}
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
