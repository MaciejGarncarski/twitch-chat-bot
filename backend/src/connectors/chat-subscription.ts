import { twitchAuth } from "@/core/twitch-auth-manager"
import { logger } from "@/helpers/logger"

type EventSubSubscription = {
  id: string
  type: string
  status?: string
  transport?: {
    method?: string
    session_id?: string
  }
}

export async function unsubscribeAll() {
  const res = await twitchAuth.fetch("https://api.twitch.tv/helix/eventsub/subscriptions")
  const { data } = await res.json()

  const promises = data.map((sub: { id: string }) => unsubscribe(sub.id))
  await Promise.all(promises)

  logger.info("[CHAT SUBSCRIPTION] Finished clearing all subscriptions")
}

async function unsubscribe(subscriptionId: string) {
  const res = await twitchAuth.fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionId}`,
    {
      method: "DELETE",
    },
  )

  if (res.status === 204) {
    logger.info("[CHAT SUBSCRIPTION] Unsubscribed successfully")
  } else {
    const text = await res.text()
    logger.info(`[CHAT SUBSCRIPTION] Unsubscribed successfully: ${text}`)
  }
}

export async function subscribeToChat(sessId: string) {
  const res = await twitchAuth.fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "channel.chat.message",
      version: "1",
      condition: {
        broadcaster_user_id: twitchAuth.broadcasterId,
        user_id: twitchAuth.userId,
      },
      transport: {
        method: "websocket",
        session_id: sessId,
      },
    }),
  })

  if (!res.ok) {
    logger.error(await res.text())
    throw new Error("Cannot sub")
  }

  logger.info("[CHAT SUBSCRIPTION] Subscribed to chat")
}

export async function ensureChatSubscription(sessId: string) {
  const listRes = await twitchAuth.fetch("https://api.twitch.tv/helix/eventsub/subscriptions")
  const listJson = await listRes.json()
  const subs: Array<EventSubSubscription> = listJson?.data ?? []

  const chatSubs = subs.filter((s) => s.type === "channel.chat.message")
  const activeForSession = chatSubs.find(
    (s) =>
      s?.transport?.method === "websocket" &&
      s?.transport?.session_id === sessId &&
      s?.status === "enabled",
  )

  if (activeForSession && chatSubs.length === 1) {
    logger.info("[CHAT SUBSCRIPTION] Chat subscription already active for current session.")
    return
  }

  if (chatSubs.length > 0) {
    logger.info(
      `[CHAT SUBSCRIPTION] Clearing ${chatSubs.length} stale/duplicate chat subscriptions`,
    )
    await Promise.all(chatSubs.map((sub) => unsubscribe(sub.id)))
  }

  await subscribeToChat(sessId)
}
