import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { logOnStart } from "@/helpers/log-on-start";
import { env } from "@/config/env";
import { ChatWebSocket, songQueue } from "@/connectors/chat-ws";
import { sendChatMessage } from "@/api/send-chat-message";
import { setBunServer } from "@/helpers/init-ws";
import { playbackManager } from "@/core/playback-manager";
import { CACHE_DIR } from "@/helpers/cache";
import { join } from "node:path";
import { stat } from "fs/promises";
import { logger } from "@/helpers/logger";
import { twitchAuth } from "@/core/twitch-auth-manager";

const HLS_MIME_TYPES: Record<string, string> = {
  ".m3u8": "application/vnd.apple.mpegurl",
  ".ts": "video/mp2t",
};

async function init() {
  await twitchAuth.fetchUserId();
  await twitchAuth.refresh();
  new ChatWebSocket();
}

await init();

export const app = new Elysia()
  .use(
    cors({
      origin: env.APP_ORIGINS,
    })
  )
  .onStart(async ({ server }) => {
    logOnStart();
    await sendChatMessage(
      `Bot uruchomiony${env.NODE_ENV === "development" ? " (dev)" : ""}`
    );
    setBunServer(server);

    if (env.NODE_ENV === "development") {
      // await songQueue.add({
      //   username: "maciej_ga",
      //   videoUrl: "https://www.youtube.com/watch?v=xuP4g7IDgDM",
      //   videoId: "xuP4g7IDgDM",
      // });
      await songQueue.add({
        username: "maciej_ga",
        videoUrl: "https://www.youtube.com/watch?v=E8gmARGvPlI",
        videoId: "E8gmARGvPlI",
      });
    }
  })
  .onStop(async () => {
    await sendChatMessage("Bot wyłączony StinkyGlitch");
  })
  .onError(async ({ code, status }) => {
    if (code === "NOT_FOUND") {
      return status(404, {
        status: "Endpoint not found",
      });
    }
  })
  .group("/api", (app) => {
    return app
      .get("/", async () => {
        return "hi";
      })
      .get("/queue", async () => {
        const data = songQueue.getQueue();
        return data;
      })
      .get(
        "/stream/:videoId/:fileNameWithExt",
        async ({ params, set, status }) => {
          const { videoId, fileNameWithExt } = params;

          if (videoId === "undefined" || fileNameWithExt === "undefined") {
            return status(400, "Invalid videoId or fileName.");
          }

          const pathWithVideoId = join(CACHE_DIR, videoId);
          const filePath = join(pathWithVideoId, fileNameWithExt);

          const ext = fileNameWithExt
            .substring(fileNameWithExt.lastIndexOf("."))
            .toLowerCase();

          const contentType = HLS_MIME_TYPES[ext];

          if (!contentType) {
            console.error(
              `Attempted to serve file with unsupported extension: ${ext}`
            );
            return status(403, "File type not supported for streaming.");
          }

          try {
            const fileStats = await stat(filePath);

            if (!fileStats.isFile()) {
              return status(404, "File not found or is not a file.");
            }

            set.headers["Content-Type"] = contentType;
            set.headers["Content-Length"] = fileStats.size.toString();

            if (ext === ".ts") {
              set.headers["Cache-Control"] =
                "public, max-age=31536000, immutable";
            } else {
              set.headers["Cache-Control"] = "no-cache";
            }

            return Bun.file(filePath);
          } catch (error) {
            console.error(`Error serving HLS file: ${filePath}`, error);
            return status(404, "Stream segment not found.");
          }
        }
      )
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
          ws.subscribe("playback-status");
        },
        message(ws, msg) {},
        close(ws, code, reason) {},
      });
  })
  .listen({ port: env.PORT || 3001 });

process.on("SIGINT", () => {
  logger.info("Received SIGINT. Stopping server...");
  app.stop().then(() => {
    logger.info("Server stopped");
    process.exit(0);
  });
});
export type App = typeof app;
