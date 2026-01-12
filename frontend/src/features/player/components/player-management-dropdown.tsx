import { useAuth } from "@/features/auth/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Dices,
  Loader,
  Menu,
  Pause,
  Play,
  Repeat,
  SkipForward,
  Trash,
  Volume1,
  VolumeX,
  type LucideIcon,
} from "lucide-react"
import { useSetPlayState } from "@/features/player/hooks/use-set-play-state"
import { useSkip } from "@/features/queue/hooks/use-skip"
import { useShuffle } from "@/features/queue/hooks/use-shuffle"
import { useLoopToggle } from "@/features/player/hooks/use-loop-toggle"
import { useClearQueue } from "@/features/queue/hooks/use-clear-queue"
import { cn } from "@/lib/utils"
import { useQueue } from "@/features/queue/hooks/use-queue"
import { usePlayerData } from "@/features/player/components/player-data-provider"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import {
  muteKeyboardShortcut,
  playKeyboardShortcut,
  shuffleKeyboardShortcut,
  toggleKeyboardShortcut,
  useKeyShortcuts,
} from "@/features/player/hooks/use-key-shortcuts"
import { useMuteToggle } from "@/features/player/hooks/use-mute-toggle"

export function PlayerManagementDropdown() {
  const { t } = useTranslate()
  const { isLoopEnabled, isPlaying, volume } = usePlayerData()
  const playStateMutation = useSetPlayState({ isPlaying })
  const skipMutation = useSkip()
  const loopMutation = useLoopToggle()
  const muteMutation = useMuteToggle()
  const { data } = useQueue()
  const clearQueueMutation = useClearQueue()
  const shuffleMutation = useShuffle()
  const auth = useAuth()
  const isMod = auth.data?.isMod || false

  useKeyShortcuts()

  if (!isMod) {
    return null
  }

  const isQueueEmpty = (data?.length ?? 0) <= 2

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <Menu size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-34 lg:w-60" align="start">
        <DropdownMenuLabel>{t("common.song")}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownItemWithLoader
            icon={isPlaying ? Pause : Play}
            isPending={playStateMutation.isPending}
            onSelect={() => playStateMutation.mutate()}
            loadingText={isPlaying ? t("player.loading.pause") : t("player.loading.play")}
            text={isPlaying ? t("player.pause") : t("player.play")}
            keyboardShortcut={playKeyboardShortcut}
          />
          <DropdownItemWithLoader
            icon={isLoopEnabled ? Repeat : Repeat}
            iconClassName={isLoopEnabled ? "text-green-500" : ""}
            isPending={loopMutation.isPending}
            onSelect={() => loopMutation.mutate()}
            loadingText={t("player.loading.loopToggle")}
            text={t("player.loopToggle")}
            keyboardShortcut={toggleKeyboardShortcut}
          />
          <DropdownItemWithLoader
            icon={volume === 0 ? VolumeX : Volume1}
            isPending={muteMutation.isPending}
            onSelect={() => muteMutation.mutate()}
            loadingText={t("player.loading.mute")}
            text={volume === 0 ? t("player.unmute") : t("player.mute")}
            keyboardShortcut={muteKeyboardShortcut}
          />
          <DropdownItemWithLoader
            icon={SkipForward}
            isPending={skipMutation.isPending}
            onSelect={() => skipMutation.mutate()}
            loadingText={t("player.loading.skip")}
            text={t("player.skip")}
            variant="destructive"
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("common.queue")}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownItemWithLoader
            icon={Dices}
            isPending={shuffleMutation.isPending}
            onSelect={() => shuffleMutation.mutate()}
            loadingText={t("player.loading.shuffle")}
            text={t("player.shuffle")}
            disabled={isQueueEmpty}
            keyboardShortcut={shuffleKeyboardShortcut}
          />
          <DropdownItemWithLoader
            icon={Trash}
            isPending={clearQueueMutation.isPending}
            onSelect={() => clearQueueMutation.mutate()}
            loadingText={t("player.loading.clearAll")}
            text={t("player.clearAll")}
            variant="destructive"
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DropdownItemWithLoader({
  isPending,
  onSelect,
  loadingText,
  iconClassName,
  text,
  icon: Icon,
  disabled,
  variant = "default",
  keyboardShortcut,
}: {
  isPending: boolean
  onSelect: (e: Event) => void
  loadingText: string
  text: string
  icon: LucideIcon
  disabled?: boolean
  iconClassName?: string
  variant?: "default" | "destructive"
  keyboardShortcut?: string
}) {
  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault()
        onSelect(e)
      }}
      variant={variant}
      disabled={isPending || disabled}
    >
      {isPending ? (
        <>
          <Loader className="animation-duration-[2s] animate-spin" />
          {loadingText}...
        </>
      ) : (
        <>
          <Icon className={cn(iconClassName)} />
          {text}
        </>
      )}
      {keyboardShortcut && (
        <DropdownMenuShortcut
          className={cn(variant === "destructive" && "text-destructive/80", "hidden md:inline")}
        >
          {keyboardShortcut}
        </DropdownMenuShortcut>
      )}
    </DropdownMenuItem>
  )
}
