import { env } from "@/config/env";

export const sendChatMessage = async (
  message: string,
  replyChatId?: string
) => {
  await fetch("https://api.twitch.tv/helix/chat/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.TWITCH_OAUTH_TOKEN}`,
      "Client-Id": env.TWITCH_CLIENT_ID,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      broadcaster_id: env.TWITCH_BROADCASTER_ID,
      sender_id: env.TWITCH_USER_ID,
      message: message,
      reply_parent_message_id: replyChatId ? replyChatId : undefined,
    }),
  });
};
