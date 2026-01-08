import { cn } from "@/lib/utils"

export function CurrentSongTitle({ title, isPlaying }: { title: string; isPlaying: boolean }) {
  const isLongTitle = title.length >= 30

  if (isLongTitle) {
    return (
      <div className="max-w-[33ch] overflow-hidden text-xl whitespace-nowrap">
        <div
          className={cn(
            "animate-marquee inline-block pl-[100%]",
            !isPlaying && "animation-stopped",
          )}
        >
          {title}
        </div>
      </div>
    )
  }

  return <p className="max-w-[37ch] truncate text-xl font-semibold">{title}</p>
}
