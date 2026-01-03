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
import { Dices, Loader, Menu, Pause, Play, SkipForward } from "lucide-react"
import { useSetPlayState } from "@/hooks/use-set-play-state"
import { useSkip } from "@/hooks/use-skip"
import { useShuffle } from "@/hooks/use-shuffle"

type Props = {
  isPlaying: boolean
}

export function CurrentSongDropdown({ isPlaying }: Props) {
  const playStateMutation = useSetPlayState({ isPlaying })
  const skipMutation = useSkip()
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
      <DropdownMenuContent className="w-40" align="start">
        <DropdownMenuLabel>Piosenka</DropdownMenuLabel>
        <DropdownMenuGroup>
          <>
            {playStateMutation.isPending ? (
              <DropdownMenuItem>
                <Loader className="animate-spin animation-duration-[2s]" />
                Ładowanie...
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  playStateMutation.mutate()
                }}
              >
                {isPlaying ? <Pause /> : <Play />}
                {isPlaying ? "Zatrzymaj" : "Odtwórz"}
              </DropdownMenuItem>
            )}
          </>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              skipMutation.mutate()
            }}
          >
            <SkipForward />
            Pomiń
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Kolejka</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              shuffleMutation.mutate()
            }}
          >
            <Dices />
            Shuffle
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
