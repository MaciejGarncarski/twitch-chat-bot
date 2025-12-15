import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { logOnStart } from "@/utils/log-on-start";
import { env } from "@/config/env";
import { ChatWebSocket, songQueue } from "@/lib/chat-ws";
import { sendChatMessage } from "@/api/send-chat-message";
import { setBunServer } from "@/utils/init-ws";
import { playbackManager } from "@/lib/playback-manager";

new ChatWebSocket();

export const app = new Elysia()
  .use(
    cors({
      origin:
        env.NODE_ENV === "development"
          ? ["http://localhost:3000", env.APP_ORIGIN]
          : [env.APP_ORIGIN],
    })
  )
  .onStart(async ({ server }) => {
    logOnStart();
    await sendChatMessage("CoolCat Inicjalizacja bota zakończona GoatEmotey");
    setBunServer(server);
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
  .get("/song/:id", async ({ params, set, status }) => {
    const id = params.id;
    const item = songQueue.getQueue().find((item) => item.id === id);

    if (!item) {
      return status(404, "Song not found");
    }

    return "OK";
  })
  .post("/pause", async () => {
    playbackManager.pause();
    return {
      status: "ok",
    };
  })
  .post("/play", async () => {
    playbackManager.play();
    return {
      status: "ok",
    };
  })
  .ws("/ws", {
    open(ws) {
      console.log("New WebSocket connection established.");
      ws.subscribe("playback-status");
    },
    message(ws, msg) {
      console.log(msg);
    },
    close(ws, code, reason) {
      console.log(`WebSocket connection closed: ${code} - ${reason}`);
    },
  })
  .listen({ port: env.PORT || 3001 });

process.on("SIGINT", () => {
  console.log("Received SIGINT. Stopping server...");
  app.stop().then(() => {
    console.log("Server stopped");
    process.exit(0);
  });
});
export type App = typeof app;
