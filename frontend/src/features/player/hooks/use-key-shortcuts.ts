import { usePlayerData } from "@/features/player/components/player-data-provider"
import { useLoopToggle } from "@/features/player/hooks/use-loop-toggle"
import { useMuteToggle } from "@/features/player/hooks/use-mute-toggle"
import { usePlayerHotkey } from "@/features/player/hooks/use-player-hotkey"
import { useSeekPosition } from "@/features/player/hooks/use-seek-position"
import { useSetPlayState } from "@/features/player/hooks/use-set-play-state"
import { useSetVolume } from "@/features/player/hooks/use-set-volume"
import { useShuffle } from "@/features/queue/hooks/use-shuffle"
import { ctrlOsBased } from "@/utils/ctrl-os-based"
import { debounce } from "@tanstack/pacer"

const forwardSeekAmount = 5
const backwardSeekAmount = -5

const volumeStep = 0.05

const modifier = `${ctrlOsBased}+Shift`
export const playKeyboardShortcut = `${modifier}+P`
export const toggleKeyboardShortcut = `${modifier}+L`
export const shuffleKeyboardShortcut = `${modifier}+H`
export const seekForwardKeyboardShortcut = `${modifier}+Right`
export const seekBackwardKeyboardShortcut = `${modifier}+Left`
export const volumeUpKeyboardShortcut = `${modifier}+Up`
export const volumeDownKeyboardShortcut = `${modifier}+Down`
export const muteKeyboardShortcut = `${modifier}+M`

export function useKeyShortcuts() {
  const { isLoopEnabled, isPlaying, volume, playTime } = usePlayerData()
  const playStateMutation = useSetPlayState({ isPlaying })
  const loopMutation = useLoopToggle()
  const shuffleMutation = useShuffle()
  const seekMutation = useSeekPosition()
  const volumeMutation = useSetVolume()
  const muteMutation = useMuteToggle()

  const seekForward = debounce(
    () => {
      const newPosition = playTime + forwardSeekAmount
      seekMutation.mutate(newPosition)
    },
    {
      wait: 200,
    },
  )

  const seekBackward = debounce(
    () => {
      const newPosition = Math.max(0, playTime + backwardSeekAmount)
      seekMutation.mutate(newPosition)
    },
    {
      wait: 200,
    },
  )

  const volumeUp = debounce(
    () => {
      const newDecimal = Math.min(1, volume + volumeStep)
      const scaledVolume = Math.round(newDecimal * 100)

      volumeMutation.mutate(scaledVolume)
    },
    { wait: 50 },
  )

  const volumeDown = debounce(
    () => {
      const newDecimal = Math.max(0, volume - volumeStep)
      const scaledVolume = Math.round(newDecimal * 100)

      volumeMutation.mutate(scaledVolume)
    },
    { wait: 50 },
  )

  usePlayerHotkey(muteKeyboardShortcut, () => {
    muteMutation.mutate()
  }, [muteMutation])

  usePlayerHotkey(playKeyboardShortcut, () => {
    playStateMutation.mutate()
  }, [isPlaying, playStateMutation])

  usePlayerHotkey(volumeUpKeyboardShortcut, () => {
    volumeUp()
  }, [volume, volumeMutation])

  usePlayerHotkey(volumeDownKeyboardShortcut, () => {
    volumeDown()
  }, [volume, volumeMutation])

  usePlayerHotkey(seekForwardKeyboardShortcut, () => {
    seekForward()
  }, [playTime, seekMutation])

  usePlayerHotkey(seekBackwardKeyboardShortcut, () => {
    seekBackward()
  }, [playTime, seekMutation])

  usePlayerHotkey(toggleKeyboardShortcut, () => {
    loopMutation.mutate()
  }, [isLoopEnabled, loopMutation])

  usePlayerHotkey(shuffleKeyboardShortcut, () => {
    shuffleMutation.mutate()
  }, [shuffleMutation])
}
