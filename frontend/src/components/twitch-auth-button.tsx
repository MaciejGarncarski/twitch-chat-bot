import { apiURL } from "@/api/api-treaty"
import { TwitchIcon } from "@/components/twitch-icon"
import { Button, buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useSignOut } from "@/hooks/use-sign-out"
import { cn } from "@/lib/utils"

export function TwitchAuthButton() {
  const oauthUrl = apiURL + "api/auth/sign-in"
  const { data, isLoading } = useAuth()
  const signOutMutation = useSignOut()

  if (isLoading) {
    return (
      <a
        className={cn(
          buttonVariants({
            variant: "default",
            className: "cursor-pointer ml-auto ",
          }),
        )}
      >
        Loading...
      </a>
    )
  }

  if (data?.user?.login) {
    return (
      <div className="flex justify-between mx-4">
        <span>Signed in as {data.user.login}</span>
        <Button
          type="button"
          variant={"destructive"}
          onClick={() => signOutMutation.mutate()}
          className={"cursor-pointer"}
        >
          {signOutMutation.isPending ? "Signing out..." : "Sign out"}
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
      Sign in with Twitch
    </a>
  )
}
