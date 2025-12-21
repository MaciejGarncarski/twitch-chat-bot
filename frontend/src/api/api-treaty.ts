import { treaty } from '@elysiajs/eden'
import type { App as AppTreaty } from '@ttv-song-request/eden-rpc'

export const api = treaty<AppTreaty>(import.meta.env.VITE_API_URL || 'http://localhost:3001/api')
