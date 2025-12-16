import { treaty } from '@elysiajs/eden'
import type { App as AppTreaty } from '@ttv-song-request/eden-rpc'

export const api = treaty<AppTreaty>('localhost:3001')
