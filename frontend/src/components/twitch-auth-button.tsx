import { apiURL } from "@/api/api-treaty"
import { TwitchIcon } from "@/components/twitch-icon"
import { Button, buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useSignOut } from "@/hooks/use-sign-out"
import { cn } from "@/lib/utils"
import { Loader, User } from "lucide-react"

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
      <div className="flex justify-between items-center gap-8">
        <a
          className={cn(
            buttonVariants({
              variant: "outline",
              className: " ml-auto ",
            }),
          )}
        >
          <User size={18} /> {data.user.login}
        </a>
        <Button
          type="button"
          variant={"destructive"}
          onClick={() => signOutMutation.mutate()}
          className={"cursor-pointer"}
        >
          {signOutMutation.isPending ? "Wylogowywanie..." : "Wyloguj się"}
        </Button>
      </div>
    )
  }

  return (
    <a
      href={oauthUrl}
      className={cn(
        buttonVariants({
          variant: "default",
          className: "cursor-pointer ml-auto bg-[#9146FF] text-white [a]:hover:bg-[#772ce8]",
        }),
      )}
    >
      <TwitchIcon className="mr-1" />
      Zaloguj się
    </a>
  )
}
