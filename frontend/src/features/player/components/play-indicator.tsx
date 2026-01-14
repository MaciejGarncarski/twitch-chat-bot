import { useIsModMode } from "@/hooks/use-is-mod-mode"
import { useSetPlayState } from "@/features/player/hooks/use-set-play-state"
import { cn } from "@/lib/utils"
import { Pause, Play } from "lucide-react"
import { motion, type Variants } from "motion/react"

const MotionPlay = motion(Play)
const MotionPause = motion(Pause)

const btnVariants: Variants = {
  initial: {
    scale: 0.5,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
  },
}

export function PlayIndicator({ isPlaying }: { isPlaying: boolean }) {
  const playStateMutation = useSetPlayState({ isPlaying })
  const { isModMode } = useIsModMode()

  const togglePlayState = () => {
    if (isModMode) {
      playStateMutation.mutate()
    }
  }

  return (
    <button
      type="button"
      disabled={!isModMode}
      onClick={togglePlayState}
      className={cn(
        "relative flex h-6 items-center gap-1 px-1",
        isModMode ? "cursor-pointer" : "cursor-not-allowed opacity-70",
      )}
    >
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
    </button>
  )
}
