import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  type LucideIcon,
} from "lucide-react"
import { useSetPlayState } from "@/hooks/use-set-play-state"
import { useSkip } from "@/hooks/use-skip"
import { useShuffle } from "@/hooks/use-shuffle"
import { useLoopToggle } from "@/hooks/use-loop-toggle"
import { useClearQueue } from "@/hooks/use-clear-queue"

type Props = {
  isPlaying: boolean
}

export function CurrentSongDropdown({ isPlaying }: Props) {
  const playStateMutation = useSetPlayState({ isPlaying })
  const skipMutation = useSkip()
  const loopMutation = useLoopToggle()
  const clearQueueMutation = useClearQueue()
  const shuffleMutation = useShuffle()
  const auth = useAuth()
  const isMod = auth.data?.isMod || false

  if (!isMod) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <Menu size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44" align="start">
        <DropdownMenuLabel>Piosenka</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownItemWithLoader
            icon={isPlaying ? Pause : Play}
            isPending={playStateMutation.isPending}
            onSelect={() => playStateMutation.mutate()}
            loadingText={isPlaying ? "Zatrzymuję" : "Odtwarzam"}
            text={isPlaying ? "Zatrzymaj" : "Odtwórz"}
          />
          <DropdownItemWithLoader
            icon={Repeat}
            isPending={loopMutation.isPending}
            onSelect={() => loopMutation.mutate()}
            loadingText="Zmieniam"
            text="Zapętlenie"
          />
          <DropdownItemWithLoader
            icon={SkipForward}
            isPending={skipMutation.isPending}
            onSelect={() => skipMutation.mutate()}
            loadingText="Pomijam"
            text="Pomiń"
            variant="destructive"
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Kolejka</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownItemWithLoader
            icon={Dices}
            isPending={shuffleMutation.isPending}
            onSelect={() => shuffleMutation.mutate()}
            loadingText="Tasuję"
            text="Przetasuj"
          />
          <DropdownItemWithLoader
            icon={Trash}
            isPending={clearQueueMutation.isPending}
            onSelect={() => clearQueueMutation.mutate()}
            loadingText="Poczekaj"
            text="Wyczyść wszystko"
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
  text,
  icon: Icon,
  variant = "default",
}: {
  isPending: boolean
  onSelect: (e: Event) => void
  loadingText: string
  text: string
  icon: LucideIcon
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault()
        onSelect(e)
      }}
      variant={variant}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader className="animate-spin animation-duration-[2s]" />
          {loadingText}...
        </>
      ) : (
        <>
          <Icon />
          {text}
        </>
      )}
    </DropdownMenuItem>
  )
}
