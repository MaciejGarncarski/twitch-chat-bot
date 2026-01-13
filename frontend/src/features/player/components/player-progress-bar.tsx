import { useAuth } from "@/features/auth/hooks/use-auth"
import { usePlayerData } from "@/features/player/components/player-data-provider"
import { useSeekPosition } from "@/features/player/hooks/use-seek-position"
import { useQueue } from "@/features/queue/hooks/use-queue"
import { useIsModMode } from "@/hooks/use-is-mod-mode"
import { motion, useMotionValue, useTransform } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"

export function PlayerProgressBar() {
  const { playTime } = usePlayerData()
  const { data: queueData, isPending } = useQueue()
  const currentSong = queueData?.[0] ?? null
  const duration = currentSong ? currentSong.duration : 0
  const progress = playTime / duration
  const seekMutation = useSeekPosition()

  const { data } = useAuth()
  const { isModMode } = useIsModMode()
  const isMod = data?.isMod ?? false

  const canSeek = isModMode && isMod
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const containerWidth = useRef(0)
  const [prevProgress, setPrevProgress] = useState(progress)
  const dragX = useMotionValue(0)
  const dragProgress = useTransform(dragX, (x) =>
    containerWidth.current > 0 ? x / containerWidth.current : 0,
  )

  const isLargeJump = Math.abs(progress - prevProgress) > 0.02

  useEffect(() => {
    setPrevProgress(progress)
  }, [progress])

  useEffect(() => {
    if (!isDragging && containerRef.current) {
      containerWidth.current = containerRef.current.getBoundingClientRect().width
      dragX.set(progress * containerWidth.current)
    }
  }, [progress, isDragging, dragX])

  const handleDragStart = useCallback(() => {
    if (!canSeek || !containerRef.current) return
    containerWidth.current = containerRef.current.getBoundingClientRect().width
    setIsDragging(true)
  }, [canSeek])

  const handleDragEnd = useCallback(() => {
    if (!canSeek) return
    const finalProgress = dragX.get() / containerWidth.current
    const newPosition = Math.floor(finalProgress * duration)
    seekMutation.mutate(newPosition)
    setIsDragging(false)
  }, [canSeek, dragX, duration, seekMutation])

  const handleBarClick = useCallback(
    (e: React.MouseEvent) => {
      if (!canSeek || !containerRef.current || isDragging) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const clickProgress = Math.max(0, Math.min(1, x / rect.width))
      const newPosition = Math.floor(clickProgress * duration)
      seekMutation.mutate(newPosition)
    },
    [canSeek, isDragging, duration, seekMutation],
  )

  const showHandle = canSeek && (isHovering || isDragging)

  return (
    <div
      ref={containerRef}
      className={`relative ${canSeek ? "cursor-pointer" : ""}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleBarClick}
    >
      <div className="bg-secondary relative h-2 w-full overflow-hidden rounded-sm border">
        <motion.div
          className="bg-foreground h-full origin-left"
          style={{
            width: "100%",
            scaleX: isDragging ? dragProgress : progress,
          }}
          animate={isDragging ? undefined : { scaleX: progress }}
          transition={{
            duration: isPending || isDragging || isLargeJump ? 0 : 1,
            ease: "linear",
          }}
        />
      </div>

      {canSeek && (
        <motion.div
          className="absolute top-1/2 z-10"
          style={{
            x: dragX,
            translateX: "-50%",
            translateY: "-50%",
          }}
          drag="x"
          dragConstraints={containerRef}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          whileHover={{ scale: 1.2 }}
          whileDrag={{ scale: 1.3 }}
        >
          <motion.div
            className="bg-foreground rounded-full shadow-md"
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{
              width: showHandle ? 14 : 0,
              height: showHandle ? 14 : 0,
              opacity: showHandle ? 1 : 0,
            }}
            transition={{ duration: 0.15 }}
          />
        </motion.div>
      )}
    </div>
  )
}
