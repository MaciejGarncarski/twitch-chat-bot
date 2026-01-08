import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

type ThemeToggleProps = {
  withText?: boolean
}

const iconSizeClass = "h-[1.3rem] w-[1.3rem] mr-1"

export function ThemeToggle({ withText = true }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={withText ? "default" : "icon"}>
          {theme === "light" && <Sun className={iconSizeClass} />}
          {theme === "dark" && <Moon className={iconSizeClass} />}
          {theme === "system" && <Monitor className={iconSizeClass} />}
          {withText ? <span>Motyw</span> : null}
          <span className="sr-only">Motyw</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <div className="flex items-center gap-2">
            <Sun className={iconSizeClass} />
            <span>Jasny</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <div className="flex items-center gap-2">
            <Moon className={iconSizeClass} />
            <span>Ciemny</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <div className="flex items-center gap-2">
            <Monitor className={iconSizeClass} />
            <span>System</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
