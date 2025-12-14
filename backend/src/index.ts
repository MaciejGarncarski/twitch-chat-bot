import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { logOnStart } from "@/utils/log-on-start";
import { wrap } from "@bogeychan/elysia-logger";
import { logger } from "@/lib/logger";
import { env } from "@/config/env";
import { ChatWebSocket, songQueue } from "@/lib/chat-ws";
import { sendChatMessage } from "@/api/send-chat-message";
import { getBunServer, setBunServer } from "@/utils/init-ws";
import { serve } from "bun";

new ChatWebSocket();

export const app = new Elysia()
  .use(wrap(logger))
  .use(
    cors({
      origin: env.APP_ORIGIN,
    })
  )
  .onStart(async ({ server }) => {
    logOnStart();
    await sendChatMessage("CoolCat Bot działa GoatEmotey");
    setBunServer(server);
    throw new Error();
  })
  .onStop(async () => {
    await sendChatMessage("Bot wyłączony ResidentSleeper");
  })
  .onError(async ({ code, status }) => {
    console.log({ code, status });
    if (code === "NOT_FOUND") {
      return status(404, {
        status: "Endpoint not found",
      });
    }
  })
  .get("/", async () => {
    return "hi";
  })
  .get("/queue", async () => {
    const data = songQueue.getQueue();
    return data;
  })
  .post("/next", async ({ set }) => {
    const nextItem = await songQueue.prepareNext();
    if (!nextItem) {
      set.status = 204;
      return "Kolejka pusta.";
    }
    return { id: nextItem.id };
  })
  .get("/play-current", async ({ set, request }) => {
    const current = songQueue.getCurrent();
    if (!current) {
      set.status = 404;
      return;
    }

    set.headers["Content-Type"] = "audio/mpeg";
    set.headers["Accept-Ranges"] = "bytes";

    const ffmpeg = Bun.spawn([
      "ffmpeg",
      "-reconnect",
      "1",
      "-reconnect_streamed",
      "1",
      "-reconnect_delay_max",
      "5",
      "-i",
      current.audioUrl,
      "-vn",
      "-c:a",
      "mp3",
      "-f",
      "mp3",
      "pipe:1",
    ]);

    return new Response(ffmpeg.stdout);
  })
  .ws("/ws", {
    open(ws) {
      console.log("New WebSocket connection established.");
      ws.subscribe("playback");
    },
    message(ws, msg) {
      console.log(msg);
    },
    close(ws, code, reason) {
      console.log(`WebSocket connection closed: ${code} - ${reason}`);
    },
  })
  .listen(env.PORT);

process.on("SIGINT", () => {
  console.log("Received SIGINT. Stopping server...");
  app.stop().then(() => {
    console.log("Server stopped");
    process.exit(0);
  });
});
export type App = typeof app;
