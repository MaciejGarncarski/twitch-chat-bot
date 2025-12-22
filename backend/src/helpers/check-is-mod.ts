type ChatBadge = {
  set_id: string
  id: string
  info?: string
}

export function checkIsMod(
  badges: ChatBadge[] | null | undefined,
  chatterId?: string,
  broadcasterId?: string,
): boolean {
  if (!badges) return false

  const isModerator = badges.some((badge) => badge.set_id === 'moderator')

  const isBroadcaster =
    chatterId !== undefined && broadcasterId !== undefined && chatterId === broadcasterId

  return isModerator || isBroadcaster
}
