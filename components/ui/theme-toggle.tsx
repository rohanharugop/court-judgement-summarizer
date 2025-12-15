"use client"

import * as React from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {theme === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : theme === "ocean" ? (
            <Palette className="h-5 w-5 text-blue-400/30" />
          ) : theme === "sunset" ? (
            <Palette className="h-5 w-5 text-orange-500" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("ocean")}>
          <div className="mr-2 h-4 w-4 rounded-full bg-gradient-to-r from-blue-300 via-yellow-300 to-green-300/40" />
          Ocean
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("sunset")}>
          <div className="mr-2 h-4 w-4 rounded-full bg-gradient-to-r from-red-700 via-orange-300 to-yellow-400" />
          Sunset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}