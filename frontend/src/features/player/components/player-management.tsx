import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DurationIndicator } from "@/features/player/components/duration-indicator"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Dices,
  Loader,
  Pause,
  Play,
  Repeat,
  SkipForward,
  Trash,
  Volume1,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react"
import { useSetPlayState } from "@/features/player/hooks/use-set-play-state"
import { useSkip } from "@/features/queue/hooks/use-skip"
import { useShuffle } from "@/features/queue/hooks/use-shuffle"
import { useLoopToggle } from "@/features/player/hooks/use-loop-toggle"
import { useClearQueue } from "@/features/queue/hooks/use-clear-queue"
import { useQueue } from "@/features/queue/hooks/use-queue"
import { usePlayerData } from "@/features/player/components/player-data-provider"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { useKeyShortcuts } from "@/features/player/hooks/use-key-shortcuts"
import { useMuteToggle } from "@/features/player/hooks/use-mute-toggle"
import { useSetVolume } from "@/features/player/hooks/use-set-volume"
import { cn } from "@/lib/utils"

type PlayerManagementProps = {
  playTime: number
  duration: number
}

function ActionButton({
  isPending,
  onClick,
  icon: Icon,
  disabled,
  active,
  label,
  variant = "outline",
}: {
  isPending: boolean
  onClick?: () => void
  icon: LucideIcon
  disabled?: boolean
  active?: boolean
  label: string
  variant?: "outline" | "destructive"
}) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          size="icon-sm"
          variant={variant}
          onClick={onClick}
          disabled={isPending || disabled}
          aria-label={label}
          className={cn(active && "border-green-500 text-green-500")}
        >
          {isPending ? <Loader className="animate-spin" /> : <Icon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function PlayerManagement({ playTime, duration }: PlayerManagementProps) {
  const { t } = useTranslate()
  const { isLoopEnabled, isPlaying, volume } = usePlayerData()
  const playStateMutation = useSetPlayState({ isPlaying })
  const skipMutation = useSkip()
  const loopMutation = useLoopToggle()
  const muteMutation = useMuteToggle()
  const setVolumeMutation = useSetVolume()
  const { data } = useQueue()
  const clearQueueMutation = useClearQueue()
  const shuffleMutation = useShuffle()
  const auth = useAuth()
  const isMod = auth.data?.isMod || false

  useKeyShortcuts()

  const scaledVolume = Math.round(volume * 100)
  const [sliderValue, setSliderValue] = useState([scaledVolume])
  const [isDragging, setIsDragging] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)
  const commitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (commitTimeoutRef.current) {
        clearTimeout(commitTimeoutRef.current)
      }
    }
  }, [])

  const isVolumeDisabled = setVolumeMutation.isPending || isCommitting

  useEffect(() => {
    if (!isDragging && !isCommitting) {
      setSliderValue([scaledVolume])
    }
  }, [scaledVolume, isDragging, isCommitting])

  if (!isMod) {
    return null
  }

  const isQueueEmpty = (data?.length ?? 0) <= 2
  const VolumeIcon = scaledVolume === 0 ? VolumeX : scaledVolume < 20 ? Volume1 : Volume2

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <ActionButton
        icon={isPlaying ? Pause : Play}
        isPending={playStateMutation.isPending}
        onClick={() => playStateMutation.mutate()}
        label={isPlaying ? t("player.pause") : t("player.play")}
      />
      <DurationIndicator playTime={playTime} duration={duration} />
      <ActionButton
        icon={Repeat}
        isPending={loopMutation.isPending}
        onClick={() => loopMutation.mutate()}
        active={isLoopEnabled}
        label={t("player.loopToggle")}
      />
      <Dialog>
        <DialogTrigger
          render={
            <ActionButton
              icon={SkipForward}
              isPending={skipMutation.isPending}
              label={t("player.skip")}
            />
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("player.confirmSkip")}</DialogTitle>
            <DialogDescription>{t("player.confirmSkipDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{t("common.cancel")}</DialogClose>
            <DialogClose
              render={<Button variant="destructive" onClick={() => skipMutation.mutate()} />}
            >
              {t("player.skip")}
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger
          render={
            <ActionButton
              icon={Dices}
              isPending={shuffleMutation.isPending}
              label={t("player.shuffle")}
              disabled={isQueueEmpty}
            />
          }
        />

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("player.confirmShuffle")}</DialogTitle>
            <DialogDescription>{t("player.confirmShuffleDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{t("common.cancel")}</DialogClose>
            <DialogClose render={<Button onClick={() => shuffleMutation.mutate()} />}>
              {t("player.shuffle")}
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger
          render={
            <ActionButton
              icon={Trash}
              isPending={clearQueueMutation.isPending}
              label={t("player.clearAll")}
              variant="destructive"
            />
          }
        />

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("player.confirmClearAll")}</DialogTitle>
            <DialogDescription>{t("player.confirmClearAllDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{t("common.cancel")}</DialogClose>
            <DialogClose
              render={<Button variant="destructive" onClick={() => clearQueueMutation.mutate()} />}
            >
              {t("player.clearAll")}
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Tooltip>
        <TooltipTrigger>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => muteMutation.mutate()}
            disabled={muteMutation.isPending}
            aria-label={scaledVolume === 0 ? t("player.unmute") : t("player.mute")}
          >
            {muteMutation.isPending ? <Loader className="animate-spin" /> : <VolumeIcon />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {scaledVolume === 0 ? t("player.unmute") : t("player.mute")}
        </TooltipContent>
      </Tooltip>
      <div className="w-24 shrink-0">
        <Slider
          value={sliderValue}
          disabled={isVolumeDisabled}
          onValueChange={(value) => {
            setSliderValue(Array.isArray(value) ? value : [value])
            setIsDragging(true)
          }}
          onValueCommitted={(value) => {
            const v = Array.isArray(value) ? value[0] : value
            setIsDragging(false)
            setIsCommitting(true)

            if (commitTimeoutRef.current) {
              clearTimeout(commitTimeoutRef.current)
            }

            commitTimeoutRef.current = setTimeout(() => {
              setVolumeMutation.mutate(v, {
                onSettled: () => setIsCommitting(false),
              })
            }, 200)
          }}
          aria-label={t("player.volume")}
        />
      </div>
      <span className="text-muted-foreground min-w-[3ch] text-sm tabular-nums">
        {scaledVolume}%
      </span>
    </div>
  )
}
