import { useAuth } from "@/features/auth/hooks/use-auth"

export const useIsModMode = () => {
  const { data } = useAuth()

  return { isModMode: data?.isMod || false }
}
