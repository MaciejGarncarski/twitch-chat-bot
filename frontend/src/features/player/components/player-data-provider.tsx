import { usePlayerWebsocket } from "@/features/player/hooks/use-player-websocket"
import type { PlayerDataReturn } from "@/features/player/schemas/player-ws"
import { createContext, useContext } from "react"

type PlayerDataProviderProps = {
  children: React.ReactNode
}

const initialState: PlayerDataReturn = {
  volume: 0,
  playTime: 0,
  isPlaying: false,
  songId: null,
  isLoopEnabled: false,
  status: "loading",
}

const PlayerDataContext = createContext<PlayerDataReturn>(initialState)

export function PlayerDataProvider({ children, ...props }: PlayerDataProviderProps) {
  const value = usePlayerWebsocket()

  return (
    <PlayerDataContext.Provider {...props} value={value}>
      {children}
    </PlayerDataContext.Provider>
  )
}

export const usePlayerData = () => {
  const context = useContext(PlayerDataContext)

  if (context === undefined)
    throw new Error("usePlayerData must be used within a PlayerDataProvider")

  return context
}
