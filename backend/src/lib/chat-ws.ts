import { sendChatMessage } from "@/api/send-chat-message";
import { env } from "@/config/env";
import { getYtVideo } from "@/lib/get-yt-video";
import { logger } from "@/lib/logger";
import { SongQueue } from "@/lib/queue";
import { twitchMessageSchema } from "@/schemas/twitch-ws-message";
import { formatDuration } from "@/utils/format-duration";

await unsubscribeAll();

export const songQueue = new SongQueue();

export class ChatWebSocket {
  private ws: WebSocket;
  private sessionId: string;

  constructor() {
    this.sessionId = "";
    this.ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

    this.ws.addEventListener("message", async ({ data }) => {
      this.handleMessage(data);
    });
  }

  async handleMessage(data: string) {
    const parsed = twitchMessageSchema.parse(JSON.parse(data));

    if (parsed?.payload?.session?.id) {
      if (!this.sessionId) {
        await subscribeToChat(parsed.payload.session.id);
      }

      this.sessionId = parsed.payload.session.id;
    }

    if (parsed.metadata.message_type === "session_reconnect") {
      if (!parsed.payload?.session?.reconnect_url) {
        throw new Error("Invalid recconect_url");
      }

      this.ws.close();
      this.ws = new WebSocket(parsed.payload.session.reconnect_url);
    }

    if (parsed.metadata.message_type === "notification") {
      const messageText = parsed.payload.event?.message?.text;

      if (!messageText) {
        return;
      }

      logger.info(messageText);

      const regex =
        /^!sr\s+(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;

      const match = messageText.match(regex);

      if (!match) {
        return;
      }

      const messageId = parsed.payload.event?.message_id;
      const videoId = match[1];
      const videoLink = `https://www.youtube.com/watch?v=${videoId}`;
      const user = parsed.payload.event?.chatter_user_name;

      if (!user) {
        throw new Error("No user ID");
      }

      try {
        const added = await songQueue.add({
          userId: user,
          videoUrl: videoLink,
        });

        await sendChatMessage(
          `Dodano do kolejki ${videoLink} przez @${user} (długość: ${formatDuration(
            added.duration
          )}). Pozycja w kolejce ${added.position}. Odtwarzanie za ${
            added.formattedTimeUntilPlay
          }.`,
          messageId
        );
      } catch (e) {
        if (e instanceof Error) {
          logger.error(e.message);

          if (e.message === "ALREADY_EXISTS") {
            await sendChatMessage(
              `FootYellow Filmik już dodany FootYellow`,
              messageId
            );

            return;
          }

          if (e.message === "TOO_LONG") {
            await sendChatMessage(
              `FootYellow Za długi filmik ${videoLink} dodany przez @${user} FootYellow`,
              messageId
            );

            return;
          }

          if (e.message === "TOO_SHORT") {
            await sendChatMessage(
              `FootYellow Za krótki filmik ${videoLink} dodany przez @${user} FootYellow`,
              messageId
            );

            return;
          }
        }

        await sendChatMessage(
          `FootYellow Nie udało się dodać do kolejki ${videoLink} przez @${user} FootYellow`,
          messageId
        );
      }
    }
  }
}

async function unsubscribeAll() {
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
    console.log("✅ Unsubscribed successfully");
  } else {
    const text = await res.text();
    console.error("❌ Failed to unsubscribe:", text);
  }
}

async function subscribeToChat(sessId: string) {
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
          broadcaster_user_id: "487187142",
          user_id: "487187142",
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

  logger.info("Subscribed to chat");
}
