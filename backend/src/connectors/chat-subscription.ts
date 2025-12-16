import { env } from "@/config/env";
import { logger } from "@/helpers/logger";

export async function unsubscribeAll() {
  const res = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      headers: {
        Authorization: `Bearer ${env.TWITCH_OAUTH_TOKEN}`,
        "Client-Id": env.TWITCH_CLIENT_ID,
      },
    }
  );

  const data = await res.json();

  for (const sub of data.data) {
    await unsubscribe(sub.id);
  }
}

async function unsubscribe(subscriptionId: string) {
  const res = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${env.TWITCH_OAUTH_TOKEN}`,
        "Client-Id": env.TWITCH_CLIENT_ID,
      },
    }
  );

  if (res.status === 204) {
    logger.info("[CHAT SUBSCRIPTION] Unsubscribed successfully");
  } else {
    const text = await res.text();
    logger.info(`[CHAT SUBSCRIPTION] Unsubscribed successfully: ${text}`);
  }
}

export async function subscribeToChat(sessId: string) {
  const res = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.TWITCH_OAUTH_TOKEN}`,
        "Client-Id": env.TWITCH_CLIENT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "channel.chat.message",
        version: "1",
        condition: {
          broadcaster_user_id: env.TWITCH_BROADCASTER_ID,
          user_id: env.TWITCH_USER_ID,
        },
        transport: {
          method: "websocket",
          session_id: sessId,
        },
      }),
    }
  );

  if (!res.ok) {
    logger.error(await res.text());
    throw new Error("Cannot sub");
  }

  logger.info("[CHAT SUBSCRIPTION] Subscribed to chat");
}
