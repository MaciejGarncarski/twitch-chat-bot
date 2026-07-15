const modCache = new Map<string, boolean>()

export function updateModCache(userId: string, isMod: boolean): void {
  modCache.set(userId, isMod)
}

export function getModStatus(userId: string): boolean | undefined {
  return modCache.get(userId)
}
