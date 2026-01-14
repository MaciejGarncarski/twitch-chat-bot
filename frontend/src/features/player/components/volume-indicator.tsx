import { useEffect } from "react"
import { motion, useMotionValue, useTransform, animate } from "motion/react"
import { useMuteToggle } from "@/features/player/hooks/use-mute-toggle"
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsModMode } from "@/hooks/use-is-mod-mode"

export function VolumeIndicator({ volume }: { volume: number }) {
  const muteMutation = useMuteToggle()
  const motionVolume = useMotionValue(volume)
  const displayValue = useTransform(motionVolume, (latest) => Math.round(latest * 100))
  const { isModMode } = useIsModMode()

  useEffect(() => {
    const controls = animate(motionVolume, volume, {
      duration: 0.2,
      ease: "easeOut",
    })
    return controls.stop
  }, [volume, motionVolume])

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={cn(
          "flex items-center gap-1",
          isModMode ? "cursor-pointer" : "cursor-not-allowed opacity-70",
        )}
        disabled={!isModMode}
        onClick={() => {
          if (isModMode) {
            muteMutation.mutate()
          }
        }}
      >
        {volume === 0 ? (
          <VolumeX size={17} className="mr-1 inline-block" />
        ) : volume < 0.2 ? (
          <Volume size={17} className="mr-1 inline-block" />
        ) : volume < 0.5 ? (
          <Volume1 size={17} className="mr-1 inline-block" />
        ) : (
          <Volume2 size={17} className="mr-1 inline-block" />
        )}
      </button>
      <p className={cn("text-sm select-none", !isModMode && "cursor-not-allowed opacity-70")}>
        <motion.span>{displayValue}</motion.span>%
      </p>
    </div>
  )
}
