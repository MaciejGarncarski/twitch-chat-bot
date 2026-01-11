import { useLocation } from "@tanstack/react-router"

export const useIsManagementPage = (): boolean => {
  const location = useLocation()

  return location.href === "/"
}
