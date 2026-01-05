import { cn } from "@/lib/utils"

export function CurrentSongTitle({ title, isPlaying }: { title: string; isPlaying: boolean }) {
  const isLongTitle = title.length >= 30

  if (isLongTitle) {
    return (
      <div className="overflow-hidden whitespace-nowrap max-w-[33ch] text-xl">
        <div
          className={cn(
            "inline-block pl-[100%] animate-marquee",
            !isPlaying && "animation-stopped",
          )}
        >
          {title}
        </div>
      </div>
    )
  }

  return <p className="text-xl font-semibold max-w-[37ch] truncate">{title}</p>
}
