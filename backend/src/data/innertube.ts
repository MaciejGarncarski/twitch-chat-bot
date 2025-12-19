import { env } from "@/config/env";
import { Innertube, UniversalCache } from "youtubei.js";

export const innertube = await Innertube.create({
  cache: new UniversalCache(true, "../yt-metadata-cache"),
  cookie: env.YT_COOKIE,
});
