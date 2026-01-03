import { treaty } from "@elysiajs/eden"
import type { App as AppTreaty } from "@ttv-song-request/eden-rpc"

export const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"
export const api = treaty<AppTreaty>(apiURL, {
  fetch: {
    credentials: "include",
  },
})
