import type { App as AppTreaty } from '@ttv-song-request/eden-rpc'
import { treaty } from '@elysiajs/eden'

const api = treaty<AppTreaty>('localhost:3001')

let websocket: ReturnType<typeof api.ws.subscribe> | null = null

export function getWebsocket() {
  if (!websocket) {
    websocket = api.ws.subscribe()

    websocket.on('open', () => {
      console.log('WebSocket opened')
      websocket?.send('hello from client')
    })

    websocket.subscribe((message) => {
      console.log('received message:', message)
    })

    websocket.on('close', () => {
      console.log('WebSocket closed')
      websocket = null
    })
  }

  return websocket
}
