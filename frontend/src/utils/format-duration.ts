export const formatDuration = (totalSeconds: number): string => {
  if (totalSeconds < 0 || !Number.isFinite(totalSeconds)) {
    return '0:00'
  }

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = seconds.toString().padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${formattedMinutes}:${formattedSeconds}`
  } else {
    return `${minutes}:${formattedSeconds}`
  }
}
