import { useAuth } from "@/features/auth/hooks/use-auth"
import { useLocalStorage } from "@/hooks/use-local-storage"

export const useIsModMode = () => {
  const { data } = useAuth()
  const [isModMode, setModMode] = useLocalStorage("mod-mode", false)

  if (!isModMode) {
    return { isModMode: false, setModMode }
  }

  if (!data || !data.isMod) {
    return { isModMode: false, setModMode }
  }

  return { isModMode: true, setModMode }
}
