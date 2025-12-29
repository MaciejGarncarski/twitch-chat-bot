import { Volume, Volume1, Volume2, VolumeX } from "lucide-react"

export function VolumeIndicator({ volume }: { volume: number }) {
  return (
    <p className="flex items-center gap-1 ">
      {volume === 0 ? (
        <VolumeX size={18} className="inline-block mr-1" />
      ) : volume < 0.2 ? (
        <Volume size={18} className="inline-block mr-1" />
      ) : volume < 0.5 ? (
        <Volume1 size={18} className="inline-block mr-1" />
      ) : (
        <Volume2 size={18} className="inline-block mr-1" />
      )}
      {volume * 100 || 0}%
    </p>
  )
}
