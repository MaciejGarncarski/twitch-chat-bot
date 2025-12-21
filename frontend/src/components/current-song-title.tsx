export function CurrentSongTitle({ title }: { title: string }) {
  const isLongTitle = title.length >= 38

  console.log(title, title.length)

  if (isLongTitle) {
    return (
      <div className="overflow-hidden whitespace-nowrap max-w-[39ch] text-xl">
        <div className="inline-block animate-marquee pl-[100%]">{title}</div>
      </div>
    )
  }

  return <p className="text-xl font-semibold max-w-[37ch] truncate">{title}</p>
}
