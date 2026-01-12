import { useEffect } from "react"
import { motion, useMotionValue, useTransform, animate } from "motion/react"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useMuteToggle } from "@/features/player/hooks/use-mute-toggle"
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsManageMode } from "@/hooks/use-is-manage-mode"

export function VolumeIndicator({ volume }: { volume: number }) {
  const { data } = useAuth()
  const isMod = data?.isMod || false
  const muteMutation = useMuteToggle()
  const motionVolume = useMotionValue(volume)
  const displayValue = useTransform(motionVolume, (latest) => Math.round(latest * 100))
  const isManageMode = useIsManageMode()

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
        className={cn("flex items-center gap-1", isMod && isManageMode && "cursor-pointer")}
        disabled={!isMod || !isManageMode}
        onClick={() => {
          if (isManageMode) {
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
      <p className="inline-block w-8">
        <motion.span>{displayValue}</motion.span>%
      </p>
    </div>
  )
}
