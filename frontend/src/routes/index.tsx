import { createFileRoute } from '@tanstack/react-router'
import { treaty } from '@elysiajs/eden'
import type { App as AppTreaty } from '@ttv-song-request/eden-rpc'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { z } from 'zod'
import { getWebsocket } from '@/lib/websocket'
import { Button } from '@/components/ui/button'

const playbackSchema = z.object({
  isPlaying: z.boolean(),
  volume: z.number(),
  playTime: z.number(),
  startedAt: z.number().nullable(),
  songId: z.string().nullable(),
})

export const Route = createFileRoute('/')({
  component: App,
})

const api = treaty<AppTreaty>('localhost:3001')

function App() {
  const { isLoading, data } = useQuery({
    queryKey: ['queue'],
    queryFn: async () => {
      const data = await api.queue.get()
      return data.data
    },
    refetchInterval: 5000,
  })

  useEffect(() => {
    const websocket = getWebsocket()

    websocket.subscribe((message) => {
      console.log('got', message)
    })

    websocket.on('open', () => {
      websocket.send('hello from client')
    })

    return () => {
      websocket.close()
    }
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="text-center">
      <div className="bg-black">
        {data?.map((item) => (
          <div key={item.id} className="p-4 border-b border-gray-700 flex items-center">
            {item.thumbnail && (
              <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-16 object-cover mr-4 rounded border border-gray-500"
                />
              </a>
            )}
            <div className="text-left">
              <div className="text-white font-semibold">{item.title}</div>
              <div className="text-gray-400 text-sm">
                Position: {item.position} | Duration: {Math.floor(item.duration / 60)}:
                {item.duration % 60 < 10 ? '0' : ''}
                {item.duration % 60} | Time Until Play: {item.formattedTimeUntilPlay}
              </div>
            </div>
          </div>
        ))}

        <div>
          <Button onClick={() => api.pause.post()}>Pause</Button>
          <Button onClick={() => api.play.post()}>Play</Button>
        </div>
      </div>
    </div>
  )
}
