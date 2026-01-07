import { apiURL } from "@/api/api-treaty"
import { TwitchIcon } from "@/components/twitch-icon"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { useSignOut } from "@/hooks/use-sign-out"
import { cn } from "@/lib/utils"
import { Loader, LogOut, User } from "lucide-react"

export function TwitchAuthButton() {
  const oauthUrl = apiURL + "api/auth/sign-in"
  const { data, isLoading } = useAuth()
  const signOutMutation = useSignOut()

  if (isLoading) {
    return (
      <Button type="button" variant={"ghost"} className={"cursor-pointer"}>
        <Loader size={16} className="mr-2 animate-spin" />
        Chwila
      </Button>
    )
  }

  if (data?.user?.login) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={"cursor-pointer"}>
            {data.user.avatar ? (
              <img
                src={data.user.avatar}
                alt={`${data.user.login}'s avatar`}
                className="mr-1 h-5 w-5"
              />
            ) : (
              <User size={18} className="mr-2" />
            )}
            {data.user.login}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Konto</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                signOutMutation.mutate()
              }}
              variant="destructive"
            >
              <LogOut />
              {signOutMutation.isPending ? "Wylogowywanie..." : "Wyloguj się"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <a
      href={oauthUrl}
      className={cn(
        buttonVariants({
          variant: "default",
          className: "cursor-pointer bg-[#9146FF] text-white [a]:hover:bg-[#772ce8]",
        }),
      )}
    >
      <TwitchIcon className="mr-1" />
      Zaloguj się
    </a>
  )
}
