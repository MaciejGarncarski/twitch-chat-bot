import { apiURL } from "@/api/api-treaty"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TwitchIcon } from "@/features/auth/components/twitch-icon"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useSignOut } from "@/features/auth/hooks/use-sign-out"
import { useTranslate } from "@/features/i18n/hooks/use-translate"
import { cn } from "@/lib/utils"
import { Loader, LogOut, User } from "lucide-react"

const oauthUrl = apiURL + "api/auth/sign-in"

export function TwitchAuthButton() {
  const { t } = useTranslate()
  const { data, isLoading, isFetching } = useAuth()
  const signOutMutation = useSignOut()

  if (isLoading) {
    return (
      <Button type="button" variant={"outline"} disabled className={"cursor-pointer"}>
        <Loader size={16} className="mr-2 animate-spin" />
        {t("auth.loading.login")}
      </Button>
    )
  }

  if (data?.user?.login) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={"cursor-pointer"}
            disabled={isFetching || signOutMutation.isPending}
          >
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
          <DropdownMenuLabel>{t("auth.account")}</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                signOutMutation.mutate()
              }}
              variant="destructive"
            >
              <LogOut />
              {signOutMutation.isPending ? t("auth.loading.logout") : t("auth.logout")}
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
      {t("auth.login")}
    </a>
  )
}
