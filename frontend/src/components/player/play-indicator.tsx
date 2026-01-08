import { useAuth } from "@/hooks/use-auth"
import { useSetPlayState } from "@/hooks/use-set-play-state"
import { cn } from "@/lib/utils"
import { Pause, Play } from "lucide-react"
import { AnimatePresence, motion, type Variants } from "motion/react"

const MotionPlay = motion(Play)
const MotionPause = motion(Pause)

const btnVariants: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
  },
}

export function PlayIndicator({ isPlaying }: { isPlaying: boolean }) {
  const playStateMutation = useSetPlayState({ isPlaying })
  const { data } = useAuth()
  const isMod = data?.isMod ?? false

  const togglePlayState = () => {
    if (isMod) {
      playStateMutation.mutate()
    }
  }

  return (
    <button
      type="button"
      disabled={!isMod}
      onClick={togglePlayState}
      className={cn(
        "relative flex h-6 items-center gap-1 px-1",
        isMod ? "cursor-pointer" : "cursor-auto",
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {isPlaying ? (
          <MotionPause
            key="playing"
            variants={btnVariants}
            initial="initial"
            animate="animate"
            size={17}
          />
        ) : (
          <MotionPlay
            key="paused"
            variants={btnVariants}
            initial="initial"
            animate="animate"
            size={17}
          />
        )}
      </AnimatePresence>
    </button>
  )
}
