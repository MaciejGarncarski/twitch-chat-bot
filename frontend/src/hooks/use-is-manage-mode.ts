import { useLocation } from "@tanstack/react-router"

export const useIsManageMode = (): boolean => {
  const location = useLocation()

  return location.href === "/"
}
