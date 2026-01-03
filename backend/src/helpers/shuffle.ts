export function shuffle<T>(array: T[], startIndex = 0): T[] {
  for (let i = array.length - 1; i > startIndex; i--) {
    const j = Math.floor(Math.random() * (i - startIndex + 1)) + startIndex
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
